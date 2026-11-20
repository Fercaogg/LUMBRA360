-- DATOS DE DEMOSTRACIÓN. Todo lo de este archivo es ficticio y va marcado con es_demo = true.
-- Solo se carga en local con "npx supabase db reset". No lo ejecutes en producción.
-- Los correos usan el dominio reservado .invalid: no pueden existir.

insert into public.partners (id, nombre, marca_blanca, marca_nombre, es_demo) values
  ('00000000-0000-4000-a000-000000000001', 'Partner de demostración A (ficticio)', true, 'Marca demo A', true),
  ('00000000-0000-4000-a000-000000000002', 'Partner de demostración B (ficticio)', false, null, true);

insert into public.empresas (id, partner_id, nombre, plantilla_declarada, es_demo) values
  ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000001', 'Empresa demo 1 (ficticia)', 24, true),
  ('00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000001', 'Empresa demo 2 (ficticia)', 41, true),
  ('00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000002', 'Empresa demo 3 (ficticia)', 12, true),
  ('00000000-0000-4000-b000-000000000004', null, 'Empresa demo en venta directa (ficticia)', 18, true);

-- Cuentas de demostración. Entra desde /acceso con el correo y abre el enlace en Mailpit (http://127.0.0.1:54324).
insert into public.invitaciones (correo, rol, partner_id, empresa_id) values
  ('admin@demo.invalid', 'admin', null, null),
  ('gestor-a@demo.invalid', 'partner', '00000000-0000-4000-a000-000000000001', null),
  ('gestor-b@demo.invalid', 'partner', '00000000-0000-4000-a000-000000000002', null),
  ('tecnico-a@demo.invalid', 'tecnico', '00000000-0000-4000-a000-000000000001', '00000000-0000-4000-b000-000000000001'),
  ('empresa-1@demo.invalid', 'empresa', null, '00000000-0000-4000-b000-000000000001'),
  ('empresa-3@demo.invalid', 'empresa', null, '00000000-0000-4000-b000-000000000003');

-- ---------------------------------------------------------------------------
-- Fase 2. Instrumento, grupos, campañas y respuestas de DEMOSTRACIÓN.
-- Los textos del cuestionario son marcadores sin contenido real: no proceden de ningún instrumento.
-- ---------------------------------------------------------------------------

-- Evaluación de demostración: misma ESTRUCTURA que FPSICO 4.1 (89 ítems numerados 1 … 44,
-- con los rangos de respuesta del Anexo II del manual), pero con textos ficticios.
-- Los enunciados reales solo se cargan con la autorización escrita del INSST.
insert into public.instrumentos (id, nombre, descripcion, tipo, minutos_estimados, es_demo, export_formato) values
  ('00000000-0000-4000-8c00-000000000001', 'Cuestionario de demostración (ficticio)',
   'Misma estructura que FPSICO 4.1: 44 preguntas y 89 ítems, en su orden y con sus rangos de respuesta. Los textos son ficticios.',
   'evaluacion', 20, true, 'fpsico31');
insert into public.instrumentos (id, nombre, descripcion, tipo, minutos_estimados, es_demo) values
  ('00000000-0000-4000-8c00-000000000002', 'Seguimiento de demostración (ficticio)', 'Sirve para probar los seguimientos. No es un instrumento de evaluación.', 'pulso', 1, true);

insert into public.escalas (id, instrumento_id, nombre) values
  ('00000000-0000-4000-8c10-000000000001', '00000000-0000-4000-8c00-000000000001', 'Escala de demostración de 1 a 4'),
  ('00000000-0000-4000-8c10-000000000003', '00000000-0000-4000-8c00-000000000001', 'Escala de demostración de 1 a 5'),
  ('00000000-0000-4000-8c10-000000000004', '00000000-0000-4000-8c00-000000000001', 'Escala de demostración de 1 a 3'),
  ('00000000-0000-4000-8c10-000000000002', '00000000-0000-4000-8c00-000000000002', 'Escala de demostración');
insert into public.escala_opciones (escala_id, etiqueta, valor, orden)
select e.id, 'Opción ' || v || ' (demo)', v, v
from (values ('00000000-0000-4000-8c10-000000000001'::uuid, 4), ('00000000-0000-4000-8c10-000000000003'::uuid, 5),
             ('00000000-0000-4000-8c10-000000000004'::uuid, 3)) as e (id, maximo)
cross join lateral generate_series(1, e.maximo) as v;
insert into public.escala_opciones (escala_id, etiqueta, valor, orden)
select '00000000-0000-4000-8c10-000000000002', 'Valor ' || v || ' (demo)', v, v from generate_series(1, 5) as v;

insert into public.factores (id, instrumento_id, nombre, orden) values
  ('00000000-0000-4000-8c20-000000000001', '00000000-0000-4000-8c00-000000000001', 'Preguntas de demostración', 1),
  ('00000000-0000-4000-8c20-000000000003', '00000000-0000-4000-8c00-000000000002', 'Factor de demostración del seguimiento', 1);
insert into public.niveles (factor_id, etiqueta, desde, tono)
select '00000000-0000-4000-8c20-000000000003', n.etiqueta, n.desde, n.tono::public.tono_nivel
from (values ('Nivel demo 1', 1, 'desfavorable'), ('Nivel demo 2', 2.5, 'intermedio'), ('Nivel demo 3', 3.5, 'favorable')) as n (etiqueta, desde, tono);

-- Los 89 ítems de la evaluación demo, uno por posición de FPSICO, con la escala que le corresponde.
insert into public.items (instrumento_id, factor_id, escala_id, enunciado, orden, codigo_fpsico)
select '00000000-0000-4000-8c00-000000000001', '00000000-0000-4000-8c20-000000000001',
  case e.valor_max when 5 then '00000000-0000-4000-8c10-000000000003'::uuid
                   when 3 then '00000000-0000-4000-8c10-000000000004'::uuid
                   else '00000000-0000-4000-8c10-000000000001'::uuid end,
  'Enunciado de demostración de la pregunta ' || e.pregunta
    || case when e.codigo ~ '[a-h]$' then ', apartado ' || right(e.codigo, 1) else '' end
    || ' (texto ficticio)',
  e.posicion, e.codigo
from public.fpsico_estructura e;

insert into public.items (instrumento_id, factor_id, escala_id, enunciado, orden)
select '00000000-0000-4000-8c00-000000000002', '00000000-0000-4000-8c20-000000000003', '00000000-0000-4000-8c10-000000000002',
  'Enunciado de demostración ' || n || ' del seguimiento (texto ficticio)', n
from generate_series(1, 2) as n;

-- Al publicar se comprueba la estructura FPSICO (89 ítems, numeración y rangos).
update public.instrumentos set estado = 'publicado'
where id in ('00000000-0000-4000-8c00-000000000001', '00000000-0000-4000-8c00-000000000002');

-- Grupos de la empresa demo 1
insert into public.dimensiones (id, empresa_id, nombre) values
  ('00000000-0000-4000-8d00-000000000001', '00000000-0000-4000-b000-000000000001', 'Área (demo)');
insert into public.grupos (id, dimension_id, nombre, orden) values
  ('00000000-0000-4000-8d10-000000000001', '00000000-0000-4000-8d00-000000000001', 'Área demo 1', 1),
  ('00000000-0000-4000-8d10-000000000002', '00000000-0000-4000-8d00-000000000001', 'Área demo 2', 2),
  ('00000000-0000-4000-8d10-000000000003', '00000000-0000-4000-8d00-000000000001', 'Área demo 3', 3);

-- Las respuestas solo entran con la campaña abierta (disparador de la migración de blindaje):
-- se abre, se responde y se cierra, igual que en la realidad.

-- Seguimiento demo ya cerrado, con 18 respuestas ficticias: 9 + 6 + 3 (el grupo de 3 queda protegido).
insert into public.campanas (id, empresa_id, instrumento_id, nombre, modo_acceso, plantilla_invitada)
values ('00000000-0000-4000-8e00-000000000001', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-8c00-000000000002', 'Seguimiento de demostración (ficticio)', 'codigos', 24);
insert into public.campana_dimensiones (campana_id, dimension_id)
values ('00000000-0000-4000-8e00-000000000001', '00000000-0000-4000-8d00-000000000001');
update public.campanas set estado = 'abierta', abierta_el = now() - interval '45 days'
where id = '00000000-0000-4000-8e00-000000000001';

insert into public.respuestas (id, campana_id, dia)
select ('00000000-0000-4000-8f00-' || lpad(n::text, 12, '0'))::uuid, '00000000-0000-4000-8e00-000000000001', current_date - 30
from generate_series(1, 18) as n;
insert into public.respuesta_grupos (respuesta_id, grupo_id)
select ('00000000-0000-4000-8f00-' || lpad(n::text, 12, '0'))::uuid,
  case when n <= 9 then '00000000-0000-4000-8d10-000000000001'::uuid
       when n <= 15 then '00000000-0000-4000-8d10-000000000002'::uuid
       else '00000000-0000-4000-8d10-000000000003'::uuid end
from generate_series(1, 18) as n;
insert into public.respuesta_items (respuesta_id, item_id, valor)
select ('00000000-0000-4000-8f00-' || lpad(n::text, 12, '0'))::uuid, i.id, 1 + ((n * 7 + i.orden * 3) % 5)
from generate_series(1, 18) as n
cross join public.items i
where i.instrumento_id = '00000000-0000-4000-8c00-000000000002';

update public.campanas set estado = 'cerrada', cerrada_el = now() - interval '30 days'
where id = '00000000-0000-4000-8e00-000000000001';

-- Evaluación demo ya cerrada, con 8 respuestas ficticias. No se puntúa en la plataforma:
-- sirve para probar la exportación en formato FPSICO y el registro del informe.
update public.instrumentos set export_confirmado = true
where id = '00000000-0000-4000-8c00-000000000001';

insert into public.campanas (id, empresa_id, instrumento_id, nombre, modo_acceso, plantilla_invitada)
values ('00000000-0000-4000-8e00-000000000002', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-8c00-000000000001', 'Evaluación de demostración (ficticia)', 'codigos', 24);
update public.campanas set estado = 'abierta', abierta_el = now() - interval '20 days'
where id = '00000000-0000-4000-8e00-000000000002';

insert into public.respuestas (id, campana_id, dia)
select ('00000000-0000-4000-8f10-' || lpad(n::text, 12, '0'))::uuid, '00000000-0000-4000-8e00-000000000002', current_date - 10
from generate_series(1, 8) as n;
-- Valores dentro del rango de cada ítem (1 a 3, 1 a 4 o 1 a 5).
insert into public.respuesta_items (respuesta_id, item_id, valor)
select ('00000000-0000-4000-8f10-' || lpad(n::text, 12, '0'))::uuid, i.id, 1 + ((n * 5 + e.posicion * 2) % e.valor_max)
from generate_series(1, 8) as n
cross join public.items i
join public.fpsico_estructura e on e.codigo = i.codigo_fpsico
where i.instrumento_id = '00000000-0000-4000-8c00-000000000001';

update public.campanas set estado = 'cerrada', cerrada_el = now() - interval '10 days'
where id = '00000000-0000-4000-8e00-000000000002';

-- ---------------------------------------------------------------------------
-- Fase 3. Plantilla de política de DEMOSTRACIÓN. Los textos son marcadores, no texto legal.
-- ---------------------------------------------------------------------------

insert into public.politica_plantillas (id, nombre, es_demo)
values ('00000000-0000-4000-9a00-000000000001', 'Plantilla de política de demostración (ficticia)', true);
insert into public.politica_plantilla_secciones (plantilla_id, titulo, cuerpo, ayuda, orden) values
  ('00000000-0000-4000-9a00-000000000001', 'Sección de demostración 1', 'Texto de demostración de la sección 1 (ficticio). No es texto legal.', 'Ayuda de demostración.', 1),
  ('00000000-0000-4000-9a00-000000000001', 'Sección de demostración 2', '', 'Esta sección empieza vacía para probar el asistente.', 2);
update public.politica_plantillas set estado = 'publicado' where id = '00000000-0000-4000-9a00-000000000001';

-- ---------------------------------------------------------------------------
-- Contenido para la demostración pública (botón «Demo»). Empresa demo 1. Todo ficticio.
-- ---------------------------------------------------------------------------
insert into public.medidas (empresa_id, campana_id, titulo, descripcion, responsable, fecha_prevista, estado) values
  ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-8e00-000000000001', 'Redistribuir los picos de trabajo en atención al cliente (ejemplo)', 'Medida de demostración.', 'Dirección de operaciones (ejemplo)', current_date + 28, 'en_curso'),
  ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-8e00-000000000001', 'Formación en desconexión digital para mandos (ejemplo)', 'Medida de demostración.', 'Recursos humanos (ejemplo)', current_date + 60, 'pendiente'),
  ('00000000-0000-4000-b000-000000000001', null, 'Revisar los avisos fuera de horario (ejemplo)', 'Medida de demostración.', 'Comité de seguridad y salud (ejemplo)', current_date - 10, 'hecha');

insert into public.politicas (id, empresa_id, plantilla_id, version, estado, secciones, aprobada_nombre, aprobada_el) values
  ('00000000-0000-4000-9b00-000000000001', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-9a00-000000000001', 1, 'borrador',
   '[{"titulo": "Sección de demostración 1", "cuerpo": "Texto de demostración de la sección 1 (ficticio). No es texto legal."}, {"titulo": "Sección de demostración 2", "cuerpo": "Texto de ejemplo adaptado por la empresa (ficticio)."}]'::jsonb,
   null, null);
update public.politicas set estado = 'aprobada', aprobada_nombre = 'Dirección general (ejemplo)', aprobada_el = now() - interval '6 days'
where id = '00000000-0000-4000-9b00-000000000001';

insert into public.acuses (politica_id, nombre, registrado_el) values
  ('00000000-0000-4000-9b00-000000000001', 'Persona de ejemplo 1', now() - interval '5 days'),
  ('00000000-0000-4000-9b00-000000000001', 'Persona de ejemplo 2', now() - interval '4 days'),
  ('00000000-0000-4000-9b00-000000000001', 'Persona de ejemplo 3', now() - interval '2 days');

insert into public.audiencias (empresa_id, politica_id, fecha, asistentes, notas) values
  ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-9b00-000000000001', current_date - 9, 'Representación de la plantilla (ejemplo) y Dirección (ejemplo)', 'Audiencia de demostración.');

insert into public.formaciones (empresa_id, titulo, fecha, descripcion, participantes) values
  ('00000000-0000-4000-b000-000000000001', 'Sesión sobre desconexión digital (ejemplo)', current_date - 3, 'Formación de demostración.', 18);
