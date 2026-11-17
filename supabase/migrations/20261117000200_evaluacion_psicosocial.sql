-- Fase 2. Evaluación psicosocial.
-- Motor de cuestionarios configurable, campañas y pulsos, respuestas anónimas,
-- resultados agregados con mínimo de grupo, informes, plan de acción y registro de evidencias.
--
-- Reglas de anonimato que esta migración impone en la base de datos:
--   1. Las tablas de respuestas no tienen usuario, correo, IP ni hora. Solo el día.
--   2. Ningún rol de cliente puede leerlas. Tampoco administración.
--   3. Los resultados salen solo de funciones agregadas, con la campaña ya cerrada.
--   4. Mínimo de grupo: nunca menos de 5 (restricción de tabla). Se aplica a cada
--      filtro, a los filtros combinados y a lo que podría deducirse por resta.

create type public.tipo_instrumento as enum ('evaluacion', 'pulso');
create type public.estado_instrumento as enum ('borrador', 'publicado', 'retirado');
create type public.metodo_puntuacion as enum ('media', 'suma');
create type public.tono_nivel as enum ('favorable', 'intermedio', 'desfavorable');
create type public.estado_campana as enum ('borrador', 'abierta', 'cerrada');
create type public.modo_acceso as enum ('codigos', 'enlace');
create type public.estado_medida as enum ('pendiente', 'en_curso', 'hecha', 'descartada');
create type public.estado_informe as enum ('borrador', 'firmado');

-- ---------------------------------------------------------------------------
-- Instrumentos: todo se configura desde administración. Nada va en el código.
-- ---------------------------------------------------------------------------

create table public.instrumentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 160),
  descripcion text check (descripcion is null or char_length(descripcion) <= 1000),
  tipo public.tipo_instrumento not null default 'evaluacion',
  estado public.estado_instrumento not null default 'borrador',
  licencia_confirmada boolean not null default false,
  licencia_nota text check (licencia_nota is null or char_length(licencia_nota) <= 1000),
  minutos_estimados integer check (minutos_estimados is null or minutos_estimados between 1 and 120),
  es_demo boolean not null default false,
  creado_el timestamptz not null default now()
);

create table public.escalas (
  id uuid primary key default gen_random_uuid(),
  instrumento_id uuid not null references public.instrumentos (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 120)
);
create index escalas_instrumento_idx on public.escalas (instrumento_id);

create table public.escala_opciones (
  id uuid primary key default gen_random_uuid(),
  escala_id uuid not null references public.escalas (id) on delete cascade,
  etiqueta text not null check (char_length(etiqueta) between 1 and 120),
  valor numeric not null,
  orden integer not null default 0,
  unique (escala_id, valor)
);

create table public.factores (
  id uuid primary key default gen_random_uuid(),
  instrumento_id uuid not null references public.instrumentos (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 160),
  descripcion text check (descripcion is null or char_length(descripcion) <= 1000),
  metodo public.metodo_puntuacion not null default 'media',
  orden integer not null default 0
);
create index factores_instrumento_idx on public.factores (instrumento_id);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  instrumento_id uuid not null references public.instrumentos (id) on delete cascade,
  factor_id uuid not null references public.factores (id) on delete cascade,
  escala_id uuid not null references public.escalas (id) on delete restrict,
  enunciado text not null check (char_length(enunciado) between 1 and 600),
  invertido boolean not null default false,
  orden integer not null default 0
);
create index items_instrumento_idx on public.items (instrumento_id);
create index items_factor_idx on public.items (factor_id);

-- Un nivel se aplica a las puntuaciones iguales o superiores a "desde",
-- hasta el siguiente nivel del mismo factor.
create table public.niveles (
  id uuid primary key default gen_random_uuid(),
  factor_id uuid not null references public.factores (id) on delete cascade,
  etiqueta text not null check (char_length(etiqueta) between 1 and 80),
  desde numeric not null,
  tono public.tono_nivel not null default 'intermedio',
  unique (factor_id, desde)
);

-- Un instrumento publicado o retirado ya no cambia: sus campañas dependen de él.
create function privado.exigir_instrumento_en_borrador() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_instrumento uuid;
  v_estado public.estado_instrumento;
  v_fila record;
begin
  if tg_op = 'DELETE' then
    v_fila := old;
  else
    v_fila := new;
  end if;
  if tg_table_name = 'escala_opciones' then
    select e.instrumento_id into v_instrumento from public.escalas e where e.id = v_fila.escala_id;
  elsif tg_table_name = 'niveles' then
    select f.instrumento_id into v_instrumento from public.factores f where f.id = v_fila.factor_id;
  else
    v_instrumento := v_fila.instrumento_id;
  end if;

  select i.estado into v_estado from public.instrumentos i where i.id = v_instrumento;
  -- Si el instrumento ya no existe, es un borrado en cascada: se permite.
  if v_estado is not null and v_estado <> 'borrador' then
    raise exception 'El instrumento ya está publicado y no se puede modificar.' using errcode = 'P0001';
  end if;
  return v_fila;
end;
$$;

create trigger escalas_en_borrador before insert or update or delete on public.escalas
  for each row execute function privado.exigir_instrumento_en_borrador();
create trigger escala_opciones_en_borrador before insert or update or delete on public.escala_opciones
  for each row execute function privado.exigir_instrumento_en_borrador();
create trigger factores_en_borrador before insert or update or delete on public.factores
  for each row execute function privado.exigir_instrumento_en_borrador();
create trigger items_en_borrador before insert or update or delete on public.items
  for each row execute function privado.exigir_instrumento_en_borrador();
create trigger niveles_en_borrador before insert or update or delete on public.niveles
  for each row execute function privado.exigir_instrumento_en_borrador();

