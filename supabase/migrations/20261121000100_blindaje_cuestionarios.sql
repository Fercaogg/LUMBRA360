-- ============================================================================
-- Blindaje de los cuestionarios.
--
-- Fuente de la estructura FPSICO: INSST, «FPSICO 4.1. Manual técnico y de uso
-- de la aplicación informática» (mayo de 2022):
--   · Apartado B.3: 44 preguntas, algunas múltiples, que suman 89 ítems.
--   · Anexo II (pág. 79): las 89 respuestas van siempre en el mismo orden y solo
--     admiten valores posibles: de 1 a 4, salvo de 1 a 5 en 10h, 16a-d, 22, 26,
--     34a-d y 40a-d, y de 1 a 3 en 13a-d.
-- Aquí solo se guarda esa numeración y esos rangos, que son públicos. Los
-- enunciados, pesos y baremos NO están en este archivo.
--
-- Qué blinda esta migración:
--   1. Estructura FPSICO de referencia (89 posiciones, sin textos).
--   2. Cada ítem de un cuestionario FPSICO lleva su número (1, 2, … 10a … 44) y
--      no se publica si no están los 89, cada uno con la escala exacta que admite.
--   3. El cuestionario y la exportación siguen el orden de FPSICO, no el de los
--      factores (antes, un ítem fuera de sitio desplazaba todas las columnas).
--   4. La exportación comprueba cada respuesta, posición a posición.
--   5. Las evaluaciones solo se responden con códigos de un solo uso. El enlace
--      general de un seguimiento tiene tope: las personas invitadas.
--   6. Respuestas inalterables: solo entran con la campaña abierta, con ítems de
--      su cuestionario, y nadie las cambia ni las borra (salvo el borrado
--      completo de la empresa). Un código usado no vuelve a valer.
--   7. Vista previa del cuestionario para el panel (también en la demostración),
--      sin posibilidad de responder.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Estructura FPSICO de referencia
-- ---------------------------------------------------------------------------

create table public.fpsico_estructura (
  posicion smallint primary key check (posicion between 1 and 89),
  codigo text not null unique check (codigo ~ '^[1-9][0-9]?[a-h]?$'),
  pregunta smallint not null check (pregunta between 1 and 44),
  valor_max smallint not null check (valor_max in (3, 4, 5))
);

comment on table public.fpsico_estructura is
  'Numeración y rango de respuesta de los 89 ítems de FPSICO 4.1 (manual del INSST, apdo. B.3 y Anexo II). Sin enunciados.';

insert into public.fpsico_estructura (posicion, codigo, pregunta, valor_max) values
  (1,'1',1,4), (2,'2',2,4), (3,'3',3,4), (4,'4',4,4), (5,'5',5,4), (6,'6',6,4), (7,'7',7,4), (8,'8',8,4),
  (9,'9',9,4), (10,'10a',10,4), (11,'10b',10,4), (12,'10c',10,4), (13,'10d',10,4), (14,'10e',10,4), (15,'10f',10,4), (16,'10g',10,4),
  (17,'10h',10,5), (18,'11a',11,4), (19,'11b',11,4), (20,'11c',11,4), (21,'11d',11,4), (22,'11e',11,4), (23,'11f',11,4), (24,'11g',11,4),
  (25,'12a',12,4), (26,'12b',12,4), (27,'12c',12,4), (28,'12d',12,4), (29,'13a',13,3), (30,'13b',13,3), (31,'13c',13,3), (32,'13d',13,3),
  (33,'14a',14,4), (34,'14b',14,4), (35,'14c',14,4), (36,'14d',14,4), (37,'14e',14,4), (38,'14f',14,4), (39,'15a',15,4), (40,'15b',15,4),
  (41,'15c',15,4), (42,'15d',15,4), (43,'15e',15,4), (44,'16a',16,5), (45,'16b',16,5), (46,'16c',16,5), (47,'16d',16,5), (48,'17',17,4),
  (49,'18a',18,4), (50,'18b',18,4), (51,'18c',18,4), (52,'18d',18,4), (53,'19',19,4), (54,'20',20,4), (55,'21',21,4), (56,'22',22,5),
  (57,'23',23,4), (58,'24',24,4), (59,'25',25,4), (60,'26',26,5), (61,'27',27,4), (62,'28',28,4), (63,'29',29,4), (64,'30',30,4),
  (65,'31',31,4), (66,'32',32,4), (67,'33a',33,4), (68,'33b',33,4), (69,'33c',33,4), (70,'33d',33,4), (71,'33e',33,4), (72,'33f',33,4),
  (73,'34a',34,5), (74,'34b',34,5), (75,'34c',34,5), (76,'34d',34,5), (77,'35',35,4), (78,'36',36,4), (79,'37',37,4), (80,'38',38,4),
  (81,'39',39,4), (82,'40a',40,5), (83,'40b',40,5), (84,'40c',40,5), (85,'40d',40,5), (86,'41',41,4), (87,'42',42,4), (88,'43',43,4),
  (89,'44',44,4);

