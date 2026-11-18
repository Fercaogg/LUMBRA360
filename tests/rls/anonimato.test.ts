import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { borrarUsuarios, clienteAnonimo, clienteServicio, correoDePrueba, crearUsuario, entrarComo } from "./entorno";

// Demuestra las reglas de anonimato de la fase 2 contra la base de datos real:
// nadie lee respuestas, mínimo de 5 por grupo, filtros combinados y deducción por resta.

const tanda = randomUUID().slice(0, 8);
const servicio = clienteServicio();
const u: Record<string, { id: string; correo: string }> = {};
const s: Record<string, SupabaseClient> = {};

let partner = "";
let empresa = "";
let empresaAjena = "";
let instrumento = "";
let factorA = "";
const items: string[] = [];
const grupos: Record<string, string> = {};
let dimArea = "";
let dimTurno = "";
let campana = "";
let codigos: string[] = [];
let informe = "";
let evaluacion = "";
const itemsEval: string[] = [];
const evals: Record<string, string> = {};

async function alta(cliente: SupabaseClient, tabla: string, fila: Record<string, unknown>): Promise<string> {
  const { data, error } = await cliente.from(tabla).insert(fila).select("id").single();
  if (error || !data) throw new Error(`Alta en ${tabla}: ${error?.message}`);
  return (data as { id: string }).id;
}

function valores(valor: number): Record<string, number> {
  return Object.fromEntries(items.map((id) => [id, valor]));
}

