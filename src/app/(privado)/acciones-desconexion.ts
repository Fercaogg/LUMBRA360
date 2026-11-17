"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAcceso } from "@/lib/acceso";
import { subirPdf } from "@/lib/documentos";
import { consumirIntento } from "@/lib/limites";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  erroresDe,
  esquemaAprobacion,
  esquemaAudiencia,
  esquemaFormacion,
  esquemaPlantilla,
  esquemaPlantillaDatos,
  esquemaSeccionesPolitica,
  esquemaSeccionPlantilla,
  esquemaUuid,
  type EstadoFormulario,
} from "@/lib/validacion";

// Acciones de desconexión digital. Usan la sesión de quien navega: decide RLS.

type ErrorBd = { code?: string; message: string } | null;

const DEMASIADOS: EstadoFormulario = { ok: false, mensaje: "Demasiados envíos seguidos. Espera unos minutos." };

async function preparar() {
  const acceso = await exigirAcceso();
  const permitido = await consumirIntento(`formularios:${acceso.usuario.id}`, 120, 10 * 60);
  const supabase = await crearClienteServidor();
  return { acceso, supabase, permitido };
}

function traducir(error: ErrorBd): EstadoFormulario {
  if (!error) return { ok: true };
  if (error.code === "P0001") return { ok: false, mensaje: error.message };
  if (error.code === "42501") return { ok: false, mensaje: "No tienes permiso para hacer esto." };
  return { ok: false, mensaje: "No se ha podido guardar. Inténtalo de nuevo." };
}

const campo = (datos: FormData, nombre: string) => datos.get(nombre) ?? "";

// --- Plantillas (administración) ------------------------------------------

export async function crearPlantilla(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const entrada = esquemaPlantilla.safeParse({ nombre: campo(datos, "nombre") });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };
  const { data, error } = await supabase.from("politica_plantillas").insert({ nombre: entrada.data.nombre }).select("id").single();
  if (error || !data) return traducir(error);
  redirect(`/admin/plantillas/${data.id}`);
}

export async function guardarPlantilla(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const entrada = esquemaPlantillaDatos.safeParse({
    id: campo(datos, "id"),
    nombre: campo(datos, "nombre"),
    revisada: datos.get("revisada") === "on",
    nota: campo(datos, "nota"),
  });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };
  const d = entrada.data;
  const { data, error } = await supabase
    .from("politica_plantillas")
    .update({ nombre: d.nombre, revisada_juridicamente: d.revisada, revision_nota: d.nota })
    .eq("id", d.id)
    .select("id");
  if (error) return traducir(error);
  if (!data?.length) return { ok: false, mensaje: "No tienes permiso para hacer esto." };
  revalidatePath("/admin/plantillas", "layout");
  return { ok: true, mensaje: "Guardado." };
}

export async function crearSeccionPlantilla(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const entrada = esquemaSeccionPlantilla.safeParse({
    plantillaId: campo(datos, "plantillaId"),
    titulo: campo(datos, "titulo"),
    cuerpo: String(datos.get("cuerpo") ?? ""),
    ayuda: campo(datos, "ayuda"),
  });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };
  const d = entrada.data;
  const { count } = await supabase.from("politica_plantilla_secciones").select("id", { count: "exact", head: true }).eq("plantilla_id", d.plantillaId);
  const { error } = await supabase
    .from("politica_plantilla_secciones")
    .insert({ plantilla_id: d.plantillaId, titulo: d.titulo, cuerpo: d.cuerpo, ayuda: d.ayuda, orden: (count ?? 0) + 1 });
  if (error) return traducir(error);
  revalidatePath(`/admin/plantillas/${d.plantillaId}`);
  return { ok: true, mensaje: "Sección añadida." };
}

export async function borrarSeccionPlantilla(datos: FormData): Promise<void> {
  const { supabase, permitido } = await preparar();
  const id = esquemaUuid.safeParse(datos.get("id"));
  if (!permitido || !id.success) return;
  await supabase.from("politica_plantilla_secciones").delete().eq("id", id.data);
  revalidatePath("/admin/plantillas", "layout");
}

export async function cambiarEstadoPlantilla(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const id = esquemaUuid.safeParse(datos.get("id"));
  if (!id.success) return { ok: false, mensaje: "Identificador no válido." };
  const accion = datos.get("accion");
  if (accion === "borrar") {
    const { error } = await supabase.from("politica_plantillas").delete().eq("id", id.data);
    if (error) return traducir(error);
    redirect("/admin/plantillas");
  }
  const { error } =
    accion === "retirar"
      ? await supabase.rpc("retirar_plantilla_politica", { p_plantilla: id.data })
      : await supabase.rpc("publicar_plantilla_politica", { p_plantilla: id.data });
  if (error) return traducir(error);
  revalidatePath("/admin/plantillas", "layout");
  return { ok: true, mensaje: accion === "retirar" ? "Plantilla retirada." : "Plantilla publicada." };
}

// --- Política de la empresa -------------------------------------------------

export async function iniciarPolitica(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const empresa = esquemaUuid.safeParse(datos.get("empresaId"));
  const plantilla = esquemaUuid.safeParse(datos.get("plantillaId"));
  if (!empresa.success) return { ok: false, mensaje: "Datos no válidos." };
  if (!plantilla.success) return { ok: false, errores: { plantillaId: "Elige una plantilla." } };
  const { data, error } = await supabase.rpc("iniciar_politica", { p_empresa: empresa.data, p_plantilla: plantilla.data });
  if (error || !data) return traducir(error);
  redirect(`/panel/empresa/${empresa.data}/desconexion/politica/${data}`);
}