-- Comprobación de la propia tabla: 89 ítems, 44 preguntas, 15 de 1 a 5 y 4 de 1 a 3.
do $$
begin
  if (select count(*) from public.fpsico_estructura) <> 89
    or (select count(distinct pregunta) from public.fpsico_estructura) <> 44
    or (select count(*) from public.fpsico_estructura where valor_max = 5) <> 15
    or (select count(*) from public.fpsico_estructura where valor_max = 3) <> 4 then
    raise exception 'La estructura FPSICO de referencia no cuadra con el manual.';
  end if;
end;
$$;

alter table public.fpsico_estructura enable row level security;
revoke all on public.fpsico_estructura from anon, authenticated;
grant select on public.fpsico_estructura to authenticated;
grant all on public.fpsico_estructura to service_role;
create policy fpsico_estructura_ver on public.fpsico_estructura for select to authenticated using (true);
create trigger fpsico_estructura_inalterable before update or delete on public.fpsico_estructura
  for each row execute function privado.bloquear_cambios();
create trigger bloquear_visor before insert or update or delete on public.fpsico_estructura
  for each statement execute function privado.bloquear_visor();

-- ---------------------------------------------------------------------------
-- 2. Número FPSICO de cada ítem y validación al publicar
-- ---------------------------------------------------------------------------

alter table public.items
  add column codigo_fpsico text references public.fpsico_estructura (codigo) on update restrict on delete restrict;
create unique index items_codigo_fpsico_unico on public.items (instrumento_id, codigo_fpsico) where codigo_fpsico is not null;

comment on column public.items.codigo_fpsico is
  'Número del ítem en FPSICO (1, 2, … 10a … 44). Fija su posición en el cuestionario y en la exportación.';

-- Devuelve el primer problema de estructura, o null si el cuestionario cuadra con FPSICO.
create function privado.problema_estructura_fpsico(p_instrumento uuid) returns text
language plpgsql stable security definer set search_path = '' as $$
declare
  v_n integer;
  v_sin integer;
  v_mal text;
begin
  select count(*), count(*) filter (where it.codigo_fpsico is null)
    into v_n, v_sin
  from public.items it where it.instrumento_id = p_instrumento;

  if v_n <> 89 then
    return format('El cuestionario FPSICO tiene 89 ítems y este tiene %s.', v_n);
  end if;
  if v_sin > 0 then
    return format('Faltan %s ítems por numerar como en FPSICO (1, 2, … 10a … 44).', v_sin);
  end if;
  -- 89 ítems con número, sin repetir (índice único) y todos de la tabla de referencia: están todos.

  select string_agg(e.codigo, ', ' order by e.posicion) into v_mal
  from public.items it
  join public.fpsico_estructura e on e.codigo = it.codigo_fpsico
  where it.instrumento_id = p_instrumento
    and (
      select array_agg(coalesce(eo.codigo_export, eo.valor::text) order by coalesce(eo.codigo_export, eo.valor::text))
      from public.escala_opciones eo where eo.escala_id = it.escala_id
    ) is distinct from (
      select array_agg(g::text order by g::text) from generate_series(1, e.valor_max) as g
    );
  if v_mal is not null then
    return 'La escala no coincide con los valores que admite FPSICO en: ' || v_mal
      || '. Son de 1 a 4, de 1 a 5 en 10h, 16a-d, 22, 26, 34a-d y 40a-d, y de 1 a 3 en 13a-d.';
  end if;
  return null;
end;
$$;
revoke all on function privado.problema_estructura_fpsico(uuid) from public;
grant execute on function privado.problema_estructura_fpsico(uuid) to authenticated, service_role;

-- Se comprueba al publicar (por la función o directamente) y al pasar un
-- cuestionario publicado al formato FPSICO. Así no hay forma de saltárselo.
create function privado.exigir_estructura_fpsico() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_problema text;
begin
  if new.estado = 'publicado'
    and (new.origen = 'insst_fpsico' or new.export_formato = 'fpsico31')
    and (old.estado is distinct from 'publicado'
      or old.export_formato is distinct from new.export_formato
      or old.origen is distinct from new.origen) then
    v_problema := privado.problema_estructura_fpsico(new.id);
    if v_problema is not null then
      raise exception '%', v_problema using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
