"use server";

import { redirect } from "next/navigation";
import { consumirIntento } from "@/lib/limites";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { erroresDe, esquemaAcuse, type EstadoFormulario } from "@/lib/validacion";

// Acuse de lectura sin cuenta. Es nominal: guarda el nombre que escribe la persona y la fecha.
// No guarda IP, correo ni dispositivo, y no tiene relación con los cuestionarios anónimos.
export async function registrarAcuse(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const entrada = esquemaAcuse.safeParse({
    token: datos.get("token"),
    nombre: datos.get("nombre"),
    conforme: datos.get("conforme") === "on",
  });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };

  const permitido = await consumirIntento(`acuse:${entrada.data.token}`, 300, 10 * 60);
  if (!permitido) return { ok: false, mensaje: "Hay demasiados envíos a la vez. Pruebe dentro de unos minutos." };

  const { data, error } = await crearClienteAdmin().rpc("registrar_acuse", {
    p_token: entrada.data.token,
    p_nombre: entrada.data.nombre,
  });
  if (error) return { ok: false, mensaje: "No hemos podido guardar el acuse. Inténtelo de nuevo." };
  if (data === "nombre") return { ok: false, errores: { nombre: "Escriba su nombre y apellidos." } };
  if (data !== "ok") return { ok: false, mensaje: "Este enlace ya no admite acuses." };
  redirect("/acuse/gracias");
}
