import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { clavePublicaSupabase, urlSupabase } from "@/lib/entorno";
import type { Database } from "./tipos";

// Cliente con la sesión de quien navega. Todo lo que lee pasa por RLS.
export async function crearClienteServidor() {
  // Siempre en tiempo de petición: una sesión nunca se prerenderiza.
  await connection();
  const almacen = await cookies();
  return createServerClient<Database>(urlSupabase(), clavePublicaSupabase(), {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(nuevas) {
        try {
          nuevas.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          // Llamado desde un componente de servidor: no se pueden escribir cookies.
          // El proxy refresca la sesión en cada petición.
        }
      },
    },
  });
}