-- El nombre empieza por «z» para ejecutarse después de instrumentos_origen, que fija el origen.
create trigger z_instrumentos_estructura_fpsico before update on public.instrumentos
  for each row execute function privado.exigir_estructura_fpsico();

-- ---------------------------------------------------------------------------
-- 3. Cuestionario en el orden de FPSICO
-- ---------------------------------------------------------------------------

-- Contenido del cuestionario de una campaña. Lo usan la persona trabajadora
-- (con su código) y el panel (vista previa). No incluye nada de respuestas.
create function privado.cuestionario_de_campana(p_campana uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'estado', 'ok',
    'campana', jsonb_build_object('nombre', c.nombre, 'tipo', c.tipo, 'minimo_grupo', c.minimo_grupo, 'modo_acceso', c.modo_acceso),
    'empresa', (select e.nombre from public.empresas e where e.id = c.empresa_id),
    'instrumento', (select jsonb_build_object('nombre', i.nombre, 'descripcion', i.descripcion,
        'minutos', i.minutos_estimados, 'es_demo', i.es_demo, 'origen', i.origen,
        'estructura_fpsico', (i.origen = 'insst_fpsico' or i.export_formato = 'fpsico31'))
      from public.instrumentos i where i.id = c.instrumento_id),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', it.id, 'enunciado', it.enunciado, 'codigo', it.codigo_fpsico, 'pregunta', e.pregunta, 'bloque', f.nombre,
        'opciones', (select jsonb_agg(jsonb_build_object('valor', eo.valor, 'etiqueta', eo.etiqueta) order by eo.orden, eo.valor)
          from public.escala_opciones eo where eo.escala_id = it.escala_id)
      ) order by e.posicion nulls last, f.orden, it.orden, it.id)
      from public.items it
      join public.factores f on f.id = it.factor_id
      left join public.fpsico_estructura e on e.codigo = it.codigo_fpsico
      where it.instrumento_id = c.instrumento_id), '[]'::jsonb),
    'dimensiones', case when c.tipo = 'pulso' then coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', d.id, 'nombre', d.nombre,
        'grupos', (select jsonb_agg(jsonb_build_object('id', g.id, 'nombre', g.nombre) order by g.orden, g.nombre)
          from public.grupos g where g.dimension_id = d.id)
      ) order by d.nombre)
      from public.campana_dimensiones cd join public.dimensiones d on d.id = cd.dimension_id
      where cd.campana_id = c.id), '[]'::jsonb) else '[]'::jsonb end
  )
  from public.campanas c where c.id = p_campana;
$$;
revoke all on function privado.cuestionario_de_campana(uuid) from public;
grant execute on function privado.cuestionario_de_campana(uuid) to authenticated, service_role;

