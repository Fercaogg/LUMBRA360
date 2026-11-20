"use server";

import { consumirIntento, ipDeLaPeticion } from "@/lib/limites";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { erroresDe, esquemaSolicitudDemo, type EstadoFormulario } from "@/lib/validacion";

const HORA = 60 * 60;
const GRACIAS: EstadoFormulario = { ok: true, mensaje: "Gracias. Le escribiremos a ese correo para acordar la demostración." };

export async function solicitarDemo(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  // Campo trampa: invisible para las personas. Si llega relleno, es un robot y no se guarda nada.
  if (String(datos.get("web") ?? "") !== "") return GRACIAS;

  const entrada = esquemaSolicitudDemo.safeParse({
    nombre: datos.get("nombre"),
    correo: datos.get("correo"),
    novedades: datos.get("novedades") ?? undefined,
  });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };

  const ip = await ipDeLaPeticion();
  if (!(await consumirIntento(`demo-solicitud:ip:${ip}`, 5, HORA))) {
    return { ok: false, mensaje: "Ha enviado varias solicitudes seguidas. Espere un rato y vuelva a probar." };
  }

  const { error } = await crearClienteAdmin()
    .from("solicitudes_demo")
    .insert({ nombre: entrada.data.nombre, correo: entrada.data.correo, acepta_novedades: entrada.data.novedades === "si" });
  if (error) return { ok: false, mensaje: "No hemos podido enviar la solicitud. Inténtelo de nuevo o escriba a ferca@usal.es." };
  return GRACIAS;
}
