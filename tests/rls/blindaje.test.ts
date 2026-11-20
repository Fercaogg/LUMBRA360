import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { borrarUsuarios, clienteServicio, correoDePrueba, crearUsuario, entrarComo } from "./entorno";

// Blindaje de los cuestionarios (migración 20261121000100), contra la base de datos real:
// estructura FPSICO, una persona una respuesta, tope del enlace general, respuestas
// inalterables, códigos que no se reactivan y vista previa solo para quien ve la empresa.

const tanda = randomUUID().slice(0, 8);
const servicio = clienteServicio();
const u: Record<string, { id: string; correo: string }> = {};
const s: Record<string, SupabaseClient> = {};

let empresa = "";
let empresaAjena = "";
let pulso = "";
let evaluacion = "";
const itemsPulso: string[] = [];

async function alta(cliente: SupabaseClient, tabla: string, fila: Record<string, unknown>): Promise<string> {
  const { data, error } = await cliente.from(tabla).insert(fila).select("id").single();
  if (error || !data) throw new Error(`Alta en ${tabla}: ${error?.message}`);
  return (data as { id: string }).id;
}

const valoresPulso = (v: number) => Object.fromEntries(itemsPulso.map((id) => [id, v]));

beforeAll(async () => {
  const c = (e: string) => correoDePrueba(e, tanda);
  empresa = await alta(servicio, "empresas", { nombre: `Empresa blindaje ${tanda}`, es_demo: true });
  empresaAjena = await alta(servicio, "empresas", { nombre: `Ajena blindaje ${tanda}`, es_demo: true });
  await servicio.from("invitaciones").insert([
    { correo: c("bl-admin"), rol: "admin" },
    { correo: c("bl-cuenta"), rol: "empresa", empresa_id: empresa },
    { correo: c("bl-intruso"), rol: "empresa", empresa_id: empresaAjena },
  ]);
  for (const e of ["bl-admin", "bl-cuenta", "bl-intruso"]) {
    u[e] = await crearUsuario(c(e));
    s[e] = await entrarComo(u[e].correo);
  }

  // Seguimiento de prueba (textos ficticios).
  pulso = await alta(s["bl-admin"], "instrumentos", { nombre: `Seguimiento blindaje ${tanda}`, tipo: "pulso" });
  await servicio.from("instrumentos").update({ es_demo: true }).eq("id", pulso);
  const escala = await alta(s["bl-admin"], "escalas", { instrumento_id: pulso, nombre: "Escala" });
  await s["bl-admin"].from("escala_opciones").insert([1, 2, 3].map((v) => ({ escala_id: escala, etiqueta: `Opción ${v}`, valor: v, orden: v })));
  const factor = await alta(s["bl-admin"], "factores", { instrumento_id: pulso, nombre: "Factor" });
  await s["bl-admin"].from("niveles").insert({ factor_id: factor, etiqueta: "Nivel", desde: 1, tono: "intermedio" });
  for (const n of [1, 2]) itemsPulso.push(await alta(s["bl-admin"], "items", { instrumento_id: pulso, factor_id: factor, escala_id: escala, enunciado: `Ítem ${n}`, orden: n }));
  expect((await s["bl-admin"].rpc("publicar_instrumento", { p_instrumento: pulso })).error).toBeNull();

  // Evaluación de prueba (demo) sin estructura FPSICO: dos ítems.
  evaluacion = await alta(s["bl-admin"], "instrumentos", { nombre: `Evaluación blindaje ${tanda}`, tipo: "evaluacion" });
  await servicio.from("instrumentos").update({ es_demo: true }).eq("id", evaluacion);
  const escalaE = await alta(s["bl-admin"], "escalas", { instrumento_id: evaluacion, nombre: "Escala" });
  await s["bl-admin"].from("escala_opciones").insert([1, 2].map((v) => ({ escala_id: escalaE, etiqueta: `Opción ${v}`, valor: v, orden: v })));
  const bloque = await alta(s["bl-admin"], "factores", { instrumento_id: evaluacion, nombre: "Bloque" });
  await alta(s["bl-admin"], "items", { instrumento_id: evaluacion, factor_id: bloque, escala_id: escalaE, enunciado: "Ítem", orden: 1 });
  expect((await s["bl-admin"].rpc("publicar_instrumento", { p_instrumento: evaluacion })).error).toBeNull();
});