create function privado.instrumento_visible(p_instrumento uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.es_admin() or exists (
    select 1 from public.instrumentos i where i.id = p_instrumento and i.estado <> 'borrador'
  );
$$;

-- ---------------------------------------------------------------------------
-- Estructura de la empresa: dimensiones y grupos (por ejemplo, departamento)
-- ---------------------------------------------------------------------------

create table public.dimensiones (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 80),
  unique (empresa_id, nombre)
);

create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  dimension_id uuid not null references public.dimensiones (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 80),
  orden integer not null default 0,
  unique (dimension_id, nombre)
);

create function privado.empresa_de_dimension(p_dimension uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select d.empresa_id from public.dimensiones d where d.id = p_dimension;
$$;

-- ---------------------------------------------------------------------------
-- Campañas y pulsos
-- ---------------------------------------------------------------------------

create table public.campanas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  instrumento_id uuid not null references public.instrumentos (id) on delete restrict,
  tipo public.tipo_instrumento not null default 'evaluacion',
  nombre text not null check (char_length(nombre) between 2 and 160),
  estado public.estado_campana not null default 'borrador',
  modo_acceso public.modo_acceso not null default 'codigos',
  token_enlace text unique,
  plantilla_invitada integer check (plantilla_invitada is null or plantilla_invitada between 1 and 100000),
  -- El mínimo de grupo se puede subir, nunca bajar de 5.
  minimo_grupo integer not null default 5 check (minimo_grupo between 5 and 50),
  abierta_el timestamptz,
  cerrada_el timestamptz,
  creada_por uuid references public.perfiles (id) on delete set null,
  creada_el timestamptz not null default now()
);
create index campanas_empresa_idx on public.campanas (empresa_id);

create table public.campana_dimensiones (
  campana_id uuid not null references public.campanas (id) on delete cascade,
  dimension_id uuid not null references public.dimensiones (id) on delete restrict,
  primary key (campana_id, dimension_id)
);

