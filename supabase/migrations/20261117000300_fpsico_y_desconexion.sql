-- Fase 3. Dos bloques:
--   A. La evaluación psicosocial se apoya en FPSICO (INSST) y NO se puntúa en la plataforma.
--      La plataforma presenta el cuestionario, exporta las respuestas y registra el informe
--      que el técnico genera en la aplicación FPSICO. Solo los seguimientos (ítems propios) se puntúan aquí.
--   B. Desconexión digital: política interna, audiencia, acuse de lectura y formación.

-- ===========================================================================
-- A. Evaluación con puntuación externa
-- ===========================================================================

create type public.origen_instrumento as enum ('propio', 'insst_fpsico');

alter table public.instrumentos
  add column origen public.origen_instrumento not null default 'propio',
  -- Formato de exportación. Se configura desde administración: no hay formato escrito en el código.
  add column export_confirmado boolean not null default false,
  add column export_separador text not null default '' check (char_length(export_separador) <= 3),
  add column export_cabecera text check (export_cabecera is null or char_length(export_cabecera) <= 500),
  add column export_fin_linea text not null default 'crlf' check (export_fin_linea in ('crlf', 'lf'));

alter table public.escala_opciones
  add column codigo_export text check (codigo_export is null or char_length(codigo_export) between 1 and 10);

-- Una evaluación real siempre es FPSICO. Los ítems propios son de seguimiento (o de demostración).
create function privado.fijar_origen_instrumento() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.tipo is distinct from old.tipo then
    raise exception 'El tipo de un instrumento no se puede cambiar.' using errcode = 'P0001';
  end if;
  if new.es_demo then
    new.origen := 'propio';
  elsif new.tipo = 'evaluacion' then
    new.origen := 'insst_fpsico';
  else
    new.origen := 'propio';
  end if;
  return new;
end;
$$;
create trigger instrumentos_origen before insert or update on public.instrumentos
  for each row execute function privado.fijar_origen_instrumento();

update public.instrumentos set origen = origen;

create or replace function public.publicar_instrumento(p_instrumento uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_inst public.instrumentos%rowtype;
begin
  if not privado.es_admin() then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  select * into v_inst from public.instrumentos i where i.id = p_instrumento for update;
  if v_inst.id is null or v_inst.estado <> 'borrador' then
    raise exception 'El instrumento no está en borrador.' using errcode = 'P0001';
  end if;
  if v_inst.origen = 'insst_fpsico' and not v_inst.licencia_confirmada then
    raise exception 'Hace falta la autorización escrita del INSST antes de publicar.' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.items i where i.instrumento_id = p_instrumento) then
    raise exception 'Añade al menos un ítem.' using errcode = 'P0001';
  end if;
  -- Solo los seguimientos se puntúan aquí: solo ellos necesitan niveles.
  if v_inst.tipo = 'pulso' and exists (
    select 1 from public.factores f where f.instrumento_id = p_instrumento
      and (not exists (select 1 from public.items i where i.factor_id = f.id)
        or not exists (select 1 from public.niveles n where n.factor_id = f.id))
  ) then
    raise exception 'Cada factor necesita al menos un ítem y un nivel.' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.items i where i.instrumento_id = p_instrumento
      and (select count(*) from public.escala_opciones eo where eo.escala_id = i.escala_id) < 2
  ) then
    raise exception 'Cada escala usada necesita al menos dos opciones.' using errcode = 'P0001';
  end if;
  update public.instrumentos set estado = 'publicado' where id = p_instrumento;
end;
$$;

-- Resultados: una evaluación nunca se calcula en la plataforma.
create or replace function public.resultados_campana(p_campana uuid, p_grupos uuid[] default '{}'::uuid[]) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
  v_grupos uuid[] := coalesce(p_grupos, '{}'::uuid[]);
  v_anterior public.campanas%rowtype;
  v_res_anterior jsonb;