afterAll(async () => {
  await servicio.rpc("borrar_empresa_completa", { p_empresa: empresa });
  await servicio.rpc("borrar_empresa_completa", { p_empresa: empresaAjena });
  await servicio.from("instrumentos").delete().in("id", [pulso, evaluacion]);
  await borrarUsuarios(Object.values(u).map((x) => x.id));
});

describe("estructura FPSICO", () => {
  it("la tabla de referencia tiene 89 ítems y 44 preguntas, y no se puede cambiar", async () => {
    const { data } = await s["bl-cuenta"].from("fpsico_estructura").select("codigo, pregunta, valor_max").order("posicion");
    expect(data?.length).toBe(89);
    expect(new Set(data!.map((e) => e.pregunta)).size).toBe(44);
    expect(data!.filter((e) => e.valor_max === 5).map((e) => e.codigo)).toEqual(
      ["10h", "16a", "16b", "16c", "16d", "22", "26", "34a", "34b", "34c", "34d", "40a", "40b", "40c", "40d"],
    );
    expect(data!.filter((e) => e.valor_max === 3).map((e) => e.codigo)).toEqual(["13a", "13b", "13c", "13d"]);
    const cambio = await servicio.from("fpsico_estructura").update({ valor_max: 5 }).eq("codigo", "1");
    expect(cambio.error).not.toBeNull();
  });

  it("no publica un cuestionario FPSICO si una escala no cuadra con su rango", async () => {
    const id = await alta(s["bl-admin"], "instrumentos", { nombre: `FPSICO mal ${tanda}`, tipo: "evaluacion" });
    await servicio.from("instrumentos").update({ es_demo: true, export_formato: "fpsico31" }).eq("id", id);
    const escala = await alta(s["bl-admin"], "escalas", { instrumento_id: id, nombre: "Todo de 1 a 4" });
    await s["bl-admin"].from("escala_opciones").insert([1, 2, 3, 4].map((v) => ({ escala_id: escala, etiqueta: `Opción ${v}`, valor: v, orden: v })));
    const bloque = await alta(s["bl-admin"], "factores", { instrumento_id: id, nombre: "Bloque" });
    const { data: estructura } = await s["bl-admin"].from("fpsico_estructura").select("posicion, codigo").order("posicion");
    await s["bl-admin"].from("items").insert(
      estructura!.map((e) => ({ instrumento_id: id, factor_id: bloque, escala_id: escala, enunciado: `Ítem ${e.codigo}`, orden: e.posicion, codigo_fpsico: e.codigo })),
    );
    const { error } = await s["bl-admin"].rpc("publicar_instrumento", { p_instrumento: id });
    expect(error?.message).toContain("13a");
    expect(error?.message).toContain("10h");

    // Un número repetido o inventado no entra.
    const repetido = await s["bl-admin"].from("items").insert({ instrumento_id: id, factor_id: bloque, escala_id: escala, enunciado: "x", orden: 99, codigo_fpsico: "10a" });
    expect(repetido.error).not.toBeNull();
    const inventado = await s["bl-admin"].from("items").insert({ instrumento_id: id, factor_id: bloque, escala_id: escala, enunciado: "x", orden: 99, codigo_fpsico: "45" });
    expect(inventado.error).not.toBeNull();
    await servicio.from("instrumentos").delete().eq("id", id);
  });
});