create or replace function public.obtener_cuestionario(p_acceso text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v record;
begin
  select * into v from privado.resolver_acceso(p_acceso);
  if v.motivo <> 'ok' then
    return jsonb_build_object('estado', v.motivo);
  end if;
  if privado.campana_completa(v.campana_id) then
    return jsonb_build_object('estado', 'completa');
  end if;
  return privado.cuestionario_de_campana(v.campana_id);
end;
$$;

-- Vista previa para el panel: lo mismo que ve la plantilla, sin poder responder.
create function public.vista_previa_cuestionario(p_campana uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not privado.puede_ver_empresa(privado.empresa_de_campana(p_campana)) then
    raise exception 'Sin permiso.' using errcode = '42501';
  end if;
  return privado.cuestionario_de_campana(p_campana);
end;
$$;
revoke all on function public.vista_previa_cuestionario(uuid) from public, anon;
grant execute on function public.vista_previa_cuestionario(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Acceso: evaluaciones con códigos; enlace general con tope
-- ---------------------------------------------------------------------------

-- Un enlace general ha llegado al tope cuando hay tantas respuestas como personas invitadas.
create function privado.campana_completa(p_campana uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.campanas c
    where c.id = p_campana and c.modo_acceso = 'enlace' and c.plantilla_invitada is not null
      and (select count(*) from public.respuestas r where r.campana_id = c.id) >= c.plantilla_invitada
  );
$$;
revoke all on function privado.campana_completa(uuid) from public;
grant execute on function privado.campana_completa(uuid) to authenticated, service_role;

create function privado.exigir_modo_acceso() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.tipo = 'evaluacion' and new.modo_acceso = 'enlace' then
    raise exception 'Las evaluaciones solo se responden con códigos de un solo uso: así cada persona responde una vez.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
-- Después de campanas_al_crear, que fija el tipo según el instrumento.
create trigger z_campanas_modo_acceso before insert or update of modo_acceso, tipo on public.campanas
  for each row execute function privado.exigir_modo_acceso();

create or replace function public.abrir_campana(p_campana uuid) returns void
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
  if v_c.modo_acceso = 'enlace' and v_c.plantilla_invitada is null then
    raise exception 'Indique cuántas personas están invitadas: con el enlace general es el tope de respuestas.' using errcode = 'P0001';
  end if;
  update public.campanas set
    estado = 'abierta',
    abierta_el = now(),
    token_enlace = case when v_c.modo_acceso = 'enlace'
      then translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_') else null end
  where id = p_campana;
  perform privado.anotar_evidencia(v_c.empresa_id, 'campana_abierta', 'Campaña abierta: ' || v_c.nombre,
    jsonb_build_object('campana_id', v_c.id, 'tipo', v_c.tipo, 'modo_acceso', v_c.modo_acceso));
end;
$$;

-- Guarda una respuesta anónima. Devuelve: ok, no_valido, usado, cerrada, no_abierta, completa o incompleto.
create or replace function public.enviar_respuesta(p_acceso text, p_valores jsonb, p_grupos uuid[]) returns text
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
  -- Bloqueo de la campaña: los envíos de una misma campaña van de uno en uno,
  -- así el tope del enlace general no se puede rebasar con envíos simultáneos.
  select * into v_c from public.campanas c where c.id = v.campana_id for update;
  if v_c.estado <> 'abierta' then
    return 'cerrada';
  end if;
  if v_c.modo_acceso = 'enlace' and privado.campana_completa(v_c.id) then
    return 'completa';
  end if;

  if v.codigo_id is not null then
    -- Se marca el código dentro de la misma transacción: dos envíos a la vez no pasan.
    update public.codigos_acceso set usado = true where id = v.codigo_id and not usado;
    if not found then
      return 'usado';
    end if;
  elsif v_c.modo_acceso = 'codigos' then
    return 'no_valido';
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

  -- Grupos: solo en seguimientos, de dimensiones de esta campaña y como mucho uno por dimensión.
  if cardinality(v_grupos) > 0 and (
    v_c.tipo <> 'pulso'
    or exists (
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

revoke all on function public.obtener_cuestionario(text), public.enviar_respuesta(text, jsonb, uuid[]) from public, anon, authenticated;
grant execute on function public.obtener_cuestionario(text), public.enviar_respuesta(text, jsonb, uuid[]) to service_role;

-- ---------------------------------------------------------------------------
-- 6. Respuestas y códigos inalterables
-- ---------------------------------------------------------------------------

create function privado.proteger_respuestas() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_campana uuid;
begin
  if tg_op = 'DELETE' then
    -- Solo el borrado completo de una empresa (fase 8) puede llevarse sus respuestas.
    if current_setting('lumbra.borrado_empresa', true) = 'si' then
      return old;
    end if;
    raise exception 'Las respuestas no se pueden borrar.' using errcode = 'P0001';
  end if;
  if tg_op = 'UPDATE' then
    raise exception 'Las respuestas no se pueden modificar.' using errcode = 'P0001';
  end if;

  -- INSERT
  if tg_table_name = 'respuestas' then
    v_campana := new.campana_id;
  else
    select r.campana_id into v_campana from public.respuestas r where r.id = new.respuesta_id;
  end if;
  if not exists (select 1 from public.campanas c where c.id = v_campana and c.estado = 'abierta') then
    raise exception 'Solo se admiten respuestas con la campaña abierta.' using errcode = 'P0001';
  end if;
  if tg_table_name = 'respuesta_items' then
    if not exists (
      select 1 from public.items it join public.campanas c on c.instrumento_id = it.instrumento_id
      where it.id = new.item_id and c.id = v_campana
    ) then
      raise exception 'El ítem no es de este cuestionario.' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger respuestas_protegidas before insert or update or delete on public.respuestas
  for each row execute function privado.proteger_respuestas();
create trigger respuesta_items_protegidas before insert or update or delete on public.respuesta_items
  for each row execute function privado.proteger_respuestas();
create trigger respuesta_grupos_protegidas before insert or update or delete on public.respuesta_grupos
  for each row execute function privado.proteger_respuestas();

create function privado.proteger_codigos() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and (
    new.codigo_hash is distinct from old.codigo_hash
    or new.campana_id is distinct from old.campana_id
    or (old.usado and not new.usado)
  ) then
    raise exception 'Un código no se puede cambiar ni volver a activar.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger codigos_protegidos before update on public.codigos_acceso
  for each row execute function privado.proteger_codigos();

-- Borrado completo de una empresa. Antes fallaba si un grupo se había usado en
-- una campaña (campana_dimensiones y respuesta_grupos impiden borrar el grupo):
-- ahora se borran primero las campañas, con sus respuestas, y después la empresa.
create or replace function public.borrar_empresa_completa(p_empresa uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform set_config('lumbra.borrado_empresa', 'si', true);
  delete from public.campanas where empresa_id = p_empresa;
  delete from public.empresas where id = p_empresa;
  perform set_config('lumbra.borrado_empresa', '', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Exportación: orden de FPSICO y comprobación posición a posición
-- ---------------------------------------------------------------------------

create or replace function public.exportar_respuestas(p_campana uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
  v_inst public.instrumentos%rowtype;
  v_n integer;
  v_problema text;
  v_mal integer;
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

  if v_inst.export_formato = 'fpsico31' then
    v_problema := privado.problema_estructura_fpsico(v_inst.id);
    if v_problema is not null then
      raise exception '%', v_problema using errcode = 'P0001';
    end if;

    -- Cada respuesta: 89 valores de una cifra en el orden de FPSICO, cada uno dentro de su rango.
    with valores as (
      select r.id as respuesta, e.posicion, e.valor_max, coalesce(eo.codigo_export, eo.valor::text) as v
      from public.respuestas r
      join public.respuesta_items ri on ri.respuesta_id = r.id
      join public.items it on it.id = ri.item_id
      join public.fpsico_estructura e on e.codigo = it.codigo_fpsico
      join public.escala_opciones eo on eo.escala_id = it.escala_id and eo.valor = ri.valor
      where r.campana_id = p_campana
    ), filas as (
      select r.id,
        (select count(*) from valores x where x.respuesta = r.id) as n,
        (select count(*) from valores x where x.respuesta = r.id
           and (x.v !~ '^[1-5]$' or x.v::integer > x.valor_max)) as fuera,
        (select string_agg(x.v, '' order by x.posicion) from valores x where x.respuesta = r.id) as linea
      from public.respuestas r where r.campana_id = p_campana
    )
    select count(*) filter (where n <> 89 or fuera > 0 or linea !~ '^[1-5]{89}$'),
           jsonb_agg('"","","' || linea || '"' order by random()) filter (where n = 89 and fuera = 0 and linea ~ '^[1-5]{89}$')
      into v_mal, v_lineas
    from filas;

    if v_mal > 0 then
      raise exception 'Hay % respuestas incompletas o con valores fuera de rango. FPSICO solo admite cuestionarios completos.', v_mal using errcode = 'P0001';
    end if;

    perform privado.anotar_evidencia(v_c.empresa_id, 'respuestas_exportadas', 'Respuestas exportadas para FPSICO: ' || v_c.nombre,
      jsonb_build_object('campana_id', v_c.id, 'respuestas', v_n, 'formato', 'fpsico31'));

    return jsonb_build_object(
      'cabecera', repeat('*', 40),
      'fin_linea', 'crlf',
      'lineas', coalesce(v_lineas, '[]'::jsonb)
    );
  end if;

  -- Formato personalizado: mismo orden que el cuestionario.
  select jsonb_agg(l.linea order by random()) into v_lineas
  from (
    select string_agg(coalesce(eo.codigo_export, eo.valor::text), v_inst.export_separador
             order by e.posicion nulls last, f.orden, it.orden, it.id) as linea
    from public.respuestas r
    join public.respuesta_items ri on ri.respuesta_id = r.id
    join public.items it on it.id = ri.item_id
    join public.factores f on f.id = it.factor_id
    left join public.fpsico_estructura e on e.codigo = it.codigo_fpsico
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

-- ---------------------------------------------------------------------------
-- Pendientes
-- ---------------------------------------------------------------------------

update public.pendientes
set descripcion = 'Formato .txt de FPSICO 3.1 implementado según el Anexo II del manual de FPSICO 4.1 (págs. 77-80), con la numeración y los rangos de los 89 ítems comprobados en base de datos. Falta probar una importación real en FPSICO 4.1, sobre todo sin preguntas variables.'
where clave = 'fpsico_formato_txt';