export async function guardarPolitica(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const id = esquemaUuid.safeParse(datos.get("politicaId"));
  if (!id.success) return { ok: false, mensaje: "Identificador no válido." };
  const total = Math.min(Number(datos.get("total")) || 0, 40);
  const secciones = Array.from({ length: total }, (_, i) => ({
    titulo: String(datos.get(`titulo_${i}`) ?? ""),
    cuerpo: String(datos.get(`cuerpo_${i}`) ?? ""),
    ayuda: (datos.get(`ayuda_${i}`) as string | null) || null,
  }));
  const entrada = esquemaSeccionesPolitica.safeParse(secciones);
  if (!entrada.success) return { ok: false, mensaje: entrada.error.issues[0]?.message ?? "Revisa las secciones." };

  const { data, error } = await supabase.from("politicas").update({ secciones: entrada.data }).eq("id", id.data).select("id");
  if (error) return traducir(error);
  if (!data?.length) return { ok: false, mensaje: "No tienes permiso para hacer esto." };
  revalidatePath("/panel", "layout");
  return { ok: true, mensaje: "Borrador guardado." };
}

export async function aprobarPolitica(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const entrada = esquemaAprobacion.safeParse({
    politicaId: campo(datos, "politicaId"),
    nombre: campo(datos, "nombre"),
    conforme: datos.get("conforme") === "on",
  });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };
  const { error } = await supabase.rpc("aprobar_politica", { p_politica: entrada.data.politicaId, p_nombre: entrada.data.nombre });
  if (error) return traducir(error);
  revalidatePath("/panel", "layout");
  return { ok: true, mensaje: "Política aprobada." };
}

export async function descartarBorrador(datos: FormData): Promise<void> {
  const { supabase, permitido } = await preparar();
  const id = esquemaUuid.safeParse(datos.get("politicaId"));
  const empresa = esquemaUuid.safeParse(datos.get("empresaId"));
  if (!permitido || !id.success || !empresa.success) return;
  await supabase.from("politicas").delete().eq("id", id.data).eq("estado", "borrador");
  redirect(`/panel/empresa/${empresa.data}/desconexion`);
}

export async function cambiarAcuse(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const id = esquemaUuid.safeParse(datos.get("politicaId"));
  if (!id.success) return { ok: false, mensaje: "Identificador no válido." };
  const abrir = datos.get("accion") === "abrir";
  const { error } = await supabase.rpc("cambiar_acuse", { p_politica: id.data, p_abrir: abrir });
  if (error) return traducir(error);
  revalidatePath("/panel", "layout");
  return { ok: true, mensaje: abrir ? "Acuse abierto. Comparte el enlace." : "Acuse cerrado. El enlace ya no funciona." };
}

// --- Audiencia y formación --------------------------------------------------

export async function registrarAudiencia(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { acceso, supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const entrada = esquemaAudiencia.safeParse({
    empresaId: campo(datos, "empresaId"),
    politicaId: campo(datos, "politicaId"),
    fecha: campo(datos, "fecha"),
    asistentes: campo(datos, "asistentes"),
    notas: campo(datos, "notas"),
  });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };
  const d = entrada.data;

  const subida = await subirPdf(supabase, d.empresaId, datos.get("acta"));
  if ("error" in subida) return { ok: false, errores: { acta: subida.error } };
  const acta = "documento" in subida ? subida.documento : null;

  const { error } = await supabase.from("audiencias").insert({
    empresa_id: d.empresaId,
    politica_id: d.politicaId,
    fecha: d.fecha,
    asistentes: d.asistentes,
    notas: d.notas,
    acta_ruta: acta?.ruta ?? null,
    acta_nombre: acta?.nombre ?? null,
    acta_sha256: acta?.sha256 ?? null,
    creada_por: acceso.usuario.id,
  });
  if (error) return traducir(error);
  revalidatePath(`/panel/empresa/${d.empresaId}/desconexion`);
  return { ok: true, mensaje: "Audiencia registrada." };
}

export async function registrarFormacion(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const { acceso, supabase, permitido } = await preparar();
  if (!permitido) return DEMASIADOS;
  const entrada = esquemaFormacion.safeParse({
    empresaId: campo(datos, "empresaId"),
    titulo: campo(datos, "titulo"),
    fecha: campo(datos, "fecha"),
    descripcion: campo(datos, "descripcion"),
    participantes: campo(datos, "participantes"),
  });
  if (!entrada.success) return { ok: false, errores: erroresDe(entrada.error) };
  const d = entrada.data;

  const subida = await subirPdf(supabase, d.empresaId, datos.get("documento"));
  if ("error" in subida) return { ok: false, errores: { documento: subida.error } };
  const doc = "documento" in subida ? subida.documento : null;

  const { error } = await supabase.from("formaciones").insert({
    empresa_id: d.empresaId,
    titulo: d.titulo,
    fecha: d.fecha,
    descripcion: d.descripcion,
    participantes: d.participantes,
    documento_ruta: doc?.ruta ?? null,
    documento_nombre: doc?.nombre ?? null,
    documento_sha256: doc?.sha256 ?? null,
    creada_por: acceso.usuario.id,
  });
  if (error) return traducir(error);
  revalidatePath(`/panel/empresa/${d.empresaId}/desconexion`);
  return { ok: true, mensaje: "Formación registrada." };
}