begin
  select * into v_c from public.campanas c where c.id = p_campana;
  if v_c.id is null or not privado.puede_ver_empresa(v_c.empresa_id) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  if v_c.tipo = 'evaluacion' then
    return jsonb_build_object('disponible', false, 'externa', true);
  end if;
  if v_c.estado <> 'cerrada' then
    return jsonb_build_object('disponible', false);
  end if;
  if cardinality(v_grupos) > 10 or exists (
    select 1 from unnest(v_grupos) as g (id)
    where not exists (
      select 1 from public.grupos gr
      join public.campana_dimensiones cd on cd.dimension_id = gr.dimension_id
      where gr.id = g.id and cd.campana_id = p_campana
    )
  ) then
    raise exception 'Filtro no válido.' using errcode = 'P0001';
  end if;

  select * into v_anterior from public.campanas c
  where c.empresa_id = v_c.empresa_id and c.instrumento_id = v_c.instrumento_id
    and c.estado = 'cerrada' and c.id <> v_c.id and c.cerrada_el < v_c.cerrada_el
  order by c.cerrada_el desc limit 1;

  if v_anterior.id is not null then
    v_res_anterior := privado.calcular_resultados(v_anterior.id, v_grupos)
      || jsonb_build_object('campana', v_anterior.nombre, 'cerrada_el', v_anterior.cerrada_el);
  end if;

  return jsonb_build_object(
    'disponible', true,
    'actual', privado.calcular_resultados(p_campana, v_grupos),
    'anterior', v_res_anterior
  );
end;
$$;

