"use server";

import { redirect } from "next/navigation";
import { urlSitio } from "@/lib/entorno";
import { consumirIntento, ipDeLaPeticion } from "@/lib/limites";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { erroresDe, esquemaAcceso, type EstadoFormulario } from "@/lib/validacion";

const VENTANA = 15 * 60;

// La respuesta es la misma exista o no la cuenta: no se revela quién tiene acceso.
const RESPUESTA: EstadoFormulario = {
  ok: true,
  mensaje: "Si ese correo tiene acceso, recibirás un enlace en unos minutos. Revisa también el correo no deseado.",
};

export async function solicitarEnlace(
  _previo: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const entrada = esquemaAcceso.safeParse({ correo: datos.get("correo") });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };
  const { correo } = entrada.data;

  const ip = await ipDeLaPeticion();
  const porIp = await consumirIntento(`acceso:ip:${ip}`, 10, VENTANA);
  const porCorreo = porIp && (await consumirIntento(`acceso:correo:${correo}`, 3, VENTANA));
  if (!porIp || !porCorreo) {
    return { ok: false, mensaje: "Demasiados intentos. Espera unos minutos y vuelve a probar." };
  }

  const { data: invitado, error } = await crearClienteAdmin().rpc("correo_puede_acceder", {
    p_correo: correo,
  });
  if (error) {
    return { ok: false, mensaje: "No hemos podido procesar la solicitud. Inténtalo de nuevo." };
  }

  if (invitado) {
    const supabase = await crearClienteServidor();
    await supabase.auth.signInWithOtp({
      email: correo,
      options: { emailRedirectTo: `${urlSitio()}/auth/confirmar`, shouldCreateUser: true },
    });
  }
  return RESPUESTA;
}

export async function salir(): Promise<void> {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}
