"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { exigirAcceso } from "@/lib/acceso";
import { consumirIntento } from "@/lib/limites";
import { mensajeBd } from "@/lib/mensajes";
import { subirPdf } from "@/lib/documentos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  erroresDe,
  esquemaCampana,
  esquemaCodigos,
  esquemaDimension,
  esquemaEscala,
  esquemaExportacion,
  esquemaFactor,
  esquemaFirma,
  esquemaGrupo,
  esquemaInstrumento,
  esquemaInstrumentoDatos,
  esquemaItem,
  esquemaMedida,
  esquemaNivel,
  esquemaObservacion,
  esquemaOpcion,
  esquemaUuid,
  ESTADOS_MEDIDA,
  TABLAS_INSTRUMENTO,
  type EstadoFormulario,
} from "@/lib/validacion";

// Acciones de la fase 2. Usan la sesión de quien navega: quien decide es RLS
// y las funciones de la base de datos. Aquí se valida y se traduce el resultado.

type ErrorBd = { code?: string; message: string } | null;

async function preparar() {
  const acceso = await exigirAcceso();
  const permitido = await consumirIntento(`formularios:${acceso.usuario.id}`, 120, 10 * 60);
  const supabase = await crearClienteServidor();
  return { acceso, supabase, permitido };
}

function traducir(error: ErrorBd): EstadoFormulario {
  if (!error) return { ok: true };
  // P0001: mensajes escritos por nuestras propias funciones, ya en castellano.
  if (error.code === "P0001") return { ok: false, mensaje: mensajeBd(error.message) };
  if (error.code === "42501") return { ok: false, mensaje: "No tiene permiso para hacer esto." };
  if (error.code === "23505") return { ok: false, mensaje: "Ya existe uno igual." };
  if (error.code === "23503") return { ok: false, mensaje: "No se puede borrar porque ya se está usando." };
  return { ok: false, mensaje: "No se ha podido guardar. Inténtelo de nuevo." };
}

const DEMASIADOS: EstadoFormulario = { ok: false, mensaje: "Demasiados envíos seguidos. Espere unos minutos." };

// Valida, ejecuta y devuelve un estado de formulario. Reduce repetición.
async function ejecutar<E extends z.ZodType>(
  esquema: E,
  entrada: unknown,
  hacer: (
    datos: z.output<E>,
    ctx: Awaited<ReturnType<typeof preparar>>,
  ) => Promise<{ error: ErrorBd; exito?: string; revalidar?: string; lista?: string[] }>,
): Promise<EstadoFormulario> {
  const ctx = await preparar();
  if (!ctx.permitido) return DEMASIADOS;
  const datos = esquema.safeParse(entrada);
  if (!datos.success) return { ok: false, errores: erroresDe(datos.error) };
  const { error, exito, revalidar, lista } = await hacer(datos.data, ctx);
  if (error) return traducir(error);
  if (revalidar) revalidatePath(revalidar, "layout");
  return { ok: true, mensaje: exito ?? "Guardado.", lista };
}

const campo = (datos: FormData, nombre: string) => datos.get(nombre) ?? "";

// --- Instrumentos (administración) -----------------------------------------

export async function crearInstrumento(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  let destino = "";
  const estado = await ejecutar(
    esquemaInstrumento,
    { nombre: campo(datos, "nombre"), tipo: campo(datos, "tipo"), descripcion: campo(datos, "descripcion"), minutos: campo(datos, "minutos") },
    async (d, { supabase }) => {
      const { data, error } = await supabase
        .from("instrumentos")
        .insert({ nombre: d.nombre, tipo: d.tipo, descripcion: d.descripcion, minutos_estimados: d.minutos })
        .select("id")
        .single();
      if (data) destino = `/admin/instrumentos/${data.id}`;
      return { error };
    },
  );
  if (estado.ok && destino) redirect(destino);
  return estado;
}

export async function guardarInstrumento(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(
    esquemaInstrumentoDatos,
    {
      id: campo(datos, "id"),
      nombre: campo(datos, "nombre"),
      descripcion: campo(datos, "descripcion"),
      minutos: campo(datos, "minutos"),
      licenciaConfirmada: datos.get("licenciaConfirmada") === "on",
      licenciaNota: campo(datos, "licenciaNota"),
    },
    async (d, { supabase }) => {
      const { error } = await supabase
        .from("instrumentos")
        .update({
          nombre: d.nombre,
          descripcion: d.descripcion,
          minutos_estimados: d.minutos,
          licencia_confirmada: d.licenciaConfirmada,
          licencia_nota: d.licenciaNota,
        })
        .eq("id", d.id);
      return { error, revalidar: `/admin/instrumentos/${d.id}` };
    },
  );
}

