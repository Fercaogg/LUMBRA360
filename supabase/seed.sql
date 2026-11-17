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

insert into public.instrumentos (id, nombre, descripcion, tipo, minutos_estimados, es_demo) values
  ('00000000-0000-4000-8c00-000000000001', 'Cuestionario de demostración (ficticio)', 'Sirve para probar la plataforma. No es un instrumento de evaluación.', 'evaluacion', 2, true),
  ('00000000-0000-4000-8c00-000000000002', 'Seguimiento de demostración (ficticio)', 'Sirve para probar los seguimientos. No es un instrumento de evaluación.', 'pulso', 1, true);

insert into public.escalas (id, instrumento_id, nombre) values
  ('00000000-0000-4000-8c10-000000000001', '00000000-0000-4000-8c00-000000000001', 'Escala de demostración'),
  ('00000000-0000-4000-8c10-000000000002', '00000000-0000-4000-8c00-000000000002', 'Escala de demostración');
insert into public.escala_opciones (escala_id, etiqueta, valor, orden)
select e.id, 'Valor ' || v || ' (demo)', v, v
from public.escalas e cross join generate_series(1, 5) as v
where e.instrumento_id in ('00000000-0000-4000-8c00-000000000001', '00000000-0000-4000-8c00-000000000002');

insert into public.factores (id, instrumento_id, nombre, orden) values
  ('00000000-0000-4000-8c20-000000000001', '00000000-0000-4000-8c00-000000000001', 'Factor de demostración A', 1),
  ('00000000-0000-4000-8c20-000000000002', '00000000-0000-4000-8c00-000000000001', 'Factor de demostración B', 2),
  ('00000000-0000-4000-8c20-000000000003', '00000000-0000-4000-8c00-000000000002', 'Factor de demostración del seguimiento', 1);
insert into public.niveles (factor_id, etiqueta, desde, tono)
select f.id, n.etiqueta, n.desde, n.tono::public.tono_nivel
from public.factores f
cross join (values ('Nivel demo 1', 1, 'desfavorable'), ('Nivel demo 2', 2.5, 'intermedio'), ('Nivel demo 3', 3.5, 'favorable')) as n (etiqueta, desde, tono)
where f.instrumento_id in ('00000000-0000-4000-8c00-000000000001', '00000000-0000-4000-8c00-000000000002');
insert into public.items (instrumento_id, factor_id, escala_id, enunciado, orden)
select f.instrumento_id, f.id, e.id, 'Enunciado de demostración ' || n || ' de «' || f.nombre || '» (texto ficticio)', n
from public.factores f
join public.escalas e on e.instrumento_id = f.instrumento_id
cross join generate_series(1, 2) as n
where f.instrumento_id in ('00000000-0000-4000-8c00-000000000001', '00000000-0000-4000-8c00-000000000002');

update public.instrumentos set estado = 'publicado'
where id in ('00000000-0000-4000-8c00-000000000001', '00000000-0000-4000-8c00-000000000002');

-- Grupos de la empresa demo 1
insert into public.dimensiones (id, empresa_id, nombre) values
  ('00000000-0000-4000-8d00-000000000001', '00000000-0000-4000-b000-000000000001', 'Área (demo)');
insert into public.grupos (id, dimension_id, nombre, orden) values
  ('00000000-0000-4000-8d10-000000000001', '00000000-0000-4000-8d00-000000000001', 'Área demo 1', 1),
  ('00000000-0000-4000-8d10-000000000002', '00000000-0000-4000-8d00-000000000001', 'Área demo 2', 2),
  ('00000000-0000-4000-8d10-000000000003', '00000000-0000-4000-8d00-000000000001', 'Área demo 3', 3);

-- Seguimiento demo ya cerrado, con 18 respuestas ficticias: 9 + 6 + 3 (el grupo de 3 queda protegido).
insert into public.campanas (id, empresa_id, instrumento_id, nombre, modo_acceso, plantilla_invitada)
values ('00000000-0000-4000-8e00-000000000001', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-8c00-000000000002', 'Seguimiento de demostración (ficticio)', 'codigos', 24);
insert into public.campana_dimensiones (campana_id, dimension_id)
values ('00000000-0000-4000-8e00-000000000001', '00000000-0000-4000-8d00-000000000001');

with nuevas as (
  insert into public.respuestas (id, campana_id, dia)
  select ('00000000-0000-4000-8f00-' || lpad(n::text, 12, '0'))::uuid, '00000000-0000-4000-8e00-000000000001', current_date - 30
  from generate_series(1, 18) as n
  returning id
), numeradas as (
  select id, row_number() over (order by id) as n from nuevas
), grupos as (
  insert into public.respuesta_grupos (respuesta_id, grupo_id)
  select id, case when n <= 9 then '00000000-0000-4000-8d10-000000000001'::uuid
                  when n <= 15 then '00000000-0000-4000-8d10-000000000002'::uuid
                  else '00000000-0000-4000-8d10-000000000003'::uuid end
  from numeradas
  returning 1
)
insert into public.respuesta_items (respuesta_id, item_id, valor)
select r.id, i.id, 1 + ((r.n * 7 + i.orden * 3) % 5)
from numeradas r
cross join public.items i
where i.instrumento_id = '00000000-0000-4000-8c00-000000000002';

update public.campanas
set estado = 'cerrada', abierta_el = now() - interval '45 days', cerrada_el = now() - interval '30 days'
where id = '00000000-0000-4000-8e00-000000000001';

-- Evaluación demo ya cerrada, con 8 respuestas ficticias. No se puntúa en la plataforma:
-- sirve para probar la exportación y el registro del informe.
update public.instrumentos
set export_confirmado = true, export_separador = ';', export_cabecera = 'FORMATO DE DEMOSTRACION (ficticio)'
where id = '00000000-0000-4000-8c00-000000000001';

insert into public.campanas (id, empresa_id, instrumento_id, nombre, modo_acceso, plantilla_invitada)
values ('00000000-0000-4000-8e00-000000000002', '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-8c00-000000000001', 'Evaluación de demostración (ficticia)', 'codigos', 24);

with nuevas as (
  insert into public.respuestas (id, campana_id, dia)
  select ('00000000-0000-4000-8f10-' || lpad(n::text, 12, '0'))::uuid, '00000000-0000-4000-8e00-000000000002', current_date - 10
  from generate_series(1, 8) as n
  returning id
), numeradas as (
  select id, row_number() over (order by id) as n from nuevas
)
insert into public.respuesta_items (respuesta_id, item_id, valor)
select r.id, i.id, 1 + ((r.n * 5 + i.orden * 2 + length(i.enunciado)) % 5)
from numeradas r
cross join public.items i
where i.instrumento_id = '00000000-0000-4000-8c00-000000000001';

update public.campanas
set estado = 'cerrada', abierta_el = now() - interval '20 days', cerrada_el = now() - interval '10 days'
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
