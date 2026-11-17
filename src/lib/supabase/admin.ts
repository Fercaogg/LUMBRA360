import "server-only";
import { createClient } from "@supabase/supabase-js";
import { urlSupabase } from "@/lib/entorno";
import type { Database } from "./tipos";

// Cliente con la clave secreta. Salta RLS: solo se usa en servidor y para tareas contadas.
// En la fase 1: límite de intentos y comprobación de correo invitado.
export function crearClienteAdmin() {
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!clave) {
    throw new Error("Falta la variable de entorno SUPABASE_SECRET_KEY. Revisa .env.example.");
  }
  return createClient<Database>(urlSupabase(), clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