-- Exportación de respuestas para la aplicación FPSICO.
-- Es la ÚNICA salida de respuestas individuales. Condiciones:
--   solo el técnico de prevención asignado, campaña de evaluación cerrada, mínimo de respuestas cumplido,
--   formato confirmado por administración. Sin grupo, sin fecha y en orden aleatorio.
create function public.exportar_respuestas(p_campana uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
  v_inst public.instrumentos%rowtype;
  v_n integer;
  v_lineas jsonb;
begin
  select * into v_c from public.campanas c where c.id = p_campana;
  if v_c.id is null or not privado.es_tecnico_de(v_c.empresa_id) then
    raise exception 'Solo el técnico de prevención asignado puede exportar.' using errcode = '42501';
  end if;
  select * into v_inst from public.instrumentos i where i.id = v_c.instrumento_id;
  if v_c.tipo <> 'evaluacion' then
    raise exception 'Solo se exportan las evaluaciones.' using errcode = 'P0001';
  end if;
  if v_c.estado <> 'cerrada' then
    raise exception 'Cierra la campaña antes de exportar.' using errcode = 'P0001';
  end if;
  if not v_inst.export_confirmado then
    raise exception 'La exportación de este cuestionario todavía no está disponible.' using errcode = 'P0001';
  end if;
  select count(*) into v_n from public.respuestas r where r.campana_id = p_campana;
  if v_n < v_c.minimo_grupo then
    raise exception 'No hay respuestas suficientes para exportar.' using errcode = 'P0001';
  end if;

  select jsonb_agg(l.linea order by random()) into v_lineas
  from (
    select string_agg(coalesce(eo.codigo_export, eo.valor::text), v_inst.export_separador order by f.orden, it.orden, it.id) as linea
    from public.respuestas r
    join public.respuesta_items ri on ri.respuesta_id = r.id
    join public.items it on it.id = ri.item_id
    join public.factores f on f.id = it.factor_id
    join public.escala_opciones eo on eo.escala_id = it.escala_id and eo.valor = ri.valor
    where r.campana_id = p_campana
    group by r.id
  ) l;

  perform privado.anotar_evidencia(v_c.empresa_id, 'respuestas_exportadas', 'Respuestas exportadas para su tratamiento: ' || v_c.nombre,
    jsonb_build_object('campana_id', v_c.id, 'respuestas', v_n));

  return jsonb_build_object(
    'cabecera', v_inst.export_cabecera,
    'fin_linea', v_inst.export_fin_linea,
    'lineas', coalesce(v_lineas, '[]'::jsonb)
  );
end;
$$;
revoke all on function public.exportar_respuestas(uuid) from public, anon;
grant execute on function public.exportar_respuestas(uuid) to authenticated;

-- Informe: ya no sale de un cálculo propio. Es el documento que el técnico genera fuera y sube aquí.
alter table public.informes
  add column documento_ruta text check (documento_ruta is null or char_length(documento_ruta) <= 300),
  add column documento_nombre text check (documento_nombre is null or char_length(documento_nombre) <= 200),
  add column documento_sha256 text check (documento_sha256 is null or documento_sha256 ~ '^[a-f0-9]{64}$'),
  add column documento_subido_el timestamptz;

create or replace function public.preparar_informe(p_campana uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
  v_id uuid;
begin
  select * into v_c from public.campanas c where c.id = p_campana;
  if v_c.id is null or not privado.puede_ver_empresa(v_c.empresa_id) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  if v_c.tipo <> 'evaluacion' then
    raise exception 'Los seguimientos no llevan informe.' using errcode = 'P0001';
  end if;
  if v_c.estado <> 'cerrada' then
    raise exception 'Cierra la campaña antes de preparar el informe.' using errcode = 'P0001';
  end if;
  insert into public.informes (campana_id, creado_por) values (p_campana, (select auth.uid()))
  on conflict (campana_id) do nothing;
  select i.id into v_id from public.informes i where i.campana_id = p_campana;
  return v_id;
end;
$$;

create function public.adjuntar_informe(p_informe uuid, p_ruta text, p_nombre text, p_sha256 text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_i public.informes%rowtype;
  v_empresa uuid;
begin
  select * into v_i from public.informes i where i.id = p_informe for update;
  v_empresa := privado.empresa_de_informe(p_informe);
  if v_i.id is null or not privado.es_tecnico_de(v_empresa) then
    raise exception 'Solo el técnico de prevención asignado puede subir el informe.' using errcode = '42501';
  end if;
  if v_i.estado <> 'borrador' then
    raise exception 'El informe ya está firmado.' using errcode = 'P0001';
  end if;
  if p_ruta is null or p_ruta not like v_empresa::text || '/%' then
    raise exception 'Ruta de documento no válida.' using errcode = 'P0001';
  end if;
  update public.informes set
    documento_ruta = p_ruta, documento_nombre = left(p_nombre, 200), documento_sha256 = p_sha256, documento_subido_el = now()
  where id = p_informe;
end;
$$;
revoke all on function public.adjuntar_informe(uuid, text, text, text) from public, anon;
grant execute on function public.adjuntar_informe(uuid, text, text, text) to authenticated;

create or replace function public.firmar_informe(p_informe uuid, p_nombre text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_i public.informes%rowtype;
  v_c public.campanas%rowtype;
  v_n integer;
begin
  select * into v_i from public.informes i where i.id = p_informe for update;
  if v_i.id is null then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  select * into v_c from public.campanas c where c.id = v_i.campana_id;
  if not privado.es_tecnico_de(v_c.empresa_id) then
    raise exception 'Solo el técnico de prevención asignado puede firmar.' using errcode = '42501';
  end if;
  if v_i.estado <> 'borrador' then
    raise exception 'El informe ya está firmado.' using errcode = 'P0001';
  end if;
  if v_i.documento_ruta is null then
    raise exception 'Sube antes el informe generado en la aplicación.' using errcode = 'P0001';
  end if;
  if p_nombre is null or char_length(btrim(p_nombre)) < 3 then
    raise exception 'Escribe tu nombre completo para firmar.' using errcode = 'P0001';
  end if;
  select count(*) into v_n from public.respuestas r where r.campana_id = v_c.id;

  -- Foto de lo registrado. No hay puntuaciones: la plataforma no las calcula.
  update public.informes set
    estado = 'firmado',
    datos = jsonb_build_object(
      'campana', jsonb_build_object('nombre', v_c.nombre, 'abierta_el', v_c.abierta_el, 'cerrada_el', v_c.cerrada_el,
        'plantilla_invitada', v_c.plantilla_invitada, 'respuestas', v_n),
      'instrumento', (select jsonb_build_object('nombre', ins.nombre, 'origen', ins.origen, 'es_demo', ins.es_demo)
        from public.instrumentos ins where ins.id = v_c.instrumento_id),
      'documento', jsonb_build_object('nombre', v_i.documento_nombre, 'sha256', v_i.documento_sha256),
      'observaciones', coalesce((
        select jsonb_agg(jsonb_build_object('texto', o.texto) order by o.creado_el)
        from public.informe_observaciones o where o.informe_id = p_informe), '[]'::jsonb)
    ),
    firmado_por = (select auth.uid()),
    firmante_nombre = btrim(p_nombre),
    firmado_el = now()
  where id = p_informe;

  perform privado.anotar_evidencia(v_c.empresa_id, 'informe_firmado', 'Informe de evaluación registrado y firmado: ' || v_c.nombre,
    jsonb_build_object('informe_id', p_informe, 'campana_id', v_c.id, 'firmante', btrim(p_nombre),
      'documento', v_i.documento_nombre, 'sha256', v_i.documento_sha256));
end;
$$;

grant update (export_confirmado, export_separador, export_cabecera, export_fin_linea) on public.instrumentos to authenticated;

-- ===========================================================================
-- Documentos adjuntos (privado). Ruta obligatoria: <empresa_id>/<archivo>. Solo PDF.
-- ===========================================================================

create function privado.edita_empresa(p_empresa uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.es_tecnico_de(p_empresa) or privado.es_cuenta_de(p_empresa);
$$;
revoke all on function privado.edita_empresa(uuid) from public;
grant execute on function privado.edita_empresa(uuid) to authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos', 'documentos', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- Se suben y se leen. No se modifican ni se borran: son evidencia.
create policy documentos_subir on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    and privado.edita_empresa(((storage.foldername(name))[1])::uuid)
  );
create policy documentos_leer on storage.objects for select to authenticated
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    and privado.puede_ver_empresa(((storage.foldername(name))[1])::uuid)
  );

-- ===========================================================================
-- B. Desconexión digital
-- ===========================================================================

create type public.estado_politica as enum ('borrador', 'aprobada');

-- Plantillas de política. Las redacta y revisa administración. No hay texto legal en el código.
create table public.politica_plantillas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 160),
  estado public.estado_instrumento not null default 'borrador',
  revisada_juridicamente boolean not null default false,
  revision_nota text check (revision_nota is null or char_length(revision_nota) <= 1000),
  es_demo boolean not null default false,
  creado_el timestamptz not null default now()
);

create table public.politica_plantilla_secciones (
  id uuid primary key default gen_random_uuid(),
  plantilla_id uuid not null references public.politica_plantillas (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 200),
  cuerpo text not null default '' check (char_length(cuerpo) <= 20000),
  ayuda text check (ayuda is null or char_length(ayuda) <= 1000),
  orden integer not null default 0
);
create index politica_plantilla_secciones_idx on public.politica_plantilla_secciones (plantilla_id);

create function privado.exigir_plantilla_en_borrador() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_fila record;
  v_estado public.estado_instrumento;
begin
  if tg_op = 'DELETE' then
    v_fila := old;
  else
    v_fila := new;
  end if;
  select p.estado into v_estado from public.politica_plantillas p where p.id = v_fila.plantilla_id;
  if v_estado is not null and v_estado <> 'borrador' then
    raise exception 'La plantilla ya está publicada y no se puede modificar.' using errcode = 'P0001';
  end if;
  return v_fila;
end;
$$;
create trigger plantilla_secciones_en_borrador before insert or update or delete on public.politica_plantilla_secciones
  for each row execute function privado.exigir_plantilla_en_borrador();

create function public.publicar_plantilla_politica(p_plantilla uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_p public.politica_plantillas%rowtype;
begin
  if not privado.es_admin() then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  select * into v_p from public.politica_plantillas p where p.id = p_plantilla for update;
  if v_p.id is null or v_p.estado <> 'borrador' then
    raise exception 'La plantilla no está en borrador.' using errcode = 'P0001';
  end if;
  if not v_p.es_demo and not v_p.revisada_juridicamente then
    raise exception 'La plantilla necesita revisión jurídica antes de publicarse.' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.politica_plantilla_secciones s where s.plantilla_id = p_plantilla) then
    raise exception 'Añade al menos una sección.' using errcode = 'P0001';
  end if;
  update public.politica_plantillas set estado = 'publicado' where id = p_plantilla;
end;
$$;

create function public.retirar_plantilla_politica(p_plantilla uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not privado.es_admin() then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  update public.politica_plantillas set estado = 'retirado' where id = p_plantilla and estado = 'publicado';
end;
$$;

-- Política de cada empresa. Cada versión aprobada queda cerrada con fecha.
create table public.politicas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  plantilla_id uuid references public.politica_plantillas (id) on delete set null,
  version integer not null check (version >= 1),
  estado public.estado_politica not null default 'borrador',
  -- Lista de secciones: [{ "titulo": "...", "cuerpo": "..." }]
  secciones jsonb not null default '[]'::jsonb check (jsonb_typeof(secciones) = 'array'),
  token_acuse text unique,
  aprobada_por uuid references public.perfiles (id) on delete set null,
  aprobada_nombre text check (aprobada_nombre is null or char_length(aprobada_nombre) between 3 and 160),
  aprobada_el timestamptz,
  creada_por uuid references public.perfiles (id) on delete set null,
  creada_el timestamptz not null default now(),
  unique (empresa_id, version)
);

create function privado.proteger_politica_aprobada() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.estado = 'aprobada' and (
    new.secciones is distinct from old.secciones or new.estado is distinct from old.estado
    or new.version is distinct from old.version or new.aprobada_el is distinct from old.aprobada_el
    or new.aprobada_nombre is distinct from old.aprobada_nombre or new.empresa_id is distinct from old.empresa_id
  ) then
    raise exception 'Esta versión de la política está aprobada y no se puede modificar.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger politicas_aprobadas before update on public.politicas
  for each row execute function privado.proteger_politica_aprobada();

create function privado.empresa_de_politica(p_politica uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select p.empresa_id from public.politicas p where p.id = p_politica;
$$;
revoke all on function privado.empresa_de_politica(uuid) from public;
grant execute on function privado.empresa_de_politica(uuid) to authenticated, service_role;

create function public.iniciar_politica(p_empresa uuid, p_plantilla uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_secciones jsonb;
begin
  if not privado.edita_empresa(p_empresa) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  if exists (select 1 from public.politicas p where p.empresa_id = p_empresa and p.estado = 'borrador') then
    raise exception 'Ya hay un borrador abierto.' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.politica_plantillas t where t.id = p_plantilla and t.estado = 'publicado') then
    raise exception 'La plantilla no está disponible.' using errcode = 'P0001';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('titulo', s.titulo, 'cuerpo', s.cuerpo, 'ayuda', s.ayuda) order by s.orden, s.id), '[]'::jsonb)
    into v_secciones from public.politica_plantilla_secciones s where s.plantilla_id = p_plantilla;

  insert into public.politicas (empresa_id, plantilla_id, version, secciones, creada_por)
  values (
    p_empresa, p_plantilla,
    (select coalesce(max(p.version), 0) + 1 from public.politicas p where p.empresa_id = p_empresa),
    v_secciones, (select auth.uid())
  ) returning id into v_id;
  return v_id;