export async function crearEscala(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(esquemaEscala, { instrumentoId: campo(datos, "instrumentoId"), nombre: campo(datos, "nombre") }, async (d, { supabase }) => {
    const { error } = await supabase.from("escalas").insert({ instrumento_id: d.instrumentoId, nombre: d.nombre });
    return { error, exito: "Escala añadida.", revalidar: `/admin/instrumentos/${d.instrumentoId}` };
  });
}

export async function crearOpcion(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(
    esquemaOpcion,
    { escalaId: campo(datos, "escalaId"), etiqueta: campo(datos, "etiqueta"), valor: campo(datos, "valor"), codigo: campo(datos, "codigo") },
    async (d, { supabase }) => {
      const { error } = await supabase.from("escala_opciones").insert({ escala_id: d.escalaId, etiqueta: d.etiqueta, valor: d.valor, orden: Math.round(d.valor), codigo_export: d.codigo });
      return { error, exito: "Opción añadida.", revalidar: "/admin/instrumentos" };
    },
  );
}

export async function crearFactor(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(
    esquemaFactor,
    { instrumentoId: campo(datos, "instrumentoId"), nombre: campo(datos, "nombre"), metodo: campo(datos, "metodo") },
    async (d, { supabase }) => {
      const { count } = await supabase.from("factores").select("id", { count: "exact", head: true }).eq("instrumento_id", d.instrumentoId);
      const { error } = await supabase.from("factores").insert({ instrumento_id: d.instrumentoId, nombre: d.nombre, metodo: d.metodo, orden: (count ?? 0) + 1 });
      return { error, exito: "Factor añadido.", revalidar: `/admin/instrumentos/${d.instrumentoId}` };
    },
  );
}

export async function crearNivel(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(
    esquemaNivel,
    { factorId: campo(datos, "factorId"), etiqueta: campo(datos, "etiqueta"), desde: campo(datos, "desde"), tono: campo(datos, "tono") },
    async (d, { supabase }) => {
      const { error } = await supabase.from("niveles").insert({ factor_id: d.factorId, etiqueta: d.etiqueta, desde: d.desde, tono: d.tono });
      return { error, exito: "Nivel añadido.", revalidar: "/admin/instrumentos" };
    },
  );
}

export async function crearItem(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(
    esquemaItem,
    {
      instrumentoId: campo(datos, "instrumentoId"),
      factorId: campo(datos, "factorId"),
      escalaId: campo(datos, "escalaId"),
      enunciado: campo(datos, "enunciado"),
      invertido: datos.get("invertido") === "on",
    },
    async (d, { supabase }) => {
      const { count } = await supabase.from("items").select("id", { count: "exact", head: true }).eq("factor_id", d.factorId);
      const { error } = await supabase.from("items").insert({
        instrumento_id: d.instrumentoId, factor_id: d.factorId, escala_id: d.escalaId, enunciado: d.enunciado, invertido: d.invertido, orden: (count ?? 0) + 1,
      });
      return { error, exito: "Ítem añadido.", revalidar: `/admin/instrumentos/${d.instrumentoId}` };
    },
  );
}

export async function borrarElementoInstrumento(datos: FormData): Promise<void> {
  const { supabase, permitido } = await preparar();
  const id = esquemaUuid.safeParse(datos.get("id"));
  const tabla = TABLAS_INSTRUMENTO.find((t) => t === datos.get("tabla"));
  if (!permitido || !id.success || !tabla) return;
  await supabase.from(tabla).delete().eq("id", id.data);
  revalidatePath("/admin/instrumentos", "layout");
}

export async function cambiarEstadoInstrumento(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const ctx = await preparar();
  if (!ctx.permitido) return DEMASIADOS;
  const id = esquemaUuid.safeParse(datos.get("id"));
  if (!id.success) return { ok: false, mensaje: "Identificador no válido." };
  const accion = datos.get("accion");

  if (accion === "borrar") {
    const { error } = await ctx.supabase.from("instrumentos").delete().eq("id", id.data);
    if (error) return traducir(error);
    redirect("/admin/instrumentos");
  }
  const { error } =
    accion === "retirar"
      ? await ctx.supabase.rpc("retirar_instrumento", { p_instrumento: id.data })
      : await ctx.supabase.rpc("publicar_instrumento", { p_instrumento: id.data });
  if (error) return traducir(error);
  revalidatePath("/admin/instrumentos", "layout");
  return { ok: true, mensaje: accion === "retirar" ? "Instrumento retirado." : "Instrumento publicado." };
}

export async function guardarExportacion(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(
    esquemaExportacion,
    {
      id: campo(datos, "id"),
      separador: String(datos.get("separador") ?? ""),
      cabecera: campo(datos, "cabecera"),
      finLinea: campo(datos, "finLinea"),
      confirmado: datos.get("confirmado") === "on",
    },
    async (d, { supabase }) => {
      const { error } = await supabase
        .from("instrumentos")
        .update({ export_separador: d.separador, export_cabecera: d.cabecera, export_fin_linea: d.finLinea, export_confirmado: d.confirmado })
        .eq("id", d.id);
      return { error, exito: "Formato guardado.", revalidar: `/admin/instrumentos/${d.id}` };
    },
  );
}