describe("acceso al cuestionario", () => {
  it("una evaluación no admite enlace general", async () => {
    const { error } = await s["bl-cuenta"].from("campanas").insert({
      empresa_id: empresa, instrumento_id: evaluacion, nombre: `Eval enlace ${tanda}`, modo_acceso: "enlace", creada_por: u["bl-cuenta"].id,
    });
    expect(error?.message).toContain("códigos");
  });

  it("el enlace general necesita las personas invitadas y no admite más respuestas que ellas", async () => {
    const id = await alta(s["bl-cuenta"], "campanas", {
      empresa_id: empresa, instrumento_id: pulso, nombre: `Enlace ${tanda}`, modo_acceso: "enlace", creada_por: u["bl-cuenta"].id,
    });
    expect((await s["bl-cuenta"].rpc("abrir_campana", { p_campana: id })).error?.message).toContain("invitadas");
    await s["bl-cuenta"].from("campanas").update({ plantilla_invitada: 2 }).eq("id", id);
    expect((await s["bl-cuenta"].rpc("abrir_campana", { p_campana: id })).error).toBeNull();
    const { data: fila } = await s["bl-cuenta"].from("campanas").select("token_enlace").eq("id", id).single();
    const token = fila!.token_enlace as string;

    const envios = await Promise.all(
      [1, 2, 3, 4].map(async () => (await servicio.rpc("enviar_respuesta", { p_acceso: token, p_valores: valoresPulso(2), p_grupos: [] })).data),
    );
    // Aunque lleguen a la vez, solo entran dos.
    expect(envios.filter((e) => e === "ok").length).toBe(2);
    expect(envios.filter((e) => e === "completa").length).toBe(2);
    expect((await servicio.rpc("obtener_cuestionario", { p_acceso: token })).data).toEqual({ estado: "completa" });
  });

  it("un código vale una vez y no se puede reactivar; las respuestas no se cambian ni se borran", async () => {
    const id = await alta(s["bl-cuenta"], "campanas", {
      empresa_id: empresa, instrumento_id: pulso, nombre: `Códigos ${tanda}`, modo_acceso: "codigos", creada_por: u["bl-cuenta"].id,
    });
    const { data: codigos } = await s["bl-cuenta"].rpc("generar_codigos", { p_campana: id, p_cantidad: 1 });
    await s["bl-cuenta"].rpc("abrir_campana", { p_campana: id });
    const codigo = (codigos as string[])[0];
    expect((await servicio.rpc("enviar_respuesta", { p_acceso: codigo, p_valores: valoresPulso(3), p_grupos: [] })).data).toBe("ok");
    expect((await servicio.rpc("enviar_respuesta", { p_acceso: codigo, p_valores: valoresPulso(1), p_grupos: [] })).data).toBe("usado");

    // Ni con la clave de servicio.
    const reactivar = await servicio.from("codigos_acceso").update({ usado: false }).eq("campana_id", id);
    expect(reactivar.error?.message).toContain("volver a activar");
    const { data: respuesta } = await servicio.from("respuestas").select("id").eq("campana_id", id).single();
    const cambiar = await servicio.from("respuesta_items").update({ valor: 1 }).eq("respuesta_id", respuesta!.id);
    expect(cambiar.error?.message).toContain("no se pueden modificar");
    const borrar = await servicio.from("respuestas").delete().eq("id", respuesta!.id);
    expect(borrar.error?.message).toContain("no se pueden borrar");

    // Con la campaña cerrada no entra nada, ni directamente en la tabla.
    await s["bl-cuenta"].rpc("cerrar_campana", { p_campana: id });
    const colar = await servicio.from("respuestas").insert({ campana_id: id });
    expect(colar.error?.message).toContain("campaña abierta");
  });

  it("una evaluación no guarda grupo aunque se le envíe", async () => {
    const id = await alta(s["bl-cuenta"], "campanas", {
      empresa_id: empresa, instrumento_id: evaluacion, nombre: `Eval grupos ${tanda}`, modo_acceso: "codigos", creada_por: u["bl-cuenta"].id,
    });
    const { data: codigos } = await s["bl-cuenta"].rpc("generar_codigos", { p_campana: id, p_cantidad: 1 });
    await s["bl-cuenta"].rpc("abrir_campana", { p_campana: id });
    const { data: items } = await s["bl-cuenta"].from("items").select("id").eq("instrumento_id", evaluacion);
    const { data } = await servicio.rpc("enviar_respuesta", {
      p_acceso: (codigos as string[])[0], p_valores: { [items![0].id]: 1 }, p_grupos: [randomUUID()],
    });
    expect(data).toBe("incompleto");
  });
});

describe("vista previa", () => {
  it("la ve quien ve la empresa, con el mismo contenido que la plantilla y sin respuestas", async () => {
    const id = await alta(s["bl-cuenta"], "campanas", {
      empresa_id: empresa, instrumento_id: pulso, nombre: `Vista ${tanda}`, modo_acceso: "codigos", creada_por: u["bl-cuenta"].id,
    });
    const { data, error } = await s["bl-cuenta"].rpc("vista_previa_cuestionario", { p_campana: id });
    expect(error).toBeNull();
    const vista = data as { estado: string; items: { id: string }[] };
    expect(vista.estado).toBe("ok");
    expect(vista.items.map((i) => i.id).sort()).toEqual([...itemsPulso].sort());
    expect(JSON.stringify(vista)).not.toContain("respuesta");

    const ajena = await s["bl-intruso"].rpc("vista_previa_cuestionario", { p_campana: id });
    expect(ajena.error).not.toBeNull();
  });
});
