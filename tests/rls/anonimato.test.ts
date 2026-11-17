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
  instrumento = await alta(s["an-admin"], "instrumentos", { nombre: `Instrumento de prueba ${tanda}`, tipo: "evaluacion" });
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
  await servicio.from("instrumentos").delete().eq("id", instrumento);
  await servicio.from("partners").delete().eq("id", partner);
  await borrarUsuarios(Object.values(u).map((x) => x.id));
});

describe("instrumentos", () => {
  it("no se publica sin confirmar instrumento y licencia, salvo que sea de demostración", async () => {
    const real = await alta(s["an-admin"], "instrumentos", { nombre: `Sin licencia ${tanda}` });
    const { error } = await s["an-admin"].rpc("publicar_instrumento", { p_instrumento: real });
    expect(error?.message).toContain("licencia");
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
  it("solo el técnico asignado añade observaciones y firma", async () => {
    const preparado = await s["an-cuenta"].rpc("preparar_informe", { p_campana: campana });
    expect(preparado.error).toBeNull();
    informe = preparado.data as string;

    const obsEmpresa = await s["an-cuenta"].from("informe_observaciones").insert({ informe_id: informe, texto: "No debería", autor: u["an-cuenta"].id });
    expect(obsEmpresa.error).not.toBeNull();
    const obsTecnico = await s["an-tecnico"].from("informe_observaciones").insert({ informe_id: informe, factor_id: factorA, texto: "Observación de prueba", autor: u["an-tecnico"].id });
    expect(obsTecnico.error).toBeNull();

    for (const rol of ["an-admin", "an-gestor", "an-cuenta"]) {
      const { error } = await s[rol].rpc("firmar_informe", { p_informe: informe, p_nombre: "Nombre de prueba" });
      expect(error, rol).not.toBeNull();
    }
    const firma = await s["an-tecnico"].rpc("firmar_informe", { p_informe: informe, p_nombre: "Técnico de prueba" });
    expect(firma.error).toBeNull();
  });

  it("el informe firmado guarda la foto de los agregados y ya no cambia", async () => {
    const { data } = await s["an-gestor"].from("informes").select("estado, firmante_nombre, datos").eq("id", informe).single();
    expect(data?.estado).toBe("firmado");
    expect(data?.firmante_nombre).toBe("Técnico de prueba");
    expect((data?.datos as { resultados: { n: number } }).resultados.n).toBe(20);

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
    for (const tipo of ["campana_abierta", "campana_cerrada", "informe_firmado", "medida_creada", "medida_estado"]) {
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