// --- Estructura de la empresa ----------------------------------------------

export async function crearDimension(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(esquemaDimension, { empresaId: campo(datos, "empresaId"), nombre: campo(datos, "nombre") }, async (d, { supabase }) => {
    const { error } = await supabase.from("dimensiones").insert({ empresa_id: d.empresaId, nombre: d.nombre });
    return { error, exito: "Dimensión añadida.", revalidar: `/panel/empresa/${d.empresaId}` };
  });
}

export async function crearGrupo(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(esquemaGrupo, { dimensionId: campo(datos, "dimensionId"), nombre: campo(datos, "nombre") }, async (d, { supabase }) => {
    const { count } = await supabase.from("grupos").select("id", { count: "exact", head: true }).eq("dimension_id", d.dimensionId);
    const { error } = await supabase.from("grupos").insert({ dimension_id: d.dimensionId, nombre: d.nombre, orden: (count ?? 0) + 1 });
    return { error, exito: "Grupo añadido.", revalidar: "/panel" };
  });
}

export async function borrarEstructura(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const ctx = await preparar();
  if (!ctx.permitido) return DEMASIADOS;
  const id = esquemaUuid.safeParse(datos.get("id"));
  const tabla = datos.get("tabla") === "dimensiones" ? "dimensiones" : "grupos";
  if (!id.success) return { ok: false, mensaje: "Identificador no válido." };
  const { error } = await ctx.supabase.from(tabla).delete().eq("id", id.data);
  if (error) return traducir(error);
  revalidatePath("/panel", "layout");
  return { ok: true, mensaje: "Borrado." };
}

// --- Campañas ---------------------------------------------------------------

export async function crearCampana(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  let destino = "";
  const estado = await ejecutar(
    esquemaCampana,
    {
      empresaId: campo(datos, "empresaId"),
      instrumentoId: campo(datos, "instrumentoId"),
      nombre: campo(datos, "nombre"),
      modo: campo(datos, "modo"),
      plantilla: campo(datos, "plantilla"),
      minimo: campo(datos, "minimo"),
      dimensiones: datos.getAll("dimensiones"),
    },
    async (d, { supabase, acceso }) => {
      const { data: inst } = await supabase.from("instrumentos").select("tipo").eq("id", d.instrumentoId).maybeSingle();
      if (inst?.tipo === "evaluacion" && d.dimensiones.length > 0) {
        return { error: { code: "P0001", message: "En las evaluaciones no se pregunta el grupo. Desmarque los grupos." } };
      }
      const { data, error } = await supabase
        .from("campanas")
        .insert({
          empresa_id: d.empresaId,
          instrumento_id: d.instrumentoId,
          nombre: d.nombre,
          modo_acceso: d.modo,
          plantilla_invitada: d.plantilla,
          minimo_grupo: d.minimo,
          creada_por: acceso.usuario.id,
        })
        .select("id")
        .single();
      if (error || !data) return { error: error ?? { message: "sin datos" } };
      if (d.dimensiones.length > 0) {
        const enlace = await supabase
          .from("campana_dimensiones")
          .insert(d.dimensiones.map((dimension_id) => ({ campana_id: data.id, dimension_id })));
        if (enlace.error) {
          await supabase.from("campanas").delete().eq("id", data.id);
          return { error: enlace.error };
        }
      }
      destino = `/panel/empresa/${d.empresaId}/campanas/${data.id}`;
      return { error: null };
    },
  );
  if (estado.ok && destino) redirect(destino);
  return estado;
}

export async function cambiarEstadoCampana(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const ctx = await preparar();
  if (!ctx.permitido) return DEMASIADOS;
  const id = esquemaUuid.safeParse(datos.get("id"));
  if (!id.success) return { ok: false, mensaje: "Identificador no válido." };
  const abrir = datos.get("accion") === "abrir";
  const { error } = abrir
    ? await ctx.supabase.rpc("abrir_campana", { p_campana: id.data })
    : await ctx.supabase.rpc("cerrar_campana", { p_campana: id.data });
  if (error) return traducir(error);
  revalidatePath("/panel", "layout");
  return { ok: true, mensaje: abrir ? "Campaña abierta." : "Campaña cerrada. Ya puede ver los resultados." };
}

