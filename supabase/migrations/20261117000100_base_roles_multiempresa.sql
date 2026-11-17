-- Fase 1. Base, roles y multiempresa.
-- Cuentas con rol: administrador, partner (gestor), técnico de prevención y empresa.
-- La persona trabajadora no tiene cuenta y no aparece en ninguna tabla de esta fase.

create extension if not exists citext with schema extensions;

create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to authenticated, service_role;

create type public.rol_invitacion as enum ('admin', 'partner', 'tecnico', 'empresa');
create type public.rol_partner as enum ('gestor', 'tecnico');

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  correo extensions.citext not null,
  nombre text check (nombre is null or char_length(nombre) between 1 and 120),
  creado_el timestamptz not null default now()
);

create table public.administradores (
  usuario_id uuid primary key references public.perfiles (id) on delete cascade,
  creado_el timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 120),
  marca_blanca boolean not null default false,
  marca_nombre text check (marca_nombre is null or char_length(marca_nombre) between 2 and 80),
  marca_logo_ruta text check (marca_logo_ruta is null or char_length(marca_logo_ruta) <= 300),
  es_demo boolean not null default false,
  creado_el timestamptz not null default now()
);

create table public.partner_miembros (
  partner_id uuid not null references public.partners (id) on delete cascade,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  rol public.rol_partner not null default 'gestor',
  creado_el timestamptz not null default now(),
  primary key (partner_id, usuario_id)
);
create index partner_miembros_usuario_idx on public.partner_miembros (usuario_id);

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners (id) on delete restrict,
  nombre text not null check (char_length(nombre) between 2 and 160),
  plantilla_declarada integer check (plantilla_declarada is null or plantilla_declarada between 1 and 100000),
  es_demo boolean not null default false,
  creado_por uuid references public.perfiles (id) on delete set null,
  creado_el timestamptz not null default now()
);
create index empresas_partner_idx on public.empresas (partner_id);

create table public.empresa_miembros (
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  creado_el timestamptz not null default now(),
  primary key (empresa_id, usuario_id)
);
create index empresa_miembros_usuario_idx on public.empresa_miembros (usuario_id);

create table public.tecnico_empresas (
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  creado_el timestamptz not null default now(),
  primary key (empresa_id, usuario_id)
);
create index tecnico_empresas_usuario_idx on public.tecnico_empresas (usuario_id);

