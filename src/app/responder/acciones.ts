"use server";

import { redirect } from "next/navigation";
import { consumirIntento } from "@/lib/limites";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { erroresDe, esquemaAccesoRespuesta, esquemaUuid, type EstadoFormulario } from "@/lib/validacion";

// Envío del cuestionario. La persona no tiene cuenta.
// Aquí no se lee la IP, ni cookies, ni ninguna cabecera: no hay nada que vincular a la respuesta.
// El límite de intentos es global: no guarda el código, ni la persona, ni cuándo respondió cada cual.

export async function irAlCuestionario(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const acceso = esquemaAccesoRespuesta.safeParse(datos.get("codigo"));
  if (!acceso.success) return { ok: false, errores: { codigo: erroresDe(acceso.error).formulario ?? "Código no válido." } };
  redirect(`/responder/${encodeURIComponent(acceso.data)}`);
}

const MENSAJES: Record<string, string> = {
  no_valido: "Este código o enlace no es válido.",
  usado: "Este código ya se ha usado. Cada código sirve una sola vez.",
  cerrada: "Esta campaña ya se ha cerrado.",
  no_abierta: "Esta campaña todavía no se ha abierto.",
  incompleto: "Faltan preguntas por responder.",
};

export async function enviarRespuesta(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const acceso = esquemaAccesoRespuesta.safeParse(datos.get("acceso"));
  if (!acceso.success) return { ok: false, mensaje: MENSAJES.no_valido };

  const permitido = await consumirIntento("responder:global", 600, 60);
  if (!permitido) return { ok: false, mensaje: "Hay demasiados envíos a la vez. Pruebe dentro de un minuto." };

  const valores: Record<string, number> = {};
  const grupos: string[] = [];
  for (const [clave, valor] of datos.entries()) {
    if (typeof valor !== "string" || valor === "") continue;
    if (clave.startsWith("item_")) {
      const id = esquemaUuid.safeParse(clave.slice(5));
      const numero = Number(valor);
      if (id.success && Number.isFinite(numero)) valores[id.data] = numero;
    } else if (clave.startsWith("dim_")) {
      const id = esquemaUuid.safeParse(valor);
      if (id.success) grupos.push(id.data);
    }
  }

  const { data, error } = await crearClienteAdmin().rpc("enviar_respuesta", {
    p_acceso: acceso.data,
    p_valores: valores,
    p_grupos: grupos,
  });
  if (error) return { ok: false, mensaje: "No hemos podido guardar su respuesta. Inténtelo de nuevo." };
  if (data !== "ok") return { ok: false, mensaje: MENSAJES[data] ?? MENSAJES.no_valido };
  redirect("/responder/gracias");
}
