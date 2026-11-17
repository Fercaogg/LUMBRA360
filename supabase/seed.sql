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