async function responder(acceso: string, valor: number, gruposElegidos: string[]): Promise<string> {
  const { data, error } = await servicio.rpc("enviar_respuesta", {
    p_acceso: acceso,
    p_valores: valores(valor),
    p_grupos: gruposElegidos,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

type Resultado = {
  disponible: boolean;
  actual?: { suprimido: boolean; n?: number; factores?: { factor_id: string; media: number; nivel: { etiqueta: string } }[] };
  anterior?: { suprimido: boolean; n?: number; campana: string } | null;
};

async function resultados(cliente: SupabaseClient, id: string, filtro: string[] = []): Promise<Resultado> {
  const { data, error } = await cliente.rpc("resultados_campana", { p_campana: id, p_grupos: filtro });
  if (error) throw new Error(error.message);
  return data as Resultado;
}

beforeAll(async () => {
  const c = (e: string) => correoDePrueba(e, tanda);
  partner = await alta(servicio, "partners", { nombre: `Partner anon ${tanda}`, es_demo: true });
  empresa = await alta(servicio, "empresas", { nombre: `Empresa anon ${tanda}`, partner_id: partner, es_demo: true });
  empresaAjena = await alta(servicio, "empresas", { nombre: `Empresa ajena ${tanda}`, es_demo: true });

  await servicio.from("invitaciones").insert([
    { correo: c("an-admin"), rol: "admin" },
    { correo: c("an-gestor"), rol: "partner", partner_id: partner },
    { correo: c("an-tecnico"), rol: "tecnico", partner_id: partner, empresa_id: empresa },
    { correo: c("an-cuenta"), rol: "empresa", empresa_id: empresa },
    { correo: c("an-intruso"), rol: "empresa", empresa_id: empresaAjena },
  ]);
  for (const e of ["an-admin", "an-gestor", "an-tecnico", "an-cuenta", "an-intruso"]) {
    u[e] = await crearUsuario(c(e));
    s[e] = await entrarComo(u[e].correo);
  }

  // Instrumento de prueba, creado por administración con su sesión. Textos ficticios.
  instrumento = await alta(s["an-admin"], "instrumentos", { nombre: `Seguimiento de prueba ${tanda}`, tipo: "pulso" });
  await servicio.from("instrumentos").update({ es_demo: true }).eq("id", instrumento);
  const escala = await alta(s["an-admin"], "escalas", { instrumento_id: instrumento, nombre: "Escala de prueba" });
  await s["an-admin"].from("escala_opciones").insert(
    [1, 2, 3, 4, 5].map((v) => ({ escala_id: escala, etiqueta: `Opción ${v}`, valor: v, orden: v })),
  );
  factorA = await alta(s["an-admin"], "factores", { instrumento_id: instrumento, nombre: "Factor de prueba A", orden: 1 });
  const factorB = await alta(s["an-admin"], "factores", { instrumento_id: instrumento, nombre: "Factor de prueba B", orden: 2 });
  for (const factor of [factorA, factorB]) {
    await s["an-admin"].from("niveles").insert([
      { factor_id: factor, etiqueta: "Nivel bajo", desde: 1, tono: "desfavorable" },
      { factor_id: factor, etiqueta: "Nivel medio", desde: 2.5, tono: "intermedio" },
      { factor_id: factor, etiqueta: "Nivel alto", desde: 3.5, tono: "favorable" },
    ]);
    for (const n of [1, 2]) {
      items.push(await alta(s["an-admin"], "items", {
        instrumento_id: instrumento, factor_id: factor, escala_id: escala, enunciado: `Ítem de prueba ${n}`, orden: n,
      }));
    }
  }

  dimArea = await alta(s["an-cuenta"], "dimensiones", { empresa_id: empresa, nombre: "Área" });
  dimTurno = await alta(s["an-cuenta"], "dimensiones", { empresa_id: empresa, nombre: "Turno" });
  for (const [dim, nombres] of [[dimArea, ["G1", "G2", "G3"]], [dimTurno, ["T1", "T2"]]] as const) {
    for (const nombre of nombres) grupos[nombre] = await alta(s["an-cuenta"], "grupos", { dimension_id: dim, nombre });
  }
});

afterAll(async () => {
  await servicio.rpc("borrar_empresa_completa", { p_empresa: empresa });
  await servicio.rpc("borrar_empresa_completa", { p_empresa: empresaAjena });
  await servicio.from("instrumentos").delete().in("id", [instrumento, evaluacion]);
  await servicio.from("partners").delete().eq("id", partner);
  await borrarUsuarios(Object.values(u).map((x) => x.id));
});

describe("instrumentos", () => {
  it("no se publica sin confirmar instrumento y licencia, salvo que sea de demostración", async () => {
    const real = await alta(s["an-admin"], "instrumentos", { nombre: `Sin licencia ${tanda}` });
    // Una evaluación real siempre es FPSICO (INSST) y exige la autorización escrita.
    const { data: fila } = await s["an-admin"].from("instrumentos").select("origen").eq("id", real).single();
    expect(fila?.origen).toBe("insst_fpsico");
    const { error } = await s["an-admin"].rpc("publicar_instrumento", { p_instrumento: real });
    expect(error?.message).toContain("INSST");
    await s["an-admin"].from("instrumentos").delete().eq("id", real);
  });

  it("solo administración publica, y una vez publicado no se puede modificar", async () => {
    const ajeno = await s["an-gestor"].rpc("publicar_instrumento", { p_instrumento: instrumento });
    expect(ajeno.error).not.toBeNull();
    const propio = await s["an-admin"].rpc("publicar_instrumento", { p_instrumento: instrumento });
    expect(propio.error).toBeNull();

    const cambio = await s["an-admin"].from("items").update({ enunciado: "Cambiado" }).eq("id", items[0]);
    expect(cambio.error?.message).toContain("publicado");
    const borrado = await s["an-admin"].from("factores").delete().eq("id", factorA);
    expect(borrado.error?.message).toContain("publicado");
  });

  it("las cuentas de empresa leen el instrumento publicado pero no lo modifican", async () => {
    const lectura = await s["an-cuenta"].from("items").select("id").eq("instrumento_id", instrumento);
    expect(lectura.data?.length).toBe(4);
    const escritura = await s["an-cuenta"].from("instrumentos").insert({ nombre: "Intruso" });
    expect(escritura.error).not.toBeNull();
  });
});

describe("campaña y respuestas anónimas", () => {
  it("el mínimo de grupo no puede bajar de 5", async () => {
    const { error } = await s["an-cuenta"].from("campanas").insert({
      empresa_id: empresa, instrumento_id: instrumento, nombre: "Mínimo 3", minimo_grupo: 3, creada_por: u["an-cuenta"].id,
    });
    expect(error).not.toBeNull();
  });

  it("la empresa crea la campaña, genera códigos y la abre; una empresa ajena no", async () => {
    campana = await alta(s["an-cuenta"], "campanas", {
      empresa_id: empresa, instrumento_id: instrumento, nombre: `Campaña ${tanda}`, plantilla_invitada: 25, creada_por: u["an-cuenta"].id,
    });
    const dims = await s["an-cuenta"].from("campana_dimensiones").insert([
      { campana_id: campana, dimension_id: dimArea },
      { campana_id: campana, dimension_id: dimTurno },
    ]);
    expect(dims.error).toBeNull();

    const intruso = await s["an-intruso"].rpc("generar_codigos", { p_campana: campana, p_cantidad: 5 });
    expect(intruso.error).not.toBeNull();
    const abrirAjeno = await s["an-intruso"].rpc("abrir_campana", { p_campana: campana });
    expect(abrirAjeno.error).not.toBeNull();

    const generados = await s["an-cuenta"].rpc("generar_codigos", { p_campana: campana, p_cantidad: 25 });
    expect(generados.error).toBeNull();
    codigos = generados.data as string[];
    expect(new Set(codigos).size).toBe(25);
    expect(codigos[0]).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/);

    // Antes de abrir, un código válido todavía no deja responder.
    expect(await responder(codigos[0], 4, [])).toBe("no_abierta");
    const abrir = await s["an-cuenta"].rpc("abrir_campana", { p_campana: campana });
    expect(abrir.error).toBeNull();
  });

  it("guarda 20 respuestas con códigos de un solo uso", async () => {
    const plan: [number, string[]][] = [
      ...Array.from({ length: 6 }, () => [4, [grupos.G1, grupos.T1]] as [number, string[]]),
      ...Array.from({ length: 4 }, () => [4, [grupos.G1, grupos.T2]] as [number, string[]]),
      ...Array.from({ length: 8 }, () => [2, [grupos.G2, grupos.T1]] as [number, string[]]),
      ...Array.from({ length: 2 }, () => [5, [grupos.G3, grupos.T2]] as [number, string[]]),
    ];
    for (let i = 0; i < plan.length; i++) {
      expect(await responder(codigos[i], plan[i][0], plan[i][1])).toBe("ok");
    }
  });

  it("rechaza códigos usados, inventados y respuestas incompletas o manipuladas", async () => {
    expect(await responder(codigos[0], 1, [])).toBe("usado");
    expect(await responder("ZZZZZ-ZZZZZ", 1, [])).toBe("no_valido");

    const libre = codigos[20];
    const incompleta = await servicio.rpc("enviar_respuesta", { p_acceso: libre, p_valores: { [items[0]]: 3 }, p_grupos: [] });
    expect(incompleta.data).toBe("incompleto");
    const fueraDeEscala = await servicio.rpc("enviar_respuesta", { p_acceso: libre, p_valores: valores(9), p_grupos: [] });
    expect(fueraDeEscala.data).toBe("incompleto");
    const dosGrupos = await servicio.rpc("enviar_respuesta", { p_acceso: libre, p_valores: valores(3), p_grupos: [grupos.G1, grupos.G2] });
    expect(dosGrupos.data).toBe("incompleto");

    // Un envío rechazado no gasta el código ni deja rastro.
    const { data } = await s["an-cuenta"].rpc("participacion_campana", { p_campana: campana });
    expect(data).toMatchObject({ respuestas: 20, plantilla: 25, porcentaje: 80 });
  });

  it("ningún rol lee respuestas ni códigos: ni empresa, ni partner, ni técnico, ni administración", async () => {
    for (const rol of ["an-admin", "an-gestor", "an-tecnico", "an-cuenta", "an-intruso"]) {
      for (const tabla of ["respuestas", "respuesta_items", "respuesta_grupos", "codigos_acceso"]) {
        const { data, error } = await s[rol].from(tabla).select("*");
        expect(error, `${rol} / ${tabla}`).not.toBeNull();
        expect(data).toBeNull();
      }
    }
    const anon = clienteAnonimo();
    for (const tabla of ["respuestas", "respuesta_items", "respuesta_grupos", "codigos_acceso", "campanas", "evidencias"]) {
      expect((await anon.from(tabla).select("*")).error, tabla).not.toBeNull();
    }
  });

  it("las funciones de respuesta solo las llama el servidor", async () => {
    for (const cliente of [clienteAnonimo(), s["an-cuenta"]]) {
      const leer = await cliente.rpc("obtener_cuestionario", { p_acceso: codigos[21] });
      expect(leer.error).not.toBeNull();
      const enviar = await cliente.rpc("enviar_respuesta", { p_acceso: codigos[21], p_valores: valores(3), p_grupos: [] });
      expect(enviar.error).not.toBeNull();
    }
    const cuestionario = await servicio.rpc("obtener_cuestionario", { p_acceso: codigos[21] });
    expect((cuestionario.data as { estado: string; items: unknown[] }).items.length).toBe(4);
  });

  it("con la campaña abierta no hay resultados, solo participación", async () => {
    expect(await resultados(s["an-cuenta"], campana)).toEqual({ disponible: false });
  });
});

describe("resultados agregados con mínimo de 5", () => {
  it("al cerrar, la empresa ve el total y la campaña deja de aceptar respuestas", async () => {
    const cierre = await s["an-cuenta"].rpc("cerrar_campana", { p_campana: campana });
    expect(cierre.error).toBeNull();
    expect(await responder(codigos[22], 3, [])).toBe("cerrada");

    const r = await resultados(s["an-cuenta"], campana);
    expect(r.actual?.suprimido).toBe(false);
    expect(r.actual?.n).toBe(20);
    const a = r.actual?.factores?.find((f) => f.factor_id === factorA);
    expect(Number(a?.media)).toBeCloseTo(3.3, 2);
    expect(a?.nivel.etiqueta).toBe("Nivel medio");
  });

  it("partner y técnico ven el mismo agregado; una empresa ajena, nada", async () => {
    expect((await resultados(s["an-gestor"], campana)).actual?.n).toBe(20);
    expect((await resultados(s["an-tecnico"], campana)).actual?.n).toBe(20);
    const ajeno = await s["an-intruso"].rpc("resultados_campana", { p_campana: campana, p_grupos: [] });
    expect(ajeno.error).not.toBeNull();
    const participacion = await s["an-intruso"].rpc("participacion_campana", { p_campana: campana });
    expect(participacion.error).not.toBeNull();
  });

  it("oculta el grupo de 2 personas y también el que permitiría deducirlo por resta", async () => {
    const { data } = await s["an-cuenta"].rpc("grupos_de_campana", { p_campana: campana });
    const visible = Object.fromEntries((data as { grupo: string; visible: boolean }[]).map((g) => [g.grupo, g.visible]));
    // G1=10, G2=8, G3=2. G3 se oculta por tamaño y G2 para que G3 no salga por resta.
    expect(visible).toEqual({ G1: true, G2: false, G3: false, T1: true, T2: true });

    expect((await resultados(s["an-cuenta"], campana, [grupos.G1])).actual).toMatchObject({ suprimido: false, n: 10 });
    expect((await resultados(s["an-cuenta"], campana, [grupos.G2])).actual?.suprimido).toBe(true);
    expect((await resultados(s["an-cuenta"], campana, [grupos.G3])).actual?.suprimido).toBe(true);
  });

  it("aplica el mínimo también a los filtros combinados", async () => {
    // G1 y T1: 6 personas. G1 y T2: 4 personas.
    expect((await resultados(s["an-cuenta"], campana, [grupos.G1, grupos.T1])).actual).toMatchObject({ suprimido: false, n: 6 });
    expect((await resultados(s["an-cuenta"], campana, [grupos.G1, grupos.T2])).actual?.suprimido).toBe(true);
    // Un grupo oculto no reaparece combinándolo con otro.
    expect((await resultados(s["an-cuenta"], campana, [grupos.G2, grupos.T1])).actual?.suprimido).toBe(true);
  });

  it("rechaza filtros con grupos que no son de la campaña", async () => {
    const { error } = await s["an-cuenta"].rpc("resultados_campana", { p_campana: campana, p_grupos: [randomUUID()] });
    expect(error).not.toBeNull();
  });

  it("una campaña con 4 respuestas no muestra ningún resultado", async () => {
    const pequena = await alta(s["an-cuenta"], "campanas", {
      empresa_id: empresa, instrumento_id: instrumento, nombre: `Pequeña ${tanda}`, modo_acceso: "enlace", creada_por: u["an-cuenta"].id,
    });
    await s["an-cuenta"].rpc("abrir_campana", { p_campana: pequena });
    const { data: fila } = await s["an-cuenta"].from("campanas").select("token_enlace").eq("id", pequena).single();
    const token = fila!.token_enlace as string;
    expect(token.length).toBeGreaterThan(20);
    for (let i = 0; i < 4; i++) expect(await responder(token, 3, [])).toBe("ok");
    await s["an-cuenta"].rpc("cerrar_campana", { p_campana: pequena });

    const r = await resultados(s["an-cuenta"], pequena);
    expect(r.actual).toEqual({ suprimido: true, minimo: 5 });
    // Al cerrar, el enlace general deja de existir.
    expect(await responder(token, 3, [])).toBe("no_valido");
  });

  it("compara con la campaña anterior del mismo instrumento", async () => {
    const siguiente = await alta(s["an-cuenta"], "campanas", {
      empresa_id: empresa, instrumento_id: instrumento, nombre: `Siguiente ${tanda}`, modo_acceso: "enlace", creada_por: u["an-cuenta"].id,
    });
    await s["an-cuenta"].rpc("abrir_campana", { p_campana: siguiente });
    const { data: fila } = await s["an-cuenta"].from("campanas").select("token_enlace").eq("id", siguiente).single();
    for (let i = 0; i < 5; i++) await responder(fila!.token_enlace as string, 3, []);
    await s["an-cuenta"].rpc("cerrar_campana", { p_campana: siguiente });

    const r = await resultados(s["an-cuenta"], siguiente);
    expect(r.actual).toMatchObject({ suprimido: false, n: 5 });
    // La anterior es la pequeña (4 respuestas): se compara, pero sigue suprimida.
    expect(r.anterior).toMatchObject({ suprimido: true, campana: `Pequeña ${tanda}` });
  });
});

describe("informe, plan de acción y evidencias", () => {
  it("una evaluación nunca se puntúa en la plataforma, para ningún rol", async () => {
    // Instrumento de evaluación de prueba (demo): escala con códigos de exportación.
    evaluacion = await alta(s["an-admin"], "instrumentos", { nombre: `Evaluación de prueba ${tanda}`, tipo: "evaluacion" });
    await servicio.from("instrumentos").update({ es_demo: true }).eq("id", evaluacion);
    const escala = await alta(s["an-admin"], "escalas", { instrumento_id: evaluacion, nombre: "Escala" });
    await s["an-admin"].from("escala_opciones").insert([1, 2, 3].map((v) => ({ escala_id: escala, etiqueta: `Opción ${v}`, valor: v, orden: v, codigo_export: "ABC"[v - 1] })));
    const bloque = await alta(s["an-admin"], "factores", { instrumento_id: evaluacion, nombre: "Bloque" });
    for (const n of [1, 2]) {
      itemsEval.push(await alta(s["an-admin"], "items", { instrumento_id: evaluacion, factor_id: bloque, escala_id: escala, enunciado: `Ítem ${n}`, orden: n }));
    }
    // Sin niveles: una evaluación no los necesita porque no se puntúa aquí.
    expect((await s["an-admin"].rpc("publicar_instrumento", { p_instrumento: evaluacion })).error).toBeNull();

    for (const [clave, cuantas] of [["grande", 6], ["chica", 4]] as const) {
      const id = await alta(s["an-cuenta"], "campanas", {
        empresa_id: empresa, instrumento_id: evaluacion, nombre: `Evaluación ${clave} ${tanda}`, modo_acceso: "enlace", creada_por: u["an-cuenta"].id,
      });
      evals[clave] = id;
      await s["an-cuenta"].rpc("abrir_campana", { p_campana: id });
      const { data: fila } = await s["an-cuenta"].from("campanas").select("token_enlace, tipo").eq("id", id).single();
      expect(fila?.tipo).toBe("evaluacion");
      for (let i = 0; i < cuantas; i++) {
        const { data } = await servicio.rpc("enviar_respuesta", {
          p_acceso: fila!.token_enlace, p_valores: { [itemsEval[0]]: 1 + (i % 3), [itemsEval[1]]: 3 }, p_grupos: [],
        });
        expect(data).toBe("ok");
      }
      await s["an-cuenta"].rpc("cerrar_campana", { p_campana: id });
    }

    for (const rol of ["an-admin", "an-gestor", "an-tecnico", "an-cuenta"]) {
      expect(await resultados(s[rol], evals.grande), rol).toEqual({ disponible: false, externa: true });
    }
  });

  it("la exportación es solo del técnico, con formato confirmado y mínimo de respuestas", async () => {
    for (const rol of ["an-admin", "an-gestor", "an-cuenta", "an-intruso"]) {
      const { error } = await s[rol].rpc("exportar_respuestas", { p_campana: evals.grande });
      expect(error, rol).not.toBeNull();
    }
    const sinFormato = await s["an-tecnico"].rpc("exportar_respuestas", { p_campana: evals.grande });
    expect(sinFormato.error?.message).toContain("todavía no está disponible");

    // Solo administración configura y confirma el formato.
    const ajeno = await s["an-tecnico"].from("instrumentos").update({ export_confirmado: true }).eq("id", evaluacion).select("id");
    expect(ajeno.data ?? []).toEqual([]);
    const conf = await s["an-admin"].from("instrumentos").update({ export_confirmado: true, export_separador: ";", export_cabecera: "CABECERA" }).eq("id", evaluacion).select("id");
    expect(conf.data?.length).toBe(1);

    const pocas = await s["an-tecnico"].rpc("exportar_respuestas", { p_campana: evals.chica });
    expect(pocas.error?.message).toContain("suficientes");
    const pulso = await s["an-tecnico"].rpc("exportar_respuestas", { p_campana: campana });
    expect(pulso.error?.message).toContain("evaluaciones");

    const { data, error } = await s["an-tecnico"].rpc("exportar_respuestas", { p_campana: evals.grande });
    expect(error).toBeNull();
    const exp = data as { cabecera: string; fin_linea: string; lineas: string[] };
    expect(exp.cabecera).toBe("CABECERA");
    expect(exp.lineas.length).toBe(6);
    // Solo códigos de respuesta: ni identificador, ni fecha, ni grupo.
    for (const linea of exp.lineas) expect(linea).toMatch(/^[ABC];C$/);
    expect([...exp.lineas].sort()).toEqual(["A;C", "A;C", "B;C", "B;C", "C;C", "C;C"]);
  });

  it("formato FPSICO 3.1 (Anexo II del manual de FPSICO 4.1): 40 asteriscos y 89 respuestas por línea", async () => {
    // Con un cuestionario que no tiene 89 ítems, el formato FPSICO se niega a exportar.
    await s["an-admin"].from("instrumentos").update({ export_formato: "fpsico31" }).eq("id", evaluacion);
    const corto = await s["an-tecnico"].rpc("exportar_respuestas", { p_campana: evals.grande });
    expect(corto.error?.message).toContain("89 ítems");
    await s["an-admin"].from("instrumentos").update({ export_formato: "personalizado" }).eq("id", evaluacion);

    // Cuestionario de prueba con 89 ítems ficticios y escala de 1 a 4.
    const fpsico = await alta(s["an-admin"], "instrumentos", { nombre: `FPSICO de prueba ${tanda}`, tipo: "evaluacion" });
    await servicio.from("instrumentos").update({ es_demo: true }).eq("id", fpsico);
    const escala = await alta(s["an-admin"], "escalas", { instrumento_id: fpsico, nombre: "Escala" });
    await s["an-admin"].from("escala_opciones").insert([1, 2, 3, 4].map((v) => ({ escala_id: escala, etiqueta: `Opción ${v}`, valor: v, orden: v })));
    const bloque = await alta(s["an-admin"], "factores", { instrumento_id: fpsico, nombre: "Bloque" });
    const { data: items, error: errItems } = await s["an-admin"]
      .from("items")
      .insert(Array.from({ length: 89 }, (_, n) => ({ instrumento_id: fpsico, factor_id: bloque, escala_id: escala, enunciado: `Ítem de prueba ${n + 1}`, orden: n + 1 })))
      .select("id, orden");
    expect(errItems).toBeNull();
    expect((await s["an-admin"].rpc("publicar_instrumento", { p_instrumento: fpsico })).error).toBeNull();

    const campanaF = await alta(s["an-cuenta"], "campanas", {
      empresa_id: empresa, instrumento_id: fpsico, nombre: `FPSICO ${tanda}`, modo_acceso: "enlace", creada_por: u["an-cuenta"].id,
    });
    await s["an-cuenta"].rpc("abrir_campana", { p_campana: campanaF });
    const { data: fila } = await s["an-cuenta"].from("campanas").select("token_enlace").eq("id", campanaF).single();
    for (let r = 0; r < 5; r++) {
      const valores = Object.fromEntries(items!.map((it) => [it.id, 1 + ((it.orden + r) % 4)]));
      const { data } = await servicio.rpc("enviar_respuesta", { p_acceso: fila!.token_enlace, p_valores: valores, p_grupos: [] });
      expect(data).toBe("ok");
    }
    await s["an-cuenta"].rpc("cerrar_campana", { p_campana: campanaF });

    await s["an-admin"].from("instrumentos").update({ export_formato: "fpsico31", export_confirmado: true }).eq("id", fpsico);
    const { data, error } = await s["an-tecnico"].rpc("exportar_respuestas", { p_campana: campanaF });
    expect(error).toBeNull();
    const exp = data as { cabecera: string; fin_linea: string; lineas: string[] };
    expect(exp.cabecera).toBe("*".repeat(40));
    expect(exp.fin_linea).toBe("crlf");
    expect(exp.lineas.length).toBe(5);
    // Fecha vacía, sin preguntas variables, 89 respuestas y sin identificador.
    for (const linea of exp.lineas) expect(linea).toMatch(/^"","","[1-4]{89}"$/);
  });

  it("el informe es el documento que sube el técnico; solo él lo adjunta y lo firma", async () => {
    expect((await s["an-cuenta"].rpc("preparar_informe", { p_campana: campana })).error?.message).toContain("seguimientos");
    const preparado = await s["an-cuenta"].rpc("preparar_informe", { p_campana: evals.grande });
    expect(preparado.error).toBeNull();
    informe = preparado.data as string;

    const sinDocumento = await s["an-tecnico"].rpc("firmar_informe", { p_informe: informe, p_nombre: "Técnico de prueba" });
    expect(sinDocumento.error?.message).toContain("Sube antes");

    const pdf = Buffer.from("%PDF-1.4\n% documento de prueba\n%%EOF\n");
    const ruta = `${empresa}/informe-${tanda}.pdf`;
    const intruso = await s["an-intruso"].storage.from("documentos").upload(ruta, pdf, { contentType: "application/pdf" });
    expect(intruso.error).not.toBeNull();
    const gestor = await s["an-gestor"].storage.from("documentos").upload(`${empresa}/gestor-${tanda}.pdf`, pdf, { contentType: "application/pdf" });
    expect(gestor.error).not.toBeNull();
    const noPdf = await s["an-tecnico"].storage.from("documentos").upload(`${empresa}/no-${tanda}.txt`, Buffer.from("hola"), { contentType: "text/plain" });
    expect(noPdf.error).not.toBeNull();
    const subida = await s["an-tecnico"].storage.from("documentos").upload(ruta, pdf, { contentType: "application/pdf" });
    expect(subida.error).toBeNull();

    const sha = "a".repeat(64);
    const porEmpresa = await s["an-cuenta"].rpc("adjuntar_informe", { p_informe: informe, p_ruta: ruta, p_nombre: "informe.pdf", p_sha256: sha });
    expect(porEmpresa.error).not.toBeNull();
    const rutaAjena = await s["an-tecnico"].rpc("adjuntar_informe", { p_informe: informe, p_ruta: `${empresaAjena}/x.pdf`, p_nombre: "x.pdf", p_sha256: sha });
    expect(rutaAjena.error).not.toBeNull();
    expect((await s["an-tecnico"].rpc("adjuntar_informe", { p_informe: informe, p_ruta: ruta, p_nombre: "informe.pdf", p_sha256: sha })).error).toBeNull();

    const obs = await s["an-cuenta"].from("informe_observaciones").insert({ informe_id: informe, texto: "No debería", autor: u["an-cuenta"].id });
    expect(obs.error).not.toBeNull();
    expect((await s["an-tecnico"].from("informe_observaciones").insert({ informe_id: informe, texto: "Observación de prueba", autor: u["an-tecnico"].id })).error).toBeNull();

    for (const rol of ["an-admin", "an-gestor", "an-cuenta"]) {
      expect((await s[rol].rpc("firmar_informe", { p_informe: informe, p_nombre: "Nombre de prueba" })).error, rol).not.toBeNull();
    }
    expect((await s["an-tecnico"].rpc("firmar_informe", { p_informe: informe, p_nombre: "Técnico de prueba" })).error).toBeNull();

    // El documento lo leen quienes ven la empresa. Nadie lo borra ni lo sustituye.
    expect((await s["an-gestor"].storage.from("documentos").download(ruta)).error).toBeNull();
    expect((await s["an-intruso"].storage.from("documentos").download(ruta)).error).not.toBeNull();
    await s["an-tecnico"].storage.from("documentos").remove([ruta]);
    const reemplazo = await s["an-tecnico"].storage.from("documentos").upload(ruta, pdf, { contentType: "application/pdf", upsert: true });
    expect(reemplazo.error).not.toBeNull();
    expect((await s["an-cuenta"].storage.from("documentos").download(ruta)).error).toBeNull();
  });

  it("el informe firmado no contiene puntuaciones y ya no cambia", async () => {
    const { data } = await s["an-gestor"].from("informes").select("estado, firmante_nombre, datos").eq("id", informe).single();
    expect(data?.estado).toBe("firmado");
    expect(data?.firmante_nombre).toBe("Técnico de prueba");
    const datos = data?.datos as Record<string, unknown>;
    expect(Object.keys(datos).sort()).toEqual(["campana", "documento", "instrumento", "observaciones"]);
    expect((datos.campana as { respuestas: number }).respuestas).toBe(6);

    const tarde = await s["an-tecnico"].from("informe_observaciones").insert({ informe_id: informe, texto: "Tarde", autor: u["an-tecnico"].id });
    expect(tarde.error).not.toBeNull();
    const otraFirma = await s["an-tecnico"].rpc("firmar_informe", { p_informe: informe, p_nombre: "Otra firma" });
    expect(otraFirma.error).not.toBeNull();
    const forzado = await servicio.from("informes").update({ firmante_nombre: "Alterado" }).eq("id", informe);
    expect(forzado.error?.message).toContain("firmado");
  });

  it("el plan de acción lo editan técnico y empresa; partner y administración solo leen", async () => {
    for (const rol of ["an-gestor", "an-admin", "an-intruso"]) {
      const { error } = await s[rol].from("medidas").insert({ empresa_id: empresa, titulo: "No debería", creada_por: u[rol].id });
      expect(error, rol).not.toBeNull();
    }
    const medida = await alta(s["an-cuenta"], "medidas", {
      empresa_id: empresa, campana_id: campana, factor_id: factorA, titulo: "Medida de prueba", responsable: "Responsable de prueba", creada_por: u["an-cuenta"].id,
    });
    const cambio = await s["an-tecnico"].from("medidas").update({ estado: "en_curso" }).eq("id", medida).select("id");
    expect(cambio.data?.length).toBe(1);

    const historial = await s["an-gestor"].from("medida_historial").select("campo, antes, despues, autor").eq("medida_id", medida).order("cuando");
    expect(historial.data?.map((h) => h.campo)).toEqual(["creada", "estado"]);
    expect(historial.data?.[1]).toMatchObject({ antes: "pendiente", despues: "en_curso", autor: u["an-tecnico"].id });
    expect((await s["an-intruso"].from("medidas").select("id").eq("id", medida)).data).toEqual([]);
  });

  it("las evidencias se registran solas y nadie las modifica ni borra", async () => {
    const { data } = await s["an-gestor"].from("evidencias").select("id, tipo").eq("empresa_id", empresa);
    const tipos = (data ?? []).map((e) => e.tipo);
    for (const tipo of ["campana_abierta", "campana_cerrada", "respuestas_exportadas", "informe_firmado", "medida_creada", "medida_estado"]) {
      expect(tipos).toContain(tipo);
    }
    expect((await s["an-intruso"].from("evidencias").select("id").eq("empresa_id", empresa)).data).toEqual([]);

    const id = data![0].id;
    const directo = await s["an-admin"].from("evidencias").insert({ empresa_id: empresa, tipo: "falsa", titulo: "Falsa" });
    expect(directo.error).not.toBeNull();
    const cambio = await servicio.from("evidencias").update({ titulo: "Alterada" }).eq("id", id);
    expect(cambio.error?.message).toContain("no se puede modificar");
    const borrado = await servicio.from("evidencias").delete().eq("id", id);
    expect(borrado.error?.message).toContain("no se puede modificar");
  });
});
