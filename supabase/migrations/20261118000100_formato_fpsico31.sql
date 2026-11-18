-- ============================================================================
-- Formato de exportación FPSICO 3.1, importable en FPSICO 4.1.
-- Fuente: INSST, «FPSICO 4.1. Manual técnico y de uso de la aplicación
-- informática» (mayo de 2022), Anexo II «Formato del archivo txt para
-- importación a FPSICO 4.1», páginas 77 a 80.
--
-- Lo que dice el anexo y cómo se aplica aquí:
-- 1. Primera parte: preguntas variables («a. …» y respuestas «> …»).
--    Las evaluaciones de LUMBRA360 no piden datos de grupo (anonimato), así que
--    no hay preguntas variables y esta parte va vacía.
-- 2. Separador: exactamente 40 asteriscos.
-- 3. Una línea por cuestionario con cuatro partes entrecomilladas y separadas
--    solo por comas, sin espacios:
--      1.ª fecha y hora (opcional; vacía se escribe ""). Aquí siempre vacía:
--          no se guarda la hora de respuesta.
--      2.ª respuestas a las preguntas variables. Aquí vacía ("").
--      3.ª exactamente 89 respuestas, con valores posibles (1 a 3, 1 a 4 o
--          1 a 5 según el ítem; los rangos los fijan las escalas del banco).
--      4.ª identificador (opcional; se puede quitar con su coma). Aquí se quita.
-- 4. Sin líneas en blanco y solo los caracteres que genera FPSICO 3.1.
--
-- Sigue pendiente comprobarlo con una importación real en FPSICO 4.1, en
-- especial que acepte un estudio sin preguntas variables.
-- ============================================================================

alter table public.instrumentos
  add column export_formato text not null default 'personalizado'
    check (export_formato in ('personalizado', 'fpsico31'));

comment on column public.instrumentos.export_formato is
  'personalizado: separador, cabecera y fin de línea configurables. fpsico31: formato del Anexo II del manual de FPSICO 4.1.';

grant update (export_formato) on public.instrumentos to authenticated;

create or replace function public.exportar_respuestas(p_campana uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_c public.campanas%rowtype;
  v_inst public.instrumentos%rowtype;
  v_n integer;
  v_items integer;
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
    select count(*) into v_items from public.items it where it.instrumento_id = v_inst.id;
    if v_items <> 89 then
      raise exception 'El formato de FPSICO necesita exactamente 89 ítems y este cuestionario tiene %.', v_items using errcode = 'P0001';
    end if;

    -- Cada respuesta: 89 valores de una cifra (1 a 5), en el orden del cuestionario.
    with filas as (
      select string_agg(coalesce(eo.codigo_export, eo.valor::text), '' order by f.orden, it.orden, it.id) as valores
      from public.respuestas r
      join public.respuesta_items ri on ri.respuesta_id = r.id
      join public.items it on it.id = ri.item_id
      join public.factores f on f.id = it.factor_id
      join public.escala_opciones eo on eo.escala_id = it.escala_id and eo.valor = ri.valor
      where r.campana_id = p_campana
      group by r.id
    )
    select count(*) filter (where valores !~ '^[1-5]{89}$'),
           jsonb_agg('"","","' || valores || '"' order by random()) filter (where valores ~ '^[1-5]{89}$')
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

  -- Formato personalizado (el de antes).
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

update public.pendientes
set descripcion = 'Formato .txt de FPSICO 3.1 implementado según el Anexo II del manual de FPSICO 4.1 (págs. 77-80). Falta probar una importación real en FPSICO 4.1, sobre todo sin preguntas variables.'
where clave = 'fpsico_formato_txt';
