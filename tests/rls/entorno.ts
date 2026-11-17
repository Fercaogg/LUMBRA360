import { execSync } from "node:child_process";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Los tests de RLS corren contra el Supabase local (npx supabase start).
// Las claves se leen de la pila local en el momento. No hay claves en el repositorio.

type EstadoLocal = { API_URL: string; ANON_KEY: string; SERVICE_ROLE_KEY: string };

let estado: EstadoLocal | null = null;

function leerEstado(): EstadoLocal {
  if (estado) return estado;
  const url = process.env.SUPABASE_TEST_URL;
  const anon = process.env.SUPABASE_TEST_ANON_KEY;
  const servicio = process.env.SUPABASE_TEST_SERVICE_KEY;
  if (url && anon && servicio) {
    estado = { API_URL: url, ANON_KEY: anon, SERVICE_ROLE_KEY: servicio };
    return estado;
  }
  const salida = execSync("npx supabase status -o json", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const datos = JSON.parse(salida.slice(salida.indexOf("{"))) as EstadoLocal;
  if (!/^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(datos.API_URL)) {
    throw new Error("Los tests de RLS solo se ejecutan contra una base de datos local.");
  }
  estado = datos;
  return estado;
}

const opciones = { auth: { persistSession: false, autoRefreshToken: false } };

export function clienteServicio(): SupabaseClient {
  const e = leerEstado();
  return createClient(e.API_URL, e.SERVICE_ROLE_KEY, opciones);
}

export function clienteAnonimo(): SupabaseClient {
  const e = leerEstado();
  return createClient(e.API_URL, e.ANON_KEY, opciones);
}

const CLAVE_TEST = "Clave-solo-para-tests-locales-1";

export function correoDePrueba(etiqueta: string, tanda: string): string {
  return `${etiqueta}.${tanda}@prueba.invalid`;
}

export async function crearUsuario(
  correo: string,
  confirmado = true,
): Promise<{ id: string; correo: string }> {
  const { data, error } = await clienteServicio().auth.admin.createUser({
    email: correo,
    password: CLAVE_TEST,
    email_confirm: confirmado,
  });
  if (error || !data.user) throw new Error(`No se pudo crear ${correo}: ${error?.message}`);
  return { id: data.user.id, correo };
}

export async function entrarComo(correo: string): Promise<SupabaseClient> {
  const cliente = clienteAnonimo();
  const { error } = await cliente.auth.signInWithPassword({ email: correo, password: CLAVE_TEST });
  if (error) throw new Error(`No se pudo entrar como ${correo}: ${error.message}`);
  return cliente;
}

export async function borrarUsuarios(ids: string[]): Promise<void> {
  const servicio = clienteServicio();
  for (const id of ids) await servicio.auth.admin.deleteUser(id);
}
