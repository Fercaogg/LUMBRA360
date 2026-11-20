-- Solicitudes de demostración desde la web pública.
-- Solo se guarda lo mínimo: nombre, correo y si acepta recibir novedades (casilla aparte, opcional).
-- Se escribe solo desde el servidor (clave secreta) y solo la administración puede leer y borrar.

create table public.solicitudes_demo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 120),
  correo text not null check (char_length(correo) between 3 and 254),
  acepta_novedades boolean not null default false,
  creada_el timestamptz not null default now()
);

comment on table public.solicitudes_demo is
  'Solicitudes de demostración. Se conservan solo durante el piloto (curso 2026/2027).';

alter table public.solicitudes_demo enable row level security;

create policy solicitudes_demo_leer on public.solicitudes_demo for select to authenticated
  using (privado.es_admin());

create policy solicitudes_demo_borrar on public.solicitudes_demo for delete to authenticated
  using (privado.es_admin());

-- Sin políticas de alta ni de cambio: el alta la hace el servidor con la clave secreta.
revoke all on public.solicitudes_demo from anon;
grant select, delete on public.solicitudes_demo to authenticated;

-- El visor de la demostración tampoco puede tocarla.
create trigger bloquear_visor before insert or update or delete on public.solicitudes_demo
  for each statement execute function privado.bloquear_visor();

insert into public.pendientes (clave, modulo, descripcion) values
  ('legal_revision', 'Legal', 'Revisar el aviso legal, la privacidad y las cookies con un profesional antes de activar la indexación.'),
  ('legal_titularidad', 'Legal', 'Confirmar con la Fundación General de la USAL cómo debe figurar la titularidad del prototipo.'),
  ('correo_proveedor', 'Correo', 'Elegir el proveedor de envío de correo (Supabase, Resend o la USAL) y añadirlo a la política de privacidad.')
on conflict (clave) do nothing;

-- Los registros de intentos (IP o correo resumidos, nunca en claro) se borran a las 24 horas.
create or replace function public.consumir_intento(p_clave text, p_max integer, p_ventana_segundos integer)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_intentos integer;
begin
  if p_clave !~ '^[a-f0-9]{64}$' or p_max < 1 or p_ventana_segundos < 1 then
    raise exception 'parametros no validos';
  end if;

  delete from privado.limites_intentos
  where ventana_inicio < now() - greatest(interval '24 hours', make_interval(secs => p_ventana_segundos));

  insert into privado.limites_intentos as l (clave, ventana_inicio, intentos)
  values (p_clave, now(), 1)
  on conflict (clave) do update
    set intentos = case
          when l.ventana_inicio < now() - make_interval(secs => p_ventana_segundos) then 1
          else l.intentos + 1
        end,
        ventana_inicio = case
          when l.ventana_inicio < now() - make_interval(secs => p_ventana_segundos) then now()
          else l.ventana_inicio
        end
  returning l.intentos into v_intentos;

  return v_intentos <= p_max;
end;
$$;
revoke all on function public.consumir_intento(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consumir_intento(text, integer, integer) to service_role;