export async function generarCodigos(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(esquemaCodigos, { campanaId: campo(datos, "campanaId"), cantidad: campo(datos, "cantidad") }, async (d, { supabase }) => {
    const { data, error } = await supabase.rpc("generar_codigos", { p_campana: d.campanaId, p_cantidad: d.cantidad });
    return {
      error,
      lista: data ?? [],
      exito: "Códigos generados. Cópielos o descárguelos ahora: no se volverán a mostrar.",
      revalidar: "/panel",
    };
  });
}

// --- Informe ----------------------------------------------------------------

export async function prepararInforme(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const ctx = await preparar();
  if (!ctx.permitido) return DEMASIADOS;
  const id = esquemaUuid.safeParse(datos.get("campanaId"));
  if (!id.success) return { ok: false, mensaje: "Identificador no válido." };
  const { error } = await ctx.supabase.rpc("preparar_informe", { p_campana: id.data });
  if (error) return traducir(error);
  revalidatePath("/panel", "layout");
  return { ok: true, mensaje: "Informe preparado." };
}

export async function anadirObservacion(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(
    esquemaObservacion,
    { informeId: campo(datos, "informeId"), texto: campo(datos, "texto") },
    async (d, { supabase, acceso }) => {
      const { error } = await supabase
        .from("informe_observaciones")
        .insert({ informe_id: d.informeId, texto: d.texto, autor: acceso.usuario.id });
      return { error, exito: "Observación añadida.", revalidar: "/panel" };
    },
  );
}

export async function borrarObservacion(datos: FormData): Promise<void> {
  const { supabase, permitido } = await preparar();
  const id = esquemaUuid.safeParse(datos.get("id"));
  if (!permitido || !id.success) return;
  await supabase.from("informe_observaciones").delete().eq("id", id.data);
  revalidatePath("/panel", "layout");
}

export async function firmarInforme(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(
    esquemaFirma,
    { informeId: campo(datos, "informeId"), nombre: campo(datos, "nombre"), conforme: datos.get("conforme") === "on" },
    async (d, { supabase }) => {
      const { error } = await supabase.rpc("firmar_informe", { p_informe: d.informeId, p_nombre: d.nombre });
      return { error, exito: "Informe firmado.", revalidar: "/panel" };
    },
  );
}

// El técnico sube el informe que ha generado en la aplicación externa.
export async function subirInforme(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const ctx = await preparar();
  if (!ctx.permitido) return DEMASIADOS;
  const informeId = esquemaUuid.safeParse(datos.get("informeId"));
  const empresaId = esquemaUuid.safeParse(datos.get("empresaId"));
  if (!informeId.success || !empresaId.success) return { ok: false, mensaje: "Datos no válidos." };

  const subida = await subirPdf(ctx.supabase, empresaId.data, datos.get("documento"));
  if ("vacio" in subida) return { ok: false, errores: { documento: "Elija el PDF del informe." } };
  if ("error" in subida) return { ok: false, errores: { documento: subida.error } };

  const { error } = await ctx.supabase.rpc("adjuntar_informe", {
    p_informe: informeId.data,
    p_ruta: subida.documento.ruta,
    p_nombre: subida.documento.nombre,
    p_sha256: subida.documento.sha256,
  });
  if (error) return traducir(error);
  revalidatePath("/panel", "layout");
  return { ok: true, mensaje: "Informe subido. Revíselo y fírmelo para registrarlo." };
}

// --- Plan de acción ----------------------------------------------------------

export async function crearMedida(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  return ejecutar(
    esquemaMedida,
    {
      empresaId: campo(datos, "empresaId"),
      campanaId: campo(datos, "campanaId"),
      titulo: campo(datos, "titulo"),
      descripcion: campo(datos, "descripcion"),
      responsable: campo(datos, "responsable"),
      fecha: campo(datos, "fecha"),
    },
    async (d, { supabase, acceso }) => {
      const { error } = await supabase.from("medidas").insert({
        empresa_id: d.empresaId,
        campana_id: d.campanaId,
        titulo: d.titulo,
        descripcion: d.descripcion,
        responsable: d.responsable,
        fecha_prevista: d.fecha,
        creada_por: acceso.usuario.id,
      });
      return { error, exito: "Medida añadida.", revalidar: `/panel/empresa/${d.empresaId}` };
    },
  );
}

export async function cambiarEstadoMedida(_p: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const ctx = await preparar();
  if (!ctx.permitido) return DEMASIADOS;
  const id = esquemaUuid.safeParse(datos.get("id"));
  const estado = ESTADOS_MEDIDA.find((e) => e === datos.get("estado"));
  if (!id.success || !estado) return { ok: false, mensaje: "Datos no válidos." };
  const { data, error } = await ctx.supabase.from("medidas").update({ estado }).eq("id", id.data).select("id");
  if (error) return traducir(error);
  if (!data?.length) return { ok: false, mensaje: "No tiene permiso para hacer esto." };
  revalidatePath("/panel", "layout");
  return { ok: true, mensaje: "Estado actualizado." };
}
