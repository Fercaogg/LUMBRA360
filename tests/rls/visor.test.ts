import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { borrarUsuarios, clienteServicio, correoDePrueba, crearUsuario, entrarComo } from "./entorno";

// Visor de la demostración pública: ve una empresa ficticia y no puede escribir nada.

const tanda = randomUUID().slice(0, 8);
const servicio = clienteServicio();
let visor: { id: string; correo: string };
let s: SupabaseClient;
let empresa = "";
let otraDemo = "";
let real = "";
let campana = "";

async function alta(tabla: string, fila: Record<string, unknown>): Promise<string> {
  const { data, error } = await servicio.from(tabla).insert(fila).select("id").single();
  if (error || !data) throw new Error(`Alta en ${tabla}: ${error?.message}`);
  return (data as { id: string }).id;
}

beforeAll(async () => {
  empresa = await alta("empresas", { nombre: `Demo visor ${tanda}`, es_demo: true });
  otraDemo = await alta("empresas", { nombre: `Otra demo ${tanda}`, es_demo: true });
  real = await alta("empresas", { nombre: `Real ${tanda}`, es_demo: false });
  await alta("medidas", { empresa_id: empresa, titulo: `Medida demo ${tanda}` });
  const instrumento = (await servicio.from("instrumentos").select("id").eq("tipo", "pulso").eq("estado", "publicado").limit(1).single()).data!.id;
  campana = await alta("campanas", { empresa_id: empresa, instrumento_id: instrumento, nombre: `Campaña ${tanda}`, modo_acceso: "enlace" });

  visor = await crearUsuario(correoDePrueba("visor", tanda));
  const { error } = await servicio.from("visores_demo").insert({ usuario_id: visor.id, empresa_id: empresa });
  if (error) throw new Error(error.message);
  s = await entrarComo(visor.correo);
});

afterAll(async () => {
  for (const id of [empresa, otraDemo, real]) await servicio.rpc("borrar_empresa_completa", { p_empresa: id });
  await borrarUsuarios([visor.id]);
});

describe("visor de la demostración", () => {
  it("ve solo su empresa de demostración", async () => {
    const { data } = await s.from("empresas").select("id");
    expect((data ?? []).map((e) => e.id)).toEqual([empresa]);
    expect((await s.from("medidas").select("id").eq("empresa_id", empresa)).data?.length).toBe(1);
    expect((await s.from("campanas").select("id").eq("empresa_id", empresa)).data?.length).toBe(1);
  });

  it("no puede escribir en ninguna tabla, ni con funciones del servidor", async () => {
    const insertar = await s.from("medidas").insert({ empresa_id: empresa, titulo: "Intento del visor" });
    expect(insertar.error).not.toBeNull();
    const editar = await s.from("medidas").update({ titulo: "Cambiado" }).eq("empresa_id", empresa).select("id");
    expect(editar.error !== null || (editar.data ?? []).length === 0).toBe(true);
    const dimension = await s.from("dimensiones").insert({ empresa_id: empresa, nombre: "Intento" });
    expect(dimension.error).not.toBeNull();
    const abrir = await s.rpc("abrir_campana", { p_campana: campana });
    expect(abrir.error).not.toBeNull();
    const { data: estado } = await servicio.from("campanas").select("estado").eq("id", campana).single();
    expect(estado?.estado).toBe("borrador");
    expect((await servicio.from("medidas").select("titulo").eq("empresa_id", empresa)).data?.map((m) => m.titulo)).toEqual([`Medida demo ${tanda}`]);
  });

  it("no puede convertirse en visor de otra empresa", async () => {
    const { error } = await s.from("visores_demo").insert({ usuario_id: visor.id, empresa_id: otraDemo });
    expect(error).not.toBeNull();
  });

  it("una empresa real nunca es visible, aunque se le asigne", async () => {
    await servicio.from("visores_demo").update({ empresa_id: real }).eq("usuario_id", visor.id);
    expect((await s.from("empresas").select("id")).data).toEqual([]);
    await servicio.from("visores_demo").update({ empresa_id: empresa }).eq("usuario_id", visor.id);
  });
});
