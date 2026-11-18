-- ============================================================================
-- Visor de demostración: una cuenta que solo puede MIRAR una empresa de
-- demostración (datos ficticios). La usa el botón «Demo» de la web.
--
-- Garantías:
-- 1. Solo ve empresas marcadas es_demo, y solo la que tenga asignada.
-- 2. No puede escribir nada: un disparador en todas las tablas de public
--    rechaza cualquier INSERT, UPDATE o DELETE hecho con su sesión, también
--    dentro de funciones security definer (que saltan RLS pero no disparadores).
-- 3. La fila de visor solo la crea el servidor con la clave secreta.
-- Si se añaden tablas nuevas, hay que crearles también el disparador.
-- ============================================================================

create table public.visores_demo (
  usuario_id uuid primary key references public.perfiles (id) on delete cascade,
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  creado_el timestamptz not null default now()
);
alter table public.visores_demo enable row level security;
grant select on public.visores_demo to authenticated;
create policy visores_demo_ver on public.visores_demo for select to authenticated
  using (usuario_id = (select auth.uid()));

create function privado.es_visor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.visores_demo v where v.usuario_id = (select auth.uid()));
$$;

create function privado.es_visor_de(p_empresa uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.visores_demo v
    join public.empresas e on e.id = v.empresa_id
    where v.usuario_id = (select auth.uid()) and v.empresa_id = p_empresa and e.es_demo
  );
$$;
revoke all on function privado.es_visor() from public;
revoke all on function privado.es_visor_de(uuid) from public;
grant execute on function privado.es_visor(), privado.es_visor_de(uuid) to authenticated, service_role;

-- Ver: el visor se suma a quien puede ver la empresa.
create or replace function privado.puede_ver_empresa(p_empresa uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.gestiona_empresa(p_empresa)
    or privado.es_tecnico_de(p_empresa)
    or privado.es_cuenta_de(p_empresa)
    or privado.es_visor_de(p_empresa);
$$;

drop policy empresas_ver on public.empresas;
create policy empresas_ver on public.empresas for select to authenticated
  using (
    privado.es_admin()
    or (partner_id is not null and privado.es_gestor_de(partner_id))
    or privado.es_tecnico_de(id)
    or privado.es_cuenta_de(id)
    or privado.es_visor_de(id)
  );

-- Escribir: nunca.
create function privado.bloquear_visor() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if privado.es_visor() then
    raise exception 'Está en la demostración: solo puede consultar.' using errcode = '42501';
  end if;
  return null;
end;
$$;

do $$
declare
  t record;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relkind = 'r'
  loop
    execute format(
      'create trigger bloquear_visor before insert or update or delete on public.%I for each statement execute function privado.bloquear_visor()',
      t.relname);
  end loop;
end;
$$;

-- Tampoco puede subir documentos.
create policy documentos_visor_no on storage.objects as restrictive for insert to authenticated
  with check (not privado.es_visor());