end;
$$;

create function public.aprobar_politica(p_politica uuid, p_nombre text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_p public.politicas%rowtype;
begin
  select * into v_p from public.politicas p where p.id = p_politica for update;
  if v_p.id is null or not privado.edita_empresa(v_p.empresa_id) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  if v_p.estado <> 'borrador' then
    raise exception 'Esta versión ya está aprobada.' using errcode = 'P0001';
  end if;
  if p_nombre is null or char_length(btrim(p_nombre)) < 3 then
    raise exception 'Escribe el nombre de quien aprueba.' using errcode = 'P0001';
  end if;
  if jsonb_array_length(v_p.secciones) = 0 or exists (
    select 1 from jsonb_array_elements(v_p.secciones) s where btrim(coalesce(s ->> 'cuerpo', '')) = ''
  ) then
    raise exception 'Completa todas las secciones antes de aprobar.' using errcode = 'P0001';
  end if;
  update public.politicas set
    estado = 'aprobada', aprobada_por = (select auth.uid()), aprobada_nombre = btrim(p_nombre), aprobada_el = now()
  where id = p_politica;
  perform privado.anotar_evidencia(v_p.empresa_id, 'politica_aprobada', 'Política de desconexión digital aprobada. Versión ' || v_p.version,
    jsonb_build_object('politica_id', v_p.id, 'version', v_p.version, 'aprueba', btrim(p_nombre),
      'sha256', encode(extensions.digest(v_p.secciones::text, 'sha256'), 'hex')));
end;
$$;

-- Abre o cierra el acuse de lectura de una versión aprobada.
create function public.cambiar_acuse(p_politica uuid, p_abrir boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_p public.politicas%rowtype;
begin
  select * into v_p from public.politicas p where p.id = p_politica for update;
  if v_p.id is null or not privado.edita_empresa(v_p.empresa_id) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  if v_p.estado <> 'aprobada' then
    raise exception 'Aprueba la política antes de pedir el acuse.' using errcode = 'P0001';
  end if;
  if p_abrir and v_p.token_acuse is null then
    update public.politicas set token_acuse = translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_') where id = p_politica;
    perform privado.anotar_evidencia(v_p.empresa_id, 'acuse_abierto', 'Acuse de lectura abierto. Versión ' || v_p.version,
      jsonb_build_object('politica_id', v_p.id));
  elsif not p_abrir and v_p.token_acuse is not null then
    update public.politicas set token_acuse = null where id = p_politica;
    perform privado.anotar_evidencia(v_p.empresa_id, 'acuse_cerrado', 'Acuse de lectura cerrado. Versión ' || v_p.version,
      jsonb_build_object('politica_id', v_p.id, 'acuses', (select count(*) from public.acuses a where a.politica_id = v_p.id)));
  end if;
end;
$$;

-- Acuses de lectura. Son NOMINALES y van en tablas sin ninguna relación con los cuestionarios.
create table public.acuses (
  id uuid primary key default gen_random_uuid(),
  politica_id uuid not null references public.politicas (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 3 and 160),
  registrado_el timestamptz not null default now()
);
create index acuses_politica_idx on public.acuses (politica_id);

create table public.audiencias (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  politica_id uuid references public.politicas (id) on delete set null,
  fecha date not null,
  asistentes text not null check (char_length(asistentes) between 3 and 4000),
  notas text check (notas is null or char_length(notas) <= 4000),
  acta_ruta text check (acta_ruta is null or char_length(acta_ruta) <= 300),
  acta_nombre text check (acta_nombre is null or char_length(acta_nombre) <= 200),
  acta_sha256 text check (acta_sha256 is null or acta_sha256 ~ '^[a-f0-9]{64}$'),
  creada_por uuid references public.perfiles (id) on delete set null,
  creada_el timestamptz not null default now(),
  check (acta_ruta is null or acta_ruta like empresa_id::text || '/%')
);
create index audiencias_empresa_idx on public.audiencias (empresa_id);

create table public.formaciones (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 2 and 200),
  fecha date not null,
  descripcion text check (descripcion is null or char_length(descripcion) <= 4000),
  participantes integer check (participantes is null or participantes between 1 and 100000),
  documento_ruta text check (documento_ruta is null or char_length(documento_ruta) <= 300),
  documento_nombre text check (documento_nombre is null or char_length(documento_nombre) <= 200),
  documento_sha256 text check (documento_sha256 is null or documento_sha256 ~ '^[a-f0-9]{64}$'),
  creada_por uuid references public.perfiles (id) on delete set null,
  creada_el timestamptz not null default now(),
  check (documento_ruta is null or documento_ruta like empresa_id::text || '/%')
);
create index formaciones_empresa_idx on public.formaciones (empresa_id);

-- Audiencias, formaciones y acuses son evidencia: no se modifican ni se borran.
create trigger acuses_inalterables before update or delete on public.acuses
  for each row execute function privado.bloquear_cambios();
create trigger audiencias_inalterables before update or delete on public.audiencias
  for each row execute function privado.bloquear_cambios();
create trigger formaciones_inalterables before update or delete on public.formaciones
  for each row execute function privado.bloquear_cambios();

create function privado.al_registrar_desconexion() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'audiencias' then
    perform privado.anotar_evidencia(new.empresa_id, 'audiencia_registrada',
      'Audiencia a la representación de las personas trabajadoras del ' || to_char(new.fecha, 'DD/MM/YYYY'),
      jsonb_build_object('audiencia_id', new.id, 'acta', new.acta_nombre, 'sha256', new.acta_sha256));
  else
    perform privado.anotar_evidencia(new.empresa_id, 'formacion_registrada',
      'Formación o sensibilización: ' || new.titulo || ' (' || to_char(new.fecha, 'DD/MM/YYYY') || ')',
      jsonb_build_object('formacion_id', new.id, 'participantes', new.participantes, 'documento', new.documento_nombre));
  end if;
  return new;
end;
$$;
create trigger audiencias_evidencia after insert on public.audiencias
  for each row execute function privado.al_registrar_desconexion();
create trigger formaciones_evidencia after insert on public.formaciones
  for each row execute function privado.al_registrar_desconexion();

-- Acuse sin cuenta. Solo lo llama el servidor.
create function public.obtener_politica_acuse(p_token text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'empresa', e.nombre, 'es_demo', e.es_demo, 'version', p.version, 'aprobada_el', p.aprobada_el,
    'secciones', (select jsonb_agg(jsonb_build_object('titulo', s ->> 'titulo', 'cuerpo', s ->> 'cuerpo')) from jsonb_array_elements(p.secciones) s)
  )
  from public.politicas p join public.empresas e on e.id = p.empresa_id
  where p_token is not null and char_length(p_token) between 20 and 80
    and p.token_acuse = p_token and p.estado = 'aprobada';
$$;

create function public.registrar_acuse(p_token text, p_nombre text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if p_token is null or char_length(p_token) not between 20 and 80 then
    return 'no_valido';
  end if;
  select p.id into v_id from public.politicas p where p.token_acuse = p_token and p.estado = 'aprobada';
  if v_id is null then
    return 'no_valido';
  end if;
  if p_nombre is null or char_length(btrim(p_nombre)) not between 3 and 160 then
    return 'nombre';
  end if;
  insert into public.acuses (politica_id, nombre) values (v_id, btrim(p_nombre));
  return 'ok';
end;
$$;

revoke all on function
  public.publicar_plantilla_politica(uuid), public.retirar_plantilla_politica(uuid),
  public.iniciar_politica(uuid, uuid), public.aprobar_politica(uuid, text), public.cambiar_acuse(uuid, boolean),
  public.obtener_politica_acuse(text), public.registrar_acuse(text, text)
from public, anon, authenticated;
grant execute on function
  public.publicar_plantilla_politica(uuid), public.retirar_plantilla_politica(uuid),
  public.iniciar_politica(uuid, uuid), public.aprobar_politica(uuid, text), public.cambiar_acuse(uuid, boolean)
to authenticated;
grant execute on function public.obtener_politica_acuse(text), public.registrar_acuse(text, text) to service_role;

revoke all on function
  privado.fijar_origen_instrumento(), privado.exigir_plantilla_en_borrador(),
  privado.proteger_politica_aprobada(), privado.al_registrar_desconexion()
from public;

-- Permisos de tabla
revoke all on
  public.politica_plantillas, public.politica_plantilla_secciones, public.politicas,
  public.acuses, public.audiencias, public.formaciones
from anon, authenticated;

grant select, delete on public.politica_plantillas to authenticated;
grant insert (nombre) on public.politica_plantillas to authenticated;
grant update (nombre, revisada_juridicamente, revision_nota) on public.politica_plantillas to authenticated;
grant select, insert, update, delete on public.politica_plantilla_secciones to authenticated;

grant select, delete on public.politicas to authenticated;
grant update (secciones) on public.politicas to authenticated;
grant select on public.acuses to authenticated;
grant select on public.audiencias, public.formaciones to authenticated;
grant insert (empresa_id, politica_id, fecha, asistentes, notas, acta_ruta, acta_nombre, acta_sha256, creada_por) on public.audiencias to authenticated;
grant insert (empresa_id, titulo, fecha, descripcion, participantes, documento_ruta, documento_nombre, documento_sha256, creada_por) on public.formaciones to authenticated;
grant all on all tables in schema public to service_role;

alter table public.politica_plantillas enable row level security;
alter table public.politica_plantilla_secciones enable row level security;
alter table public.politicas enable row level security;
alter table public.acuses enable row level security;
alter table public.audiencias enable row level security;
alter table public.formaciones enable row level security;

create policy plantillas_ver on public.politica_plantillas for select to authenticated
  using (privado.es_admin() or estado <> 'borrador');
create policy plantillas_crear on public.politica_plantillas for insert to authenticated with check (privado.es_admin());
create policy plantillas_editar on public.politica_plantillas for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy plantillas_borrar on public.politica_plantillas for delete to authenticated
  using (privado.es_admin() and estado = 'borrador');
create policy plantilla_secciones_ver on public.politica_plantilla_secciones for select to authenticated
  using (exists (select 1 from public.politica_plantillas p where p.id = plantilla_id));
create policy plantilla_secciones_admin on public.politica_plantilla_secciones for all to authenticated
  using (privado.es_admin()) with check (privado.es_admin());

-- Política, audiencia y formación: las editan el técnico y la empresa. Administración y partner solo leen.
create policy politicas_ver on public.politicas for select to authenticated
  using (privado.puede_ver_empresa(empresa_id));
create policy politicas_editar on public.politicas for update to authenticated
  using (privado.edita_empresa(empresa_id) and estado = 'borrador')
  with check (privado.edita_empresa(empresa_id) and estado = 'borrador');
create policy politicas_borrar on public.politicas for delete to authenticated
  using (privado.edita_empresa(empresa_id) and estado = 'borrador');

create policy acuses_ver on public.acuses for select to authenticated
  using (privado.puede_ver_empresa(privado.empresa_de_politica(politica_id)));

create policy audiencias_ver on public.audiencias for select to authenticated
  using (privado.puede_ver_empresa(empresa_id));
create policy audiencias_crear on public.audiencias for insert to authenticated
  with check (
    creada_por = (select auth.uid()) and privado.edita_empresa(empresa_id)
    and (politica_id is null or privado.empresa_de_politica(politica_id) = empresa_id)
  );
create policy formaciones_ver on public.formaciones for select to authenticated
  using (privado.puede_ver_empresa(empresa_id));
create policy formaciones_crear on public.formaciones for insert to authenticated
  with check (creada_por = (select auth.uid()) and privado.edita_empresa(empresa_id));

-- Pendientes
update public.pendientes
set descripcion = 'FPSICO 4.1 (INSST): banco de ítems vacío. Falta la autorización escrita del INSST. No copiar ítems hasta tenerla.'
where clave = 'instrumento_licencia';

insert into public.pendientes (clave, modulo, descripcion) values
  ('fpsico_formato_txt', 'Evaluación psicosocial', 'Formato exacto del .txt de FPSICO 3.1 importable en FPSICO 4.1: comprobar en el manual técnico y de uso de FPSICO 4.1.'),
  ('seguimiento_items', 'Evaluación psicosocial', 'Los seguimientos usan ítems propios. Faltan por redactar y validar.')
on conflict (clave) do nothing;

-- El cuestionario que ve la persona trabajadora incluye el origen del instrumento,
-- para poder mostrar la mención obligatoria cuando procede del INSST.
create or replace function public.obtener_cuestionario(p_acceso text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v record;
  v_c public.campanas%rowtype;
begin
  select * into v from privado.resolver_acceso(p_acceso);
  if v.motivo <> 'ok' then
    return jsonb_build_object('estado', v.motivo);
  end if;
  select * into v_c from public.campanas c where c.id = v.campana_id;

  return jsonb_build_object(
    'estado', 'ok',
    'campana', jsonb_build_object('nombre', v_c.nombre, 'tipo', v_c.tipo, 'minimo_grupo', v_c.minimo_grupo),
    'empresa', (select e.nombre from public.empresas e where e.id = v_c.empresa_id),
    'instrumento', (select jsonb_build_object('nombre', i.nombre, 'descripcion', i.descripcion,
        'minutos', i.minutos_estimados, 'es_demo', i.es_demo, 'origen', i.origen)
      from public.instrumentos i where i.id = v_c.instrumento_id),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', it.id, 'enunciado', it.enunciado,
        'opciones', (select jsonb_agg(jsonb_build_object('valor', eo.valor, 'etiqueta', eo.etiqueta) order by eo.orden, eo.valor)
          from public.escala_opciones eo where eo.escala_id = it.escala_id)
      ) order by f.orden, it.orden, it.id)
      from public.items it join public.factores f on f.id = it.factor_id
      where it.instrumento_id = v_c.instrumento_id), '[]'::jsonb),
    'dimensiones', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', d.id, 'nombre', d.nombre,
        'grupos', (select jsonb_agg(jsonb_build_object('id', g.id, 'nombre', g.nombre) order by g.orden, g.nombre)
          from public.grupos g where g.dimension_id = d.id)
      ) order by d.nombre)
      from public.campana_dimensiones cd join public.dimensiones d on d.id = cd.dimension_id
      where cd.campana_id = v_c.id), '[]'::jsonb)
  );
end;
$$;

-- Solo los seguimientos preguntan el grupo. La exportación de una evaluación no lo usa:
-- preguntarlo sería recoger un dato que no hace falta.
create function privado.campana_es_seguimiento(p_campana uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.campanas c where c.id = p_campana and c.tipo = 'pulso');
$$;
revoke all on function privado.campana_es_seguimiento(uuid) from public;
grant execute on function privado.campana_es_seguimiento(uuid) to authenticated, service_role;

drop policy campana_dimensiones_crear on public.campana_dimensiones;
create policy campana_dimensiones_crear on public.campana_dimensiones for insert to authenticated
  with check (
    privado.campana_es_seguimiento(campana_id)
    and privado.campana_en_borrador(campana_id)
    and privado.puede_ver_empresa(privado.empresa_de_campana(campana_id))
    and privado.empresa_de_dimension(dimension_id) = privado.empresa_de_campana(campana_id)
  );
