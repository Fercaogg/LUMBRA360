"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAcceso } from "@/lib/acceso";
import { consumirIntento } from "@/lib/limites";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  erroresDe,
  esquemaEmpresa,
  esquemaInvitacion,
  esquemaMarca,
  esquemaPartner,
  esquemaUuid,
  TAMANO_MAXIMO_LOGO,
  TIPOS_LOGO,
  type EstadoFormulario,
} from "@/lib/validacion";

// Acciones del panel. Todas usan la sesión de quien navega: quien decide es RLS.
// Aquí se valida la entrada y se traduce el resultado a un mensaje claro.

const SIN_PERMISO: EstadoFormulario = { ok: false, mensaje: "No tienes permiso para hacer esto." };
const FALLO: EstadoFormulario = { ok: false, mensaje: "No se ha podido guardar. Inténtalo de nuevo." };
const DEMASIADOS: EstadoFormulario = {
  ok: false,
  mensaje: "Demasiados envíos seguidos. Espera unos minutos.",
};

async function preparar() {
  const acceso = await exigirAcceso();
  const permitido = await consumirIntento(`formularios:${acceso.usuario.id}`, 60, 10 * 60);
  const supabase = await crearClienteServidor();
  return { acceso, supabase, permitido };
}

function traducir(codigo: string | undefined): EstadoFormulario {
  if (codigo === "42501") return SIN_PERMISO;
  return FALLO;
}

export async function crearPartner(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const entrada = esquemaPartner.safeParse({ nombre: datos.get("nombre") });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };

  const { error } = await supabase.from("partners").insert({ nombre: entrada.data.nombre });
  if (error) return traducir(error.code);
  revalidatePath("/admin/partners");
  return { ok: true, mensaje: "Partner creado." };
}

export async function crearEmpresa(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { acceso, supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const entrada = esquemaEmpresa.safeParse({
    nombre: datos.get("nombre"),
    plantilla: datos.get("plantilla") ?? "",
    partnerId: datos.get("partnerId") ?? "",
  });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };

  const { data, error } = await supabase
    .from("empresas")
    .insert({
      nombre: entrada.data.nombre,
      plantilla_declarada: entrada.data.plantilla,
      partner_id: entrada.data.partnerId,
      creado_por: acceso.usuario.id,
    })
    .select("id")
    .single();
  if (error || !data) return traducir(error?.code);
  redirect(`/panel/empresa/${data.id}`);
}

export async function invitar(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { acceso, supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const entrada = esquemaInvitacion.safeParse({
    correo: datos.get("correo"),
    rol: datos.get("rol"),
    partnerId: datos.get("partnerId") ?? "",
    empresaId: datos.get("empresaId") ?? "",
  });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };
  const { correo, rol, partnerId, empresaId } = entrada.data;

  const { error } = await supabase.from("invitaciones").insert({
    correo,
    rol,
    partner_id: rol === "empresa" ? null : partnerId,
    empresa_id: rol === "partner" ? null : empresaId,
    creada_por: acceso.usuario.id,
  });
  if (error?.code === "23505") return { ok: false, mensaje: "Ese correo ya tiene esta invitación." };
  if (error?.code === "23514") return { ok: false, mensaje: "Faltan datos para esta invitación." };
  if (error) return traducir(error.code);

  revalidatePath("/panel", "layout");
  revalidatePath("/admin", "layout");
  return {
    ok: true,
    mensaje: "Acceso concedido. Avisa a la persona: entra desde la página de acceso con ese correo.",
  };
}

export async function retirarInvitacion(datos: FormData): Promise<void> {
  const { supabase, permitido } = await preparar();
  const id = esquemaUuid.safeParse(datos.get("id"));
  if (!permitido || !id.success) return;
  await supabase.from("invitaciones").delete().eq("id", id.data).is("aceptada_el", null);
  revalidatePath("/panel", "layout");
  revalidatePath("/admin", "layout");
}

export async function quitarCuentaEmpresa(datos: FormData): Promise<void> {
  const { supabase, permitido } = await preparar();
  const empresa = esquemaUuid.safeParse(datos.get("empresaId"));
  const usuario = esquemaUuid.safeParse(datos.get("usuarioId"));
  const tabla = datos.get("tipo") === "tecnico" ? "tecnico_empresas" : "empresa_miembros";
  if (!permitido || !empresa.success || !usuario.success) return;
  await supabase.from(tabla).delete().eq("empresa_id", empresa.data).eq("usuario_id", usuario.data);
  revalidatePath(`/panel/empresa/${empresa.data}`);
}

function esImagenReal(bytes: Uint8Array, tipo: string): boolean {
  const empieza = (firma: number[], desde = 0) => firma.every((b, i) => bytes[desde + i] === b);
  if (tipo === "image/png") return empieza([0x89, 0x50, 0x4e, 0x47]);
  if (tipo === "image/jpeg") return empieza([0xff, 0xd8, 0xff]);
  if (tipo === "image/webp") return empieza([0x52, 0x49, 0x46, 0x46]) && empieza([0x57, 0x45, 0x42, 0x50], 8);
  return false;
}

export async function guardarMarca(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const entrada = esquemaMarca.safeParse({
    partnerId: datos.get("partnerId"),
    marcaBlanca: datos.get("marcaBlanca") === "on",
    marcaNombre: datos.get("marcaNombre") ?? "",
  });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };
  const { partnerId, marcaBlanca, marcaNombre } = entrada.data;

  let rutaLogo: string | undefined;
  const logo = datos.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const tipo = TIPOS_LOGO.find((t) => t === logo.type);
    if (!tipo) return { ok: false, errores: { logo: "Usa una imagen PNG, JPG o WebP." } };
    if (logo.size > TAMANO_MAXIMO_LOGO) return { ok: false, errores: { logo: "El logo no puede pasar de 512 KB." } };
    const bytes = new Uint8Array(await logo.arrayBuffer());
    if (!esImagenReal(bytes, tipo)) return { ok: false, errores: { logo: "El archivo no es una imagen válida." } };

    const extension = tipo === "image/png" ? "png" : tipo === "image/jpeg" ? "jpg" : "webp";
    rutaLogo = `${partnerId}/logo-${crypto.randomUUID()}.${extension}`;
    const subida = await supabase.storage.from("marcas").upload(rutaLogo, bytes, { contentType: tipo });
    if (subida.error) return SIN_PERMISO;
  }

  const { data, error } = await supabase
    .from("partners")
    .update({
      marca_blanca: marcaBlanca,
      marca_nombre: marcaNombre,
      ...(rutaLogo ? { marca_logo_ruta: rutaLogo } : {}),
    })
    .eq("id", partnerId)
    .select("id");
  if (error) return traducir(error.code);
  if (!data?.length) return SIN_PERMISO;

  revalidatePath(`/panel/partner/${partnerId}`, "layout");
  return { ok: true, mensaje: "Marca guardada." };
}

export async function alternarPendiente(datos: FormData): Promise<void> {
  const { acceso, supabase, permitido } = await preparar();
  const id = esquemaUuid.safeParse(datos.get("id"));
  if (!permitido || !id.success) return;
  const resolver = datos.get("resolver") === "si";
  await supabase
    .from("pendientes")
    .update({
      resuelto_el: resolver ? new Date().toISOString() : null,
      resuelto_por: resolver ? acceso.usuario.id : null,
    })
    .eq("id", id.data);
  revalidatePath("/admin/pendientes");
}