create function privado.empresa_de_campana(p_campana uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select c.empresa_id from public.campanas c where c.id = p_campana;
$$;

create function privado.campana_en_borrador(p_campana uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.campanas c where c.id = p_campana and c.estado = 'borrador');
$$;

create function privado.al_crear_campana() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_inst public.instrumentos%rowtype;
begin
  select * into v_inst from public.instrumentos i where i.id = new.instrumento_id;
  if v_inst.id is null or v_inst.estado <> 'publicado' then
    raise exception 'El instrumento no está publicado.' using errcode = 'P0001';
  end if;
  new.tipo := v_inst.tipo;
  new.estado := 'borrador';
  new.token_enlace := null;
  new.abierta_el := null;
  new.cerrada_el := null;
  return new;
end;
$$;
create trigger campanas_al_crear before insert on public.campanas
  for each row execute function privado.al_crear_campana();

-- Códigos de un solo uso. Se guarda solo su resumen. No hay relación con respuestas
-- ni fecha de uso: saber que un código se usó no dice qué se respondió.
create table public.codigos_acceso (
  id uuid primary key default gen_random_uuid(),
  campana_id uuid not null references public.campanas (id) on delete cascade,
  codigo_hash text not null unique,
  usado boolean not null default false
);
create index codigos_campana_idx on public.codigos_acceso (campana_id);

-- ---------------------------------------------------------------------------
-- Respuestas anónimas
-- ---------------------------------------------------------------------------

create table public.respuestas (
  id uuid primary key default gen_random_uuid(),
  campana_id uuid not null references public.campanas (id) on delete cascade,
  dia date not null default current_date
);
create index respuestas_campana_idx on public.respuestas (campana_id);

create table public.respuesta_items (
  respuesta_id uuid not null references public.respuestas (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete restrict,
  valor numeric not null,
  primary key (respuesta_id, item_id)
);

create table public.respuesta_grupos (
  respuesta_id uuid not null references public.respuestas (id) on delete cascade,
  grupo_id uuid not null references public.grupos (id) on delete restrict,
  primary key (respuesta_id, grupo_id)
);
create index respuesta_grupos_grupo_idx on public.respuesta_grupos (grupo_id);

-- ---------------------------------------------------------------------------
-- Informes, plan de acción y evidencias
-- ---------------------------------------------------------------------------

create table public.informes (
  id uuid primary key default gen_random_uuid(),
  campana_id uuid not null unique references public.campanas (id) on delete cascade,
  estado public.estado_informe not null default 'borrador',
  -- Foto de los resultados agregados en el momento de la firma.
  datos jsonb,
  creado_por uuid references public.perfiles (id) on delete set null,
  creado_el timestamptz not null default now(),
  firmado_por uuid references public.perfiles (id) on delete set null,
  firmante_nombre text check (firmante_nombre is null or char_length(firmante_nombre) between 3 and 160),
  firmado_el timestamptz
);

create table public.informe_observaciones (
  id uuid primary key default gen_random_uuid(),
  informe_id uuid not null references public.informes (id) on delete cascade,
  factor_id uuid references public.factores (id) on delete set null,
  texto text not null check (char_length(texto) between 1 and 4000),
  autor uuid references public.perfiles (id) on delete set null,
  creado_el timestamptz not null default now()
);
create index informe_observaciones_informe_idx on public.informe_observaciones (informe_id);

create function privado.empresa_de_informe(p_informe uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select c.empresa_id from public.informes i join public.campanas c on c.id = i.campana_id where i.id = p_informe;
$$;

create function privado.informe_en_borrador(p_informe uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.informes i where i.id = p_informe and i.estado = 'borrador');
$$;

create table public.medidas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  campana_id uuid references public.campanas (id) on delete set null,
  factor_id uuid references public.factores (id) on delete set null,
  titulo text not null check (char_length(titulo) between 2 and 200),
  descripcion text check (descripcion is null or char_length(descripcion) <= 4000),
  responsable text check (responsable is null or char_length(responsable) <= 160),
  fecha_prevista date,
  estado public.estado_medida not null default 'pendiente',
  creada_por uuid references public.perfiles (id) on delete set null,
  creada_el timestamptz not null default now()
);
create index medidas_empresa_idx on public.medidas (empresa_id);

create table public.medida_historial (
  id uuid primary key default gen_random_uuid(),
  medida_id uuid not null references public.medidas (id) on delete cascade,
  autor uuid references public.perfiles (id) on delete set null,
  cuando timestamptz not null default now(),
  campo text not null,
  antes text,
  despues text
);
create index medida_historial_medida_idx on public.medida_historial (medida_id);

-- Registro de evidencias. Solo inserción: nadie modifica ni borra una entrada.
-- La línea de tiempo y las anotaciones llegan en la fase 4.
create table public.evidencias (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  tipo text not null check (tipo ~ '^[a-z_]{3,40}$'),
  titulo text not null check (char_length(titulo) between 2 and 300),
  detalle jsonb not null default '{}'::jsonb,
  autor uuid references public.perfiles (id) on delete set null,
  ocurrido_el timestamptz not null default now()
);
create index evidencias_empresa_idx on public.evidencias (empresa_id, ocurrido_el);

create function privado.bloquear_cambios() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- Única excepción: el borrado completo de una empresa (fase 8), que lo declara antes.
  if tg_op = 'DELETE' and current_setting('lumbra.borrado_empresa', true) = 'si' then
    return old;
  end if;
  raise exception 'Este registro no se puede modificar ni borrar.' using errcode = 'P0001';
end;
$$;

create trigger evidencias_inalterables before update or delete on public.evidencias
  for each row execute function privado.bloquear_cambios();
create trigger medida_historial_inalterable before update or delete on public.medida_historial
  for each row execute function privado.bloquear_cambios();

create function privado.anotar_evidencia(p_empresa uuid, p_tipo text, p_titulo text, p_detalle jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into public.evidencias (empresa_id, tipo, titulo, detalle, autor)
  values (p_empresa, p_tipo, p_titulo, coalesce(p_detalle, '{}'::jsonb), (select auth.uid()));
$$;

create function privado.al_cambiar_medida() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_autor uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    insert into public.medida_historial (medida_id, autor, campo, antes, despues)
    values (new.id, v_autor, 'creada', null, new.titulo);
    perform privado.anotar_evidencia(new.empresa_id, 'medida_creada', 'Medida creada: ' || new.titulo,
      jsonb_build_object('medida_id', new.id));
    return new;
  end if;

  if new.titulo is distinct from old.titulo then
    insert into public.medida_historial (medida_id, autor, campo, antes, despues) values (new.id, v_autor, 'titulo', old.titulo, new.titulo);
  end if;
  if new.descripcion is distinct from old.descripcion then
    insert into public.medida_historial (medida_id, autor, campo, antes, despues) values (new.id, v_autor, 'descripcion', old.descripcion, new.descripcion);
  end if;
  if new.responsable is distinct from old.responsable then
    insert into public.medida_historial (medida_id, autor, campo, antes, despues) values (new.id, v_autor, 'responsable', old.responsable, new.responsable);
  end if;
  if new.fecha_prevista is distinct from old.fecha_prevista then
    insert into public.medida_historial (medida_id, autor, campo, antes, despues) values (new.id, v_autor, 'fecha_prevista', old.fecha_prevista::text, new.fecha_prevista::text);
  end if;
  if new.estado is distinct from old.estado then
    insert into public.medida_historial (medida_id, autor, campo, antes, despues) values (new.id, v_autor, 'estado', old.estado::text, new.estado::text);
    perform privado.anotar_evidencia(new.empresa_id, 'medida_estado', 'Medida «' || new.titulo || '»: ' || new.estado::text,
      jsonb_build_object('medida_id', new.id, 'antes', old.estado, 'despues', new.estado));
  end if;
  return new;
end;
$$;
create trigger medidas_historial after insert or update on public.medidas
  for each row execute function privado.al_cambiar_medida();

-- Un informe firmado no cambia.
create function privado.proteger_informe_firmado() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.estado = 'firmado' then
    raise exception 'El informe está firmado y no se puede modificar.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger informes_firmados before update on public.informes
  for each row execute function privado.proteger_informe_firmado();

-- ---------------------------------------------------------------------------
-- Cálculo de resultados (interno, sin comprobación de permisos)
-- ---------------------------------------------------------------------------

-- Respuestas de una campaña que pertenecen a TODOS los grupos indicados.
create function privado.respuestas_filtradas(p_campana uuid, p_grupos uuid[]) returns setof uuid
language sql stable security definer set search_path = '' as $$
  select r.id
  from public.respuestas r
  where r.campana_id = p_campana
    and not exists (
      select 1 from unnest(coalesce(p_grupos, '{}'::uuid[])) as g (id)
      where not exists (
        select 1 from public.respuesta_grupos rg where rg.respuesta_id = r.id and rg.grupo_id = g.id
      )
    );
$$;

-- Qué grupos se pueden mostrar. En cada dimensión se ocultan los grupos por debajo
-- del mínimo y, si lo oculto (incluido quien no indicó grupo) suma menos del mínimo,
-- también el grupo visible más pequeño: así no se deduce nada por resta.
create function privado.grupos_visibles(p_campana uuid)
returns table (dimension_id uuid, grupo_id uuid, visible boolean)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_min integer;
  v_total integer;
begin
  select c.minimo_grupo into v_min from public.campanas c where c.id = p_campana;
  select count(*) into v_total from public.respuestas r where r.campana_id = p_campana;

  return query
  with conteo as (
    select g.dimension_id as dim, g.id as grupo, count(r.id)::integer as n
    from public.campana_dimensiones cd
    join public.grupos g on g.dimension_id = cd.dimension_id
    left join public.respuesta_grupos rg on rg.grupo_id = g.id
    left join public.respuestas r on r.id = rg.respuesta_id and r.campana_id = p_campana
    where cd.campana_id = p_campana
    group by g.dimension_id, g.id
  ),
  por_dimension as (
    -- Oculto = grupos bajo el mínimo + respuestas sin grupo en esta dimensión.
    select c.dim, (coalesce(sum(c.n) filter (where c.n < v_min), 0) + (v_total - coalesce(sum(c.n), 0)))::integer as ocultos
    from conteo c group by c.dim
  ),
  ordenado as (
    select c.dim, c.grupo, c.n, d.ocultos,
           row_number() over (partition by c.dim order by (c.n >= v_min) desc, c.n asc, c.grupo) as pos
    from conteo c join por_dimension d on d.dim = c.dim
  )
  select o.dim, o.grupo,
         (v_total >= v_min and o.n >= v_min and not (o.ocultos between 1 and v_min - 1 and o.pos = 1))
  from ordenado o;
end;
$$;

create function privado.calcular_resultados(p_campana uuid, p_grupos uuid[]) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_min integer;
  v_total integer;
  v_n integer;
  v_factores jsonb;
  v_grupos uuid[] := coalesce(p_grupos, '{}'::uuid[]);
begin
  select c.minimo_grupo into v_min from public.campanas c where c.id = p_campana;
  if v_min is null then
    return null;
  end if;
  select count(*) into v_total from public.respuestas r where r.campana_id = p_campana;
  select count(*) into v_n from privado.respuestas_filtradas(p_campana, v_grupos);

  -- Celda bajo el mínimo, o resto bajo el mínimo: no se muestra nada.
  if v_n < v_min or (v_total - v_n) between 1 and v_min - 1 then
    return jsonb_build_object('suprimido', true, 'minimo', v_min);
  end if;

  -- Con filtro, cada grupo pedido debe ser visible por sí mismo.
  if cardinality(v_grupos) > 0 and exists (
    select 1 from unnest(v_grupos) as g (id)
    where not exists (
      select 1 from privado.grupos_visibles(p_campana) gv where gv.grupo_id = g.id and gv.visible
    )
  ) then
    return jsonb_build_object('suprimido', true, 'minimo', v_min);
  end if;

  with puntos as (
    select rf.id as respuesta_id, f.id as factor_id,
           case when f.metodo = 'suma' then sum(x.v) else avg(x.v) end as punt
    from privado.respuestas_filtradas(p_campana, v_grupos) as rf (id)
    join public.respuesta_items ri on ri.respuesta_id = rf.id
    join public.items i on i.id = ri.item_id
    join public.factores f on f.id = i.factor_id
    cross join lateral (
      select case when i.invertido
        then (select min(eo.valor) + max(eo.valor) from public.escala_opciones eo where eo.escala_id = i.escala_id) - ri.valor
        else ri.valor end as v
    ) x
    group by rf.id, f.id, f.metodo
  ),
  con_nivel as (
    select p.factor_id, p.punt, (
      select n.id from public.niveles n
      where n.factor_id = p.factor_id and n.desde <= p.punt
      order by n.desde desc limit 1
    ) as nivel_id
    from puntos p
  ),
  por_factor as (
    select cn.factor_id, round(avg(cn.punt), 2) as media, count(*) as n from con_nivel cn group by cn.factor_id
  )
  select jsonb_agg(
    jsonb_build_object(
      'factor_id', f.id,
      'nombre', f.nombre,
      'media', pf.media,
      'nivel', (
        select jsonb_build_object('etiqueta', n.etiqueta, 'tono', n.tono)
        from public.niveles n where n.factor_id = f.id and n.desde <= pf.media
        order by n.desde desc limit 1
      ),
      'distribucion', (
        select jsonb_agg(
          jsonb_build_object(
            'etiqueta', n.etiqueta,
            'tono', n.tono,
            'porcentaje', round(100.0 * (select count(*) from con_nivel c where c.factor_id = f.id and c.nivel_id = n.id) / pf.n)
          ) order by n.desde
        )
        from public.niveles n where n.factor_id = f.id
      )
    ) order by f.orden, f.nombre
  )
  into v_factores
  from public.factores f
  join por_factor pf on pf.factor_id = f.id;

  return jsonb_build_object('suprimido', false, 'n', v_n, 'minimo', v_min, 'factores', coalesce(v_factores, '[]'::jsonb));
end;
$$;

revoke all on all functions in schema privado from public;
grant execute on function
  privado.instrumento_visible(uuid),
  privado.empresa_de_dimension(uuid),
  privado.empresa_de_campana(uuid),
  privado.campana_en_borrador(uuid),
  privado.empresa_de_informe(uuid),
  privado.informe_en_borrador(uuid)
to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Funciones públicas para el panel (cuentas con sesión)
-- ---------------------------------------------------------------------------

create function public.publicar_instrumento(p_instrumento uuid) returns void
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
  if not v_inst.es_demo and not v_inst.licencia_confirmada then
    raise exception 'Confirma antes el instrumento y su licencia.' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.factores f where f.instrumento_id = p_instrumento) then
    raise exception 'Añade al menos un factor.' using errcode = 'P0001';
  end if;
  if exists (
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

create function public.retirar_instrumento(p_instrumento uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not privado.es_admin() then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  update public.instrumentos set estado = 'retirado' where id = p_instrumento and estado = 'publicado';
end;
$$;

create function public.abrir_campana(p_campana uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
begin
  select * into v_c from public.campanas c where c.id = p_campana for update;
  if v_c.id is null or not privado.puede_ver_empresa(v_c.empresa_id) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  if v_c.estado <> 'borrador' then
    raise exception 'La campaña ya se abrió.' using errcode = 'P0001';
  end if;
  update public.campanas set
    estado = 'abierta',
    abierta_el = now(),
    token_enlace = case when v_c.modo_acceso = 'enlace'
      then translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_') else null end
  where id = p_campana;
  perform privado.anotar_evidencia(v_c.empresa_id, 'campana_abierta', 'Campaña abierta: ' || v_c.nombre,
    jsonb_build_object('campana_id', v_c.id, 'tipo', v_c.tipo));
end;
$$;

create function public.cerrar_campana(p_campana uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
  v_n integer;
begin
  select * into v_c from public.campanas c where c.id = p_campana for update;
  if v_c.id is null or not privado.puede_ver_empresa(v_c.empresa_id) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  if v_c.estado <> 'abierta' then
    raise exception 'La campaña no está abierta.' using errcode = 'P0001';
  end if;
  update public.campanas set estado = 'cerrada', cerrada_el = now(), token_enlace = null where id = p_campana;
  select count(*) into v_n from public.respuestas r where r.campana_id = p_campana;
  perform privado.anotar_evidencia(v_c.empresa_id, 'campana_cerrada', 'Campaña cerrada: ' || v_c.nombre,
    jsonb_build_object('campana_id', v_c.id, 'respuestas', v_n, 'plantilla_invitada', v_c.plantilla_invitada));
end;
$$;

-- Genera códigos de un solo uso y los devuelve UNA vez. Después solo queda su resumen.
create function public.generar_codigos(p_campana uuid, p_cantidad integer) returns setof text
language plpgsql security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
  v_alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_codigo text;
  v_bytes bytea;
  v_i integer;
  v_j integer;
begin
  select * into v_c from public.campanas c where c.id = p_campana for update;
  if v_c.id is null or not privado.puede_ver_empresa(v_c.empresa_id) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  if v_c.modo_acceso <> 'codigos' or v_c.estado = 'cerrada' then
    raise exception 'Esta campaña no admite códigos.' using errcode = 'P0001';
  end if;
  if p_cantidad is null or p_cantidad < 1 or p_cantidad > 500 then
    raise exception 'Cantidad no válida.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.codigos_acceso k where k.campana_id = p_campana) + p_cantidad > 5000 then
    raise exception 'Demasiados códigos para una campaña.' using errcode = 'P0001';
  end if;

  for v_i in 1..p_cantidad loop
    v_bytes := extensions.gen_random_bytes(10);
    v_codigo := '';
    for v_j in 0..9 loop
      v_codigo := v_codigo || substr(v_alfabeto, (get_byte(v_bytes, v_j) % 31) + 1, 1);
    end loop;
    insert into public.codigos_acceso (campana_id, codigo_hash)
    values (p_campana, encode(extensions.digest(v_codigo, 'sha256'), 'hex'));
    return next substr(v_codigo, 1, 5) || '-' || substr(v_codigo, 6, 5);
  end loop;
end;
$$;

-- Participación: recuento total, sin desglose. Disponible también con la campaña abierta.
create function public.participacion_campana(p_campana uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
  v_n integer;
begin
  select * into v_c from public.campanas c where c.id = p_campana;
  if v_c.id is null or not privado.puede_ver_empresa(v_c.empresa_id) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  select count(*) into v_n from public.respuestas r where r.campana_id = p_campana;
  return jsonb_build_object(
    'respuestas', v_n,
    'plantilla', v_c.plantilla_invitada,
    'porcentaje', case when v_c.plantilla_invitada is null then null
      else least(100, round(100.0 * v_n / v_c.plantilla_invitada)) end,
    'codigos_generados', (select count(*) from public.codigos_acceso k where k.campana_id = p_campana)
  );
end;
$$;

-- Grupos por los que se puede filtrar. No devuelve recuentos.
create function public.grupos_de_campana(p_campana uuid)
returns table (dimension_id uuid, dimension text, grupo_id uuid, grupo text, visible boolean)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
begin
  select * into v_c from public.campanas c where c.id = p_campana;
  if v_c.id is null or not privado.puede_ver_empresa(v_c.empresa_id) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  return query
    select d.id, d.nombre, g.id, g.nombre, (v_c.estado = 'cerrada' and gv.visible)
    from privado.grupos_visibles(p_campana) gv
    join public.grupos g on g.id = gv.grupo_id
    join public.dimensiones d on d.id = gv.dimension_id
    order by d.nombre, g.orden, g.nombre;
end;
$$;

-- Resultados agregados, solo con la campaña cerrada. Incluye la campaña anterior
-- del mismo instrumento para comparar.
create function public.resultados_campana(p_campana uuid, p_grupos uuid[] default '{}'::uuid[]) returns jsonb
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

create function public.preparar_informe(p_campana uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
  v_id uuid;
begin
  select * into v_c from public.campanas c where c.id = p_campana;
  if v_c.id is null or not privado.puede_ver_empresa(v_c.empresa_id) then
    raise exception 'Sin permiso.' using errcode = '42501';
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

-- Firma: solo el técnico de prevención asignado a la empresa.
create function public.firmar_informe(p_informe uuid, p_nombre text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_i public.informes%rowtype;
  v_c public.campanas%rowtype;
  v_res jsonb;
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
  if p_nombre is null or char_length(btrim(p_nombre)) < 3 then
    raise exception 'Escribe tu nombre completo para firmar.' using errcode = 'P0001';
  end if;

  v_res := privado.calcular_resultados(v_c.id, '{}'::uuid[]);
  if coalesce((v_res ->> 'suprimido')::boolean, true) then
    raise exception 'No hay respuestas suficientes para emitir un informe.' using errcode = 'P0001';
  end if;

  update public.informes set
    estado = 'firmado',
    datos = jsonb_build_object(
      'resultados', v_res,
      'campana', jsonb_build_object('nombre', v_c.nombre, 'tipo', v_c.tipo, 'abierta_el', v_c.abierta_el,
        'cerrada_el', v_c.cerrada_el, 'plantilla_invitada', v_c.plantilla_invitada, 'minimo_grupo', v_c.minimo_grupo),
      'instrumento', (select jsonb_build_object('nombre', ins.nombre, 'es_demo', ins.es_demo)
        from public.instrumentos ins where ins.id = v_c.instrumento_id),
      'observaciones', coalesce((
        select jsonb_agg(jsonb_build_object('factor_id', o.factor_id, 'texto', o.texto) order by o.creado_el)
        from public.informe_observaciones o where o.informe_id = p_informe), '[]'::jsonb)
    ),
    firmado_por = (select auth.uid()),
    firmante_nombre = btrim(p_nombre),
    firmado_el = now()
  where id = p_informe;

  perform privado.anotar_evidencia(v_c.empresa_id, 'informe_firmado', 'Informe firmado: ' || v_c.nombre,
    jsonb_build_object('informe_id', p_informe, 'campana_id', v_c.id, 'firmante', btrim(p_nombre)));
end;
$$;

-- ---------------------------------------------------------------------------
-- Funciones para la persona trabajadora (sin cuenta). Solo las llama el servidor.
-- ---------------------------------------------------------------------------

-- Resuelve un código de un solo uso o el token de un enlace general.
create function privado.resolver_acceso(p_acceso text, out campana_id uuid, out codigo_id uuid, out motivo text)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_limpio text := upper(regexp_replace(coalesce(p_acceso, ''), '[^A-Za-z0-9]', '', 'g'));
  v_k public.codigos_acceso%rowtype;
  v_estado public.estado_campana;
begin
  if char_length(coalesce(p_acceso, '')) between 8 and 80 then
    if char_length(v_limpio) = 10 then
      select * into v_k from public.codigos_acceso k
      where k.codigo_hash = encode(extensions.digest(v_limpio, 'sha256'), 'hex');
    end if;
    if v_k.id is not null then
      campana_id := v_k.campana_id;
      codigo_id := v_k.id;
      if v_k.usado then
        motivo := 'usado';
        return;
      end if;
    else
      select c.id into campana_id from public.campanas c where c.token_enlace = p_acceso;
    end if;
  end if;

  if campana_id is null then
    motivo := 'no_valido';
    return;
  end if;
  select c.estado into v_estado from public.campanas c where c.id = campana_id;
  motivo := case v_estado when 'abierta' then 'ok' when 'cerrada' then 'cerrada' else 'no_abierta' end;
end;
$$;

create function public.obtener_cuestionario(p_acceso text) returns jsonb
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
        'minutos', i.minutos_estimados, 'es_demo', i.es_demo)
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

-- Guarda una respuesta anónima. Devuelve: ok, no_valido, usado, cerrada, no_abierta o incompleto.
create function public.enviar_respuesta(p_acceso text, p_valores jsonb, p_grupos uuid[]) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v record;
  v_c public.campanas%rowtype;
  v_respuesta uuid;
  v_grupos uuid[] := coalesce(p_grupos, '{}'::uuid[]);
begin
  select * into v from privado.resolver_acceso(p_acceso);
  if v.motivo <> 'ok' then
    return v.motivo;
  end if;
  select * into v_c from public.campanas c where c.id = v.campana_id for share;
  if v_c.estado <> 'abierta' then
    return 'cerrada';
  end if;

  if v.codigo_id is not null then
    -- Se marca el código dentro de la misma transacción: dos envíos a la vez no pasan.
    update public.codigos_acceso set usado = true where id = v.codigo_id and not usado;
    if not found then
      return 'usado';
    end if;
  end if;

  if p_valores is null or jsonb_typeof(p_valores) <> 'object' then
    raise exception 'incompleto' using errcode = 'P0002';
  end if;

  -- Todas las preguntas, y solo valores que existen en la escala de cada una.
  if exists (
    select 1 from public.items it
    where it.instrumento_id = v_c.instrumento_id
      and not exists (
        select 1 from jsonb_each_text(p_valores) pv
        join public.escala_opciones eo on eo.escala_id = it.escala_id and eo.valor::text = pv.value
        where pv.key = it.id::text
      )
  ) or (select count(*) from jsonb_object_keys(p_valores))
       <> (select count(*) from public.items it where it.instrumento_id = v_c.instrumento_id) then
    raise exception 'incompleto' using errcode = 'P0002';
  end if;

  -- Grupos: de dimensiones de esta campaña y como mucho uno por dimensión.
  if cardinality(v_grupos) > 0 and (
    exists (
      select 1 from unnest(v_grupos) as g (id)
      where not exists (
        select 1 from public.grupos gr
        join public.campana_dimensiones cd on cd.dimension_id = gr.dimension_id
        where gr.id = g.id and cd.campana_id = v_c.id
      )
    )
    or exists (
      select 1 from unnest(v_grupos) as g (id)
      join public.grupos gr on gr.id = g.id
      group by gr.dimension_id having count(*) > 1
    )
  ) then
    raise exception 'incompleto' using errcode = 'P0002';
  end if;

  insert into public.respuestas (campana_id) values (v_c.id) returning id into v_respuesta;

  insert into public.respuesta_items (respuesta_id, item_id, valor)
  select v_respuesta, it.id, eo.valor
  from public.items it
  join jsonb_each_text(p_valores) pv on pv.key = it.id::text
  join public.escala_opciones eo on eo.escala_id = it.escala_id and eo.valor::text = pv.value
  where it.instrumento_id = v_c.instrumento_id;

  insert into public.respuesta_grupos (respuesta_id, grupo_id)
  select v_respuesta, g.id from unnest(v_grupos) as g (id);

  return 'ok';
exception
  when sqlstate 'P0002' then
    -- Se deshace todo, incluido el marcado del código, y se avisa.
    return 'incompleto';
end;
$$;

-- Borrado completo de una empresa, evidencias incluidas. Solo servidor.
-- La pantalla de administración y su registro llegan en la fase 8.
create function public.borrar_empresa_completa(p_empresa uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform set_config('lumbra.borrado_empresa', 'si', true);
  delete from public.empresas where id = p_empresa;
  perform set_config('lumbra.borrado_empresa', '', true);
end;
$$;
revoke all on function public.borrar_empresa_completa(uuid) from public, anon, authenticated;
grant execute on function public.borrar_empresa_completa(uuid) to service_role;

revoke all on function
  public.publicar_instrumento(uuid), public.retirar_instrumento(uuid),
  public.abrir_campana(uuid), public.cerrar_campana(uuid), public.generar_codigos(uuid, integer),
  public.participacion_campana(uuid), public.grupos_de_campana(uuid),
  public.resultados_campana(uuid, uuid[]), public.preparar_informe(uuid), public.firmar_informe(uuid, text),
  public.obtener_cuestionario(text), public.enviar_respuesta(text, jsonb, uuid[])
from public, anon, authenticated;

grant execute on function
  public.publicar_instrumento(uuid), public.retirar_instrumento(uuid),
  public.abrir_campana(uuid), public.cerrar_campana(uuid), public.generar_codigos(uuid, integer),
  public.participacion_campana(uuid), public.grupos_de_campana(uuid),
  public.resultados_campana(uuid, uuid[]), public.preparar_informe(uuid), public.firmar_informe(uuid, text)
to authenticated;

grant execute on function public.obtener_cuestionario(text), public.enviar_respuesta(text, jsonb, uuid[])
to service_role;

-- ---------------------------------------------------------------------------
-- Permisos de tabla
-- ---------------------------------------------------------------------------

revoke all on
  public.instrumentos, public.escalas, public.escala_opciones, public.factores, public.items, public.niveles,
  public.dimensiones, public.grupos, public.campanas, public.campana_dimensiones, public.codigos_acceso,
  public.respuestas, public.respuesta_items, public.respuesta_grupos,
  public.informes, public.informe_observaciones, public.medidas, public.medida_historial, public.evidencias
from anon, authenticated;

grant select, delete on public.instrumentos to authenticated;
grant insert (nombre, descripcion, tipo, minutos_estimados) on public.instrumentos to authenticated;
grant update (nombre, descripcion, licencia_confirmada, licencia_nota, minutos_estimados) on public.instrumentos to authenticated;

grant select, insert, update, delete on public.escalas, public.escala_opciones, public.factores, public.items, public.niveles to authenticated;

grant select, insert, update, delete on public.dimensiones, public.grupos to authenticated;

grant select, delete on public.campanas to authenticated;
grant insert (empresa_id, instrumento_id, nombre, modo_acceso, plantilla_invitada, minimo_grupo, creada_por) on public.campanas to authenticated;
grant update (nombre, modo_acceso, plantilla_invitada, minimo_grupo) on public.campanas to authenticated;
grant select, insert, delete on public.campana_dimensiones to authenticated;

-- Respuestas y códigos: NINGÚN permiso para cuentas ni visitantes. Solo funciones.

grant select on public.informes to authenticated;
grant select, delete on public.informe_observaciones to authenticated;
grant insert (informe_id, factor_id, texto, autor) on public.informe_observaciones to authenticated;
grant update (texto) on public.informe_observaciones to authenticated;

grant select on public.medidas, public.medida_historial, public.evidencias to authenticated;
grant insert (empresa_id, campana_id, factor_id, titulo, descripcion, responsable, fecha_prevista, creada_por) on public.medidas to authenticated;
grant update (titulo, descripcion, responsable, fecha_prevista, estado) on public.medidas to authenticated;

grant all on all tables in schema public to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.instrumentos enable row level security;
alter table public.escalas enable row level security;
alter table public.escala_opciones enable row level security;
alter table public.factores enable row level security;
alter table public.items enable row level security;
alter table public.niveles enable row level security;
alter table public.dimensiones enable row level security;
alter table public.grupos enable row level security;
alter table public.campanas enable row level security;
alter table public.campana_dimensiones enable row level security;
alter table public.codigos_acceso enable row level security;
alter table public.respuestas enable row level security;
alter table public.respuesta_items enable row level security;
alter table public.respuesta_grupos enable row level security;
alter table public.informes enable row level security;
alter table public.informe_observaciones enable row level security;
alter table public.medidas enable row level security;
alter table public.medida_historial enable row level security;
alter table public.evidencias enable row level security;

-- Instrumentos: administración los gestiona; el resto lee los que no están en borrador.
create policy instrumentos_ver on public.instrumentos for select to authenticated
  using (privado.es_admin() or estado <> 'borrador');
create policy instrumentos_crear on public.instrumentos for insert to authenticated with check (privado.es_admin());
create policy instrumentos_editar on public.instrumentos for update to authenticated
  using (privado.es_admin()) with check (privado.es_admin());
create policy instrumentos_borrar on public.instrumentos for delete to authenticated
  using (privado.es_admin() and estado = 'borrador');

create policy escalas_ver on public.escalas for select to authenticated using (privado.instrumento_visible(instrumento_id));
create policy escalas_admin on public.escalas for all to authenticated using (privado.es_admin()) with check (privado.es_admin());
create policy factores_ver on public.factores for select to authenticated using (privado.instrumento_visible(instrumento_id));
create policy factores_admin on public.factores for all to authenticated using (privado.es_admin()) with check (privado.es_admin());
create policy items_ver on public.items for select to authenticated using (privado.instrumento_visible(instrumento_id));
create policy items_admin on public.items for all to authenticated using (privado.es_admin()) with check (privado.es_admin());
create policy escala_opciones_ver on public.escala_opciones for select to authenticated
  using (exists (select 1 from public.escalas e where e.id = escala_id));
create policy escala_opciones_admin on public.escala_opciones for all to authenticated using (privado.es_admin()) with check (privado.es_admin());
create policy niveles_ver on public.niveles for select to authenticated
  using (exists (select 1 from public.factores f where f.id = factor_id));
create policy niveles_admin on public.niveles for all to authenticated using (privado.es_admin()) with check (privado.es_admin());

-- Estructura de la empresa
create policy dimensiones_todo on public.dimensiones for all to authenticated
  using (privado.puede_ver_empresa(empresa_id)) with check (privado.puede_ver_empresa(empresa_id));
create policy grupos_todo on public.grupos for all to authenticated
  using (privado.puede_ver_empresa(privado.empresa_de_dimension(dimension_id)))
  with check (privado.puede_ver_empresa(privado.empresa_de_dimension(dimension_id)));

-- Campañas
create policy campanas_ver on public.campanas for select to authenticated
  using (privado.puede_ver_empresa(empresa_id));
create policy campanas_crear on public.campanas for insert to authenticated
  with check (privado.puede_ver_empresa(empresa_id) and creada_por = (select auth.uid()));
create policy campanas_editar on public.campanas for update to authenticated
  using (privado.puede_ver_empresa(empresa_id) and estado = 'borrador')
  with check (privado.puede_ver_empresa(empresa_id) and estado = 'borrador');
create policy campanas_borrar on public.campanas for delete to authenticated
  using (privado.puede_ver_empresa(empresa_id) and estado = 'borrador');

create policy campana_dimensiones_ver on public.campana_dimensiones for select to authenticated
  using (privado.puede_ver_empresa(privado.empresa_de_campana(campana_id)));
create policy campana_dimensiones_crear on public.campana_dimensiones for insert to authenticated
  with check (
    privado.campana_en_borrador(campana_id)
    and privado.puede_ver_empresa(privado.empresa_de_campana(campana_id))
    and privado.empresa_de_dimension(dimension_id) = privado.empresa_de_campana(campana_id)
  );
create policy campana_dimensiones_borrar on public.campana_dimensiones for delete to authenticated
  using (privado.campana_en_borrador(campana_id) and privado.puede_ver_empresa(privado.empresa_de_campana(campana_id)));

-- codigos_acceso, respuestas, respuesta_items y respuesta_grupos: sin políticas. Nadie las lee.

-- Informes
create policy informes_ver on public.informes for select to authenticated
  using (privado.puede_ver_empresa(privado.empresa_de_campana(campana_id)));
create policy observaciones_ver on public.informe_observaciones for select to authenticated
  using (privado.puede_ver_empresa(privado.empresa_de_informe(informe_id)));
create policy observaciones_crear on public.informe_observaciones for insert to authenticated
  with check (
    autor = (select auth.uid())
    and privado.informe_en_borrador(informe_id)
    and privado.es_tecnico_de(privado.empresa_de_informe(informe_id))
  );
create policy observaciones_editar on public.informe_observaciones for update to authenticated
  using (privado.informe_en_borrador(informe_id) and privado.es_tecnico_de(privado.empresa_de_informe(informe_id)))
  with check (privado.informe_en_borrador(informe_id) and privado.es_tecnico_de(privado.empresa_de_informe(informe_id)));
create policy observaciones_borrar on public.informe_observaciones for delete to authenticated
  using (privado.informe_en_borrador(informe_id) and privado.es_tecnico_de(privado.empresa_de_informe(informe_id)));

-- Plan de acción: lo editan el técnico y la empresa. Administración y partner solo leen.
create policy medidas_ver on public.medidas for select to authenticated
  using (privado.puede_ver_empresa(empresa_id));
create policy medidas_crear on public.medidas for insert to authenticated
  with check (
    creada_por = (select auth.uid())
    and (privado.es_tecnico_de(empresa_id) or privado.es_cuenta_de(empresa_id))
    and (campana_id is null or privado.empresa_de_campana(campana_id) = empresa_id)
  );
create policy medidas_editar on public.medidas for update to authenticated
  using (privado.es_tecnico_de(empresa_id) or privado.es_cuenta_de(empresa_id))
  with check (privado.es_tecnico_de(empresa_id) or privado.es_cuenta_de(empresa_id));
create policy medida_historial_ver on public.medida_historial for select to authenticated
  using (exists (select 1 from public.medidas m where m.id = medida_id));

create policy evidencias_ver on public.evidencias for select to authenticated
  using (privado.puede_ver_empresa(empresa_id));

-- ---------------------------------------------------------------------------
-- Pendientes de esta fase
-- ---------------------------------------------------------------------------

insert into public.pendientes (clave, modulo, descripcion) values
  ('pulsos_programacion', 'Evaluación psicosocial', 'Los pulsos se lanzan a mano. Falta la programación periódica automática.'),
  ('recordatorios_correo', 'Evaluación psicosocial', 'Los recordatorios generales se copian a mano. Falta el envío por correo a la empresa (Resend).')
on conflict (clave) do nothing;