create table public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  correo extensions.citext not null check (char_length(correo::text) between 5 and 254),
  rol public.rol_invitacion not null,
  partner_id uuid references public.partners (id) on delete cascade,
  empresa_id uuid references public.empresas (id) on delete cascade,
  creada_por uuid references public.perfiles (id) on delete set null,
  creada_el timestamptz not null default now(),
  aceptada_el timestamptz,
  constraint invitacion_destino check (
    (rol = 'admin' and partner_id is null and empresa_id is null)
    or (rol = 'partner' and partner_id is not null and empresa_id is null)
    or (rol = 'tecnico' and (partner_id is not null or empresa_id is not null))
    or (rol = 'empresa' and empresa_id is not null and partner_id is null)
  )
);
create unique index invitaciones_unica_idx on public.invitaciones (
  correo,
  rol,
  coalesce(partner_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(empresa_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Lista interna de lo que falta por confirmar. Solo la ve administración.
create table public.pendientes (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique check (clave ~ '^[a-z0-9_]{3,60}$'),
  modulo text not null check (char_length(modulo) between 2 and 60),
  descripcion text not null check (char_length(descripcion) between 5 and 500),
  creado_el timestamptz not null default now(),
  resuelto_el timestamptz,
  resuelto_por uuid references public.perfiles (id) on delete set null
);

-- Límite de intentos. Las claves llegan ya resumidas (SHA-256): aquí no hay correos ni IP.
create table privado.limites_intentos (
  clave text primary key,
  ventana_inicio timestamptz not null default now(),
  intentos integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Funciones de permisos (usadas por las políticas RLS)
-- ---------------------------------------------------------------------------

create function privado.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.administradores a where a.usuario_id = (select auth.uid())
  );
$$;

create function privado.es_gestor_de(p_partner uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.partner_miembros m
    where m.partner_id = p_partner
      and m.usuario_id = (select auth.uid())
      and m.rol = 'gestor'
  );
$$;

create function privado.es_miembro_de_partner(p_partner uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.partner_miembros m
    where m.partner_id = p_partner and m.usuario_id = (select auth.uid())
  );
$$;

-- Gestiona: administración o gestor del partner al que pertenece la empresa.
create function privado.gestiona_empresa(p_empresa uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.es_admin() or exists (
    select 1
    from public.empresas e
    join public.partner_miembros m on m.partner_id = e.partner_id
    where e.id = p_empresa
      and m.usuario_id = (select auth.uid())
      and m.rol = 'gestor'
  );
$$;

create function privado.es_tecnico_de(p_empresa uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.tecnico_empresas t
    where t.empresa_id = p_empresa and t.usuario_id = (select auth.uid())
  );
$$;

create function privado.es_cuenta_de(p_empresa uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.empresa_miembros em
    where em.empresa_id = p_empresa and em.usuario_id = (select auth.uid())
  );
$$;

-- Ve: quien la gestiona, el técnico asignado y las cuentas de la propia empresa.
create function privado.puede_ver_empresa(p_empresa uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.gestiona_empresa(p_empresa)
    or privado.es_tecnico_de(p_empresa)
    or privado.es_cuenta_de(p_empresa);
$$;

create function privado.puede_ver_perfil(p_usuario uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_usuario = (select auth.uid())
    or privado.es_admin()
    or exists (
      select 1 from public.partner_miembros otro
      where otro.usuario_id = p_usuario and privado.es_gestor_de(otro.partner_id)
    )
    or exists (
      select 1 from public.empresa_miembros em
      where em.usuario_id = p_usuario and privado.gestiona_empresa(em.empresa_id)
    )
    or exists (
      select 1 from public.tecnico_empresas t
      where t.usuario_id = p_usuario and privado.gestiona_empresa(t.empresa_id)
    );
$$;

revoke all on all functions in schema privado from public;
grant execute on all functions in schema privado to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Invitaciones: se aplican solo a cuentas con el correo confirmado
-- ---------------------------------------------------------------------------

create function privado.aplicar_invitaciones(p_usuario uuid, p_correo extensions.citext) returns void
language plpgsql security definer set search_path = '' as $$
declare
  inv public.invitaciones%rowtype;
begin
  for inv in
    select * from public.invitaciones i
    where i.correo = p_correo and i.aceptada_el is null
    for update
  loop
    if inv.rol = 'admin' then
      insert into public.administradores (usuario_id) values (p_usuario)
      on conflict do nothing;
    elsif inv.rol = 'partner' then
      insert into public.partner_miembros (partner_id, usuario_id, rol)
      values (inv.partner_id, p_usuario, 'gestor')
      on conflict (partner_id, usuario_id) do update set rol = 'gestor';
    elsif inv.rol = 'tecnico' then
      if inv.partner_id is not null then
        insert into public.partner_miembros (partner_id, usuario_id, rol)
        values (inv.partner_id, p_usuario, 'tecnico')
        on conflict do nothing;
      end if;
      if inv.empresa_id is not null then
        insert into public.tecnico_empresas (empresa_id, usuario_id)
        values (inv.empresa_id, p_usuario)
        on conflict do nothing;
      end if;
    elsif inv.rol = 'empresa' then
      insert into public.empresa_miembros (empresa_id, usuario_id)
      values (inv.empresa_id, p_usuario)
      on conflict do nothing;
    end if;

    update public.invitaciones set aceptada_el = now() where id = inv.id;
  end loop;
end;
$$;

create function privado.al_cambiar_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email is null then
    return new;
  end if;

  insert into public.perfiles (id, correo)
  values (new.id, new.email)
  on conflict (id) do update set correo = excluded.correo;

  if new.email_confirmed_at is not null then
    perform privado.aplicar_invitaciones(new.id, new.email::extensions.citext);
  end if;
  return new;
end;
$$;

create trigger lumbra_al_crear_usuario
  after insert on auth.users
  for each row execute function privado.al_cambiar_usuario();

create trigger lumbra_al_confirmar_usuario
  after update of email, email_confirmed_at on auth.users
  for each row execute function privado.al_cambiar_usuario();

create function privado.al_crear_invitacion() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_usuario uuid;
begin
  select u.id into v_usuario
  from auth.users u
  where u.email = new.correo::text and u.email_confirmed_at is not null
  limit 1;

  if v_usuario is not null then
    perform privado.aplicar_invitaciones(v_usuario, new.correo);
  end if;
  return null;
end;
$$;

create trigger lumbra_al_crear_invitacion
  after insert on public.invitaciones
  for each row execute function privado.al_crear_invitacion();

revoke all on function privado.aplicar_invitaciones(uuid, extensions.citext) from public, authenticated;
revoke all on function privado.al_cambiar_usuario() from public, authenticated;
revoke all on function privado.al_crear_invitacion() from public, authenticated;

-- ---------------------------------------------------------------------------
-- Funciones públicas
-- ---------------------------------------------------------------------------

-- Marca blanca que debe ver quien entra en una empresa. Devuelve cero filas si no aplica.
create function public.marca_de_empresa(p_empresa uuid)
returns table (nombre text, logo_ruta text)
language sql stable security definer set search_path = '' as $$
  select coalesce(p.marca_nombre, p.nombre), p.marca_logo_ruta
  from public.empresas e
  join public.partners p on p.id = e.partner_id
  where e.id = p_empresa
    and p.marca_blanca
    and privado.puede_ver_empresa(p_empresa);
$$;
revoke all on function public.marca_de_empresa(uuid) from public, anon;
grant execute on function public.marca_de_empresa(uuid) to authenticated;

-- Solo servidor. Devuelve true si el intento cabe en la ventana.
create function public.consumir_intento(p_clave text, p_max integer, p_ventana_segundos integer)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_intentos integer;
begin
  if p_clave !~ '^[a-f0-9]{64}$' or p_max < 1 or p_ventana_segundos < 1 then
    raise exception 'parametros no validos';
  end if;

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

-- Solo servidor. Evita crear cuentas para correos que nadie ha invitado.
create function public.correo_puede_acceder(p_correo text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
      select 1 from public.perfiles p where p.correo = p_correo::extensions.citext
    )
    or exists (
      select 1 from public.invitaciones i
      where i.correo = p_correo::extensions.citext and i.aceptada_el is null
    );
$$;
revoke all on function public.correo_puede_acceder(text) from public, anon, authenticated;
grant execute on function public.correo_puede_acceder(text) to service_role;

-- ---------------------------------------------------------------------------
-- Permisos de tabla. Se concede lo mínimo; anon no recibe nada.
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
revoke all on all tables in schema privado from public, anon, authenticated;

grant select on public.perfiles to authenticated;
grant update (nombre) on public.perfiles to authenticated;

grant select on public.administradores to authenticated;

grant select, delete on public.partners to authenticated;
grant insert (nombre) on public.partners to authenticated;
grant update (nombre, marca_blanca, marca_nombre, marca_logo_ruta) on public.partners to authenticated;

grant select, delete on public.partner_miembros to authenticated;

grant select, delete on public.empresas to authenticated;
grant insert (nombre, plantilla_declarada, partner_id, creado_por) on public.empresas to authenticated;
grant update (nombre, plantilla_declarada) on public.empresas to authenticated;

grant select, delete on public.empresa_miembros to authenticated;
grant select, insert, delete on public.tecnico_empresas to authenticated;

grant select, delete on public.invitaciones to authenticated;
grant insert (correo, rol, partner_id, empresa_id, creada_por) on public.invitaciones to authenticated;

grant select, delete on public.pendientes to authenticated;
grant insert (clave, modulo, descripcion) on public.pendientes to authenticated;
grant update (descripcion, resuelto_el, resuelto_por) on public.pendientes to authenticated;

grant all on all tables in schema public to service_role;
grant all on all tables in schema privado to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.perfiles enable row level security;
alter table public.administradores enable row level security;
alter table public.partners enable row level security;
alter table public.partner_miembros enable row level security;
alter table public.empresas enable row level security;
alter table public.empresa_miembros enable row level security;
alter table public.tecnico_empresas enable row level security;
alter table public.invitaciones enable row level security;
alter table public.pendientes enable row level security;
alter table privado.limites_intentos enable row level security;

-- perfiles
create policy perfiles_ver on public.perfiles for select to authenticated
  using (privado.puede_ver_perfil(id));
create policy perfiles_editar_propio on public.perfiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- administradores
create policy administradores_ver on public.administradores for select to authenticated
  using (usuario_id = (select auth.uid()) or privado.es_admin());

-- partners
create policy partners_ver on public.partners for select to authenticated
  using (privado.es_admin() or privado.es_miembro_de_partner(id));
create policy partners_crear on public.partners for insert to authenticated
  with check (privado.es_admin());
create policy partners_editar on public.partners for update to authenticated
  using (privado.es_admin() or privado.es_gestor_de(id))
  with check (privado.es_admin() or privado.es_gestor_de(id));
create policy partners_borrar on public.partners for delete to authenticated
  using (privado.es_admin());

-- partner_miembros
create policy partner_miembros_ver on public.partner_miembros for select to authenticated
  using (
    usuario_id = (select auth.uid())
    or privado.es_admin()
    or privado.es_gestor_de(partner_id)
  );
create policy partner_miembros_borrar on public.partner_miembros for delete to authenticated
  using (privado.es_admin());

-- empresas
-- Se evalúa con las columnas de la fila (no releyendo la tabla) para que
-- "insert ... returning" funcione en la misma sentencia del alta.
create policy empresas_ver on public.empresas for select to authenticated
  using (
    privado.es_admin()
    or (partner_id is not null and privado.es_gestor_de(partner_id))
    or privado.es_tecnico_de(id)
    or privado.es_cuenta_de(id)
  );
create policy empresas_crear on public.empresas for insert to authenticated
  with check (
    creado_por = (select auth.uid())
    and (
      privado.es_admin()
      or (partner_id is not null and privado.es_gestor_de(partner_id))
    )
  );
create policy empresas_editar on public.empresas for update to authenticated
  using (privado.es_admin() or (partner_id is not null and privado.es_gestor_de(partner_id)))
  with check (privado.es_admin() or (partner_id is not null and privado.es_gestor_de(partner_id)));
create policy empresas_borrar on public.empresas for delete to authenticated
  using (privado.es_admin());

-- empresa_miembros
create policy empresa_miembros_ver on public.empresa_miembros for select to authenticated
  using (usuario_id = (select auth.uid()) or privado.gestiona_empresa(empresa_id));
create policy empresa_miembros_borrar on public.empresa_miembros for delete to authenticated
  using (privado.gestiona_empresa(empresa_id));

-- tecnico_empresas
create policy tecnico_empresas_ver on public.tecnico_empresas for select to authenticated
  using (usuario_id = (select auth.uid()) or privado.gestiona_empresa(empresa_id));
create policy tecnico_empresas_asignar on public.tecnico_empresas for insert to authenticated
  with check (
    privado.gestiona_empresa(empresa_id)
    and (
      privado.es_admin()
      or exists (
        select 1
        from public.empresas e
        join public.partner_miembros m on m.partner_id = e.partner_id
        where e.id = empresa_id and m.usuario_id = tecnico_empresas.usuario_id
      )
    )
  );
create policy tecnico_empresas_borrar on public.tecnico_empresas for delete to authenticated
  using (privado.gestiona_empresa(empresa_id));

-- invitaciones
create policy invitaciones_ver on public.invitaciones for select to authenticated
  using (
    privado.es_admin()
    or (partner_id is not null and privado.es_gestor_de(partner_id))
    or (empresa_id is not null and privado.gestiona_empresa(empresa_id))
  );
create policy invitaciones_crear on public.invitaciones for insert to authenticated
  with check (
    creada_por = (select auth.uid())
    and (
      privado.es_admin()
      or (
        rol <> 'admin'
        and (partner_id is null or privado.es_gestor_de(partner_id))
        and (empresa_id is null or privado.gestiona_empresa(empresa_id))
      )
    )
  );
create policy invitaciones_borrar on public.invitaciones for delete to authenticated
  using (
    aceptada_el is null
    and (
      privado.es_admin()
      or (partner_id is not null and privado.es_gestor_de(partner_id))
      or (empresa_id is not null and privado.gestiona_empresa(empresa_id))
    )
  );

-- pendientes: solo administración
create policy pendientes_admin on public.pendientes for all to authenticated
  using (privado.es_admin()) with check (privado.es_admin());

-- privado.limites_intentos: sin políticas. Solo entra la función consumir_intento.

-- ---------------------------------------------------------------------------
-- Almacenamiento: logotipos de marca blanca
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marcas', 'marcas', true, 524288, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- Ruta obligatoria: <partner_id>/<archivo>. El cubo es de lectura pública.
create policy marcas_subir on storage.objects for insert to authenticated
  with check (
    bucket_id = 'marcas'
    and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    and (privado.es_admin() or privado.es_gestor_de(((storage.foldername(name))[1])::uuid))
  );
create policy marcas_cambiar on storage.objects for update to authenticated
  using (
    bucket_id = 'marcas'
    and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    and (privado.es_admin() or privado.es_gestor_de(((storage.foldername(name))[1])::uuid))
  );
create policy marcas_borrar on storage.objects for delete to authenticated
  using (
    bucket_id = 'marcas'
    and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    and (privado.es_admin() or privado.es_gestor_de(((storage.foldername(name))[1])::uuid))
  );

-- ---------------------------------------------------------------------------
-- Pendientes conocidos al cerrar la fase 1 (son reales, no datos de demostración)
-- ---------------------------------------------------------------------------

insert into public.pendientes (clave, modulo, descripcion) values
  ('instrumento_licencia', 'Evaluación psicosocial', 'Instrumento y licencia por confirmar. El banco de ítems está vacío.'),
  ('politica_revision_juridica', 'Desconexión digital', 'La plantilla de política interna necesita revisión jurídica.'),
  ('textos_legales', 'Web pública', 'Aviso legal, privacidad, cookies y contrato de encargado sin redactar ni revisar.'),
  ('stripe_claves', 'Cobro', 'Faltan las claves de Stripe en modo test.'),
  ('resend_remitente', 'Correo', 'Falta la clave de Resend y el dominio remitente verificado.'),
  ('plantillas_correo_acceso', 'Acceso', 'Configurar en Supabase las plantillas de correo de acceso con token_hash.'),
  ('csp_estricta', 'Seguridad', 'La CSP permite scripts en línea. Endurecer con nonces en la fase 8.');
