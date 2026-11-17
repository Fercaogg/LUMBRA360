import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { crearClienteAdmin } from "@/lib/supabase/admin";

// Límite de intentos guardado en Postgres. La clave se resume antes de guardarla:
// en la tabla no queda ni el correo ni la IP.
export async function consumirIntento(
  clave: string,
  maximo: number,
  ventanaSegundos: number,
): Promise<boolean> {
  const resumen = createHash("sha256").update(clave).digest("hex");
  const { data, error } = await crearClienteAdmin().rpc("consumir_intento", {
    p_clave: resumen,
    p_max: maximo,
    p_ventana_segundos: ventanaSegundos,
  });
  // Si el límite no se puede comprobar, se deniega.
  if (error) return false;
  return data === true;
}

export async function ipDeLaPeticion(): Promise<string> {
  const cabeceras = await headers();
  const reenviada = cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim();
  return reenviada || cabeceras.get("x-real-ip") || "desconocida";
}
