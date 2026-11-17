import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { borrarUsuarios, clienteAnonimo, clienteServicio, correoDePrueba, crearUsuario, entrarComo } from "./entorno";

// Fase 3: política de desconexión, acuse de lectura, audiencia y formación.

const tanda = randomUUID().slice(0, 8);
const servicio = clienteServicio();
const u: Record<string, { id: string; correo: string }> = {};
const s: Record<string, SupabaseClient> = {};
let partner = "";
let empresa = "";
let empresaAjena = "";
let plantilla = "";
let politica = "";
let token = "";

async function alta(cliente: SupabaseClient, tabla: string, fila: Record<string, unknown>): Promise<string> {
  const { data, error } = await cliente.from(tabla).insert(fila).select("id").single();
  if (error || !data) throw new Error(`Alta en ${tabla}: ${error?.message}`);
  return (data as { id: string }).id;
}

beforeAll(async () => {
  const c = (e: string) => correoDePrueba(e, tanda);
  partner = await alta(servicio, "partners", { nombre: `Partner desc ${tanda}`, es_demo: true });
  empresa = await alta(servicio, "empresas", { nombre: `Empresa desc ${tanda}`, partner_id: partner, es_demo: true });
  empresaAjena = await alta(servicio, "empresas", { nombre: `Ajena desc ${tanda}`, es_demo: true });
  await servicio.from("invitaciones").insert([
    { correo: c("de-admin"), rol: "admin" },
    { correo: c("de-gestor"), rol: "partner", partner_id: partner },
    { correo: c("de-tecnico"), rol: "tecnico", partner_id: partner, empresa_id: empresa },
    { correo: c("de-cuenta"), rol: "empresa", empresa_id: empresa },
    { correo: c("de-intruso"), rol: "empresa", empresa_id: empresaAjena },
  ]);
  for (const e of ["de-admin", "de-gestor", "de-tecnico", "de-cuenta", "de-intruso"]) {
    u[e] = await crearUsuario(c(e));
    s[e] = await entrarComo(u[e].correo);
  }
});

afterAll(async () => {
  await servicio.rpc("borrar_empresa_completa", { p_empresa: empresa });
  await servicio.rpc("borrar_empresa_completa", { p_empresa: empresaAjena });
  await servicio.from("politica_plantillas").delete().eq("id", plantilla);
  await servicio.from("partners").delete().eq("id", partner);
  await borrarUsuarios(Object.values(u).map((x) => x.id));
});

describe("plantilla de política", () => {
  it("solo administración la crea, y no se publica sin revisión jurídica", async () => {
    expect((await s["de-cuenta"].from("politica_plantillas").insert({ nombre: "Intrusa" })).error).not.toBeNull();
    plantilla = await alta(s["de-admin"], "politica_plantillas", { nombre: `Plantilla de prueba ${tanda}` });
    await s["de-admin"].from("politica_plantilla_secciones").insert([
      { plantilla_id: plantilla, titulo: "Sección 1", cuerpo: "Texto de prueba 1", orden: 1 },
      { plantilla_id: plantilla, titulo: "Sección 2", cuerpo: "", orden: 2 },
    ]);
    // En borrador no la ve nadie más.
    expect((await s["de-cuenta"].from("politica_plantillas").select("id").eq("id", plantilla)).data).toEqual([]);

    const sinRevision = await s["de-admin"].rpc("publicar_plantilla_politica", { p_plantilla: plantilla });
    expect(sinRevision.error?.message).toContain("revisión jurídica");
    await s["de-admin"].from("politica_plantillas").update({ revisada_juridicamente: true }).eq("id", plantilla);
    expect((await s["de-gestor"].rpc("publicar_plantilla_politica", { p_plantilla: plantilla })).error).not.toBeNull();
    expect((await s["de-admin"].rpc("publicar_plantilla_politica", { p_plantilla: plantilla })).error).toBeNull();

    const cambio = await s["de-admin"].from("politica_plantilla_secciones").update({ cuerpo: "Cambiado" }).eq("plantilla_id", plantilla);
    expect(cambio.error?.message).toContain("publicada");
  });
});

describe("política de la empresa", () => {
  it("la inician y editan técnico y empresa; partner y administración solo leen", async () => {
    for (const rol of ["de-admin", "de-gestor", "de-intruso"]) {
      expect((await s[rol].rpc("iniciar_politica", { p_empresa: empresa, p_plantilla: plantilla })).error, rol).not.toBeNull();
    }
    const inicio = await s["de-cuenta"].rpc("iniciar_politica", { p_empresa: empresa, p_plantilla: plantilla });
    expect(inicio.error).toBeNull();
    politica = inicio.data as string;
    expect((await s["de-tecnico"].rpc("iniciar_politica", { p_empresa: empresa, p_plantilla: plantilla })).error?.message).toContain("borrador");

    const { data } = await s["de-gestor"].from("politicas").select("version, estado, secciones").eq("id", politica).single();
    expect(data).toMatchObject({ version: 1, estado: "borrador" });
    expect((data?.secciones as unknown[]).length).toBe(2);
    expect((await s["de-intruso"].from("politicas").select("id").eq("id", politica)).data).toEqual([]);

    const porGestor = await s["de-gestor"].from("politicas").update({ secciones: [] }).eq("id", politica).select("id");
    expect(porGestor.data ?? []).toEqual([]);
  });

  it("no se aprueba con secciones vacías; aprobada queda cerrada con fecha", async () => {
    const incompleta = await s["de-cuenta"].rpc("aprobar_politica", { p_politica: politica, p_nombre: "Dirección de prueba" });
    expect(incompleta.error?.message).toContain("Completa");

    const secciones = [
      { titulo: "Sección 1", cuerpo: "Texto de prueba 1 adaptado" },
      { titulo: "Sección 2", cuerpo: "Texto de prueba 2" },
    ];
    const edicion = await s["de-tecnico"].from("politicas").update({ secciones }).eq("id", politica).select("id");
    expect(edicion.data?.length).toBe(1);
    expect((await s["de-gestor"].rpc("aprobar_politica", { p_politica: politica, p_nombre: "Gestor" })).error).not.toBeNull();
    expect((await s["de-cuenta"].rpc("aprobar_politica", { p_politica: politica, p_nombre: "Dirección de prueba" })).error).toBeNull();

    const tarde = await s["de-cuenta"].from("politicas").update({ secciones: [] }).eq("id", politica).select("id");
    expect(tarde.data ?? []).toEqual([]);
    const forzado = await servicio.from("politicas").update({ secciones: [] }).eq("id", politica);
    expect(forzado.error?.message).toContain("aprobada");

    // La siguiente versión es la 2 y parte de la plantilla.
    const v2 = await s["de-tecnico"].rpc("iniciar_politica", { p_empresa: empresa, p_plantilla: plantilla });
    const { data } = await s["de-cuenta"].from("politicas").select("version").eq("id", v2.data as string).single();
    expect(data?.version).toBe(2);
  });
});

describe("acuse de lectura", () => {
  it("se abre solo sobre una versión aprobada y solo el servidor registra acuses", async () => {
    expect((await s["de-gestor"].rpc("cambiar_acuse", { p_politica: politica, p_abrir: true })).error).not.toBeNull();
    expect((await s["de-cuenta"].rpc("cambiar_acuse", { p_politica: politica, p_abrir: true })).error).toBeNull();
    const { data } = await s["de-cuenta"].from("politicas").select("token_acuse").eq("id", politica).single();
    token = data!.token_acuse as string;
    expect(token.length).toBeGreaterThan(20);

    for (const cliente of [clienteAnonimo(), s["de-cuenta"]]) {
      expect((await cliente.rpc("registrar_acuse", { p_token: token, p_nombre: "Persona de prueba" })).error).not.toBeNull();
      expect((await cliente.rpc("obtener_politica_acuse", { p_token: token })).error).not.toBeNull();
      expect((await cliente.from("acuses").insert({ politica_id: politica, nombre: "Directo" })).error).not.toBeNull();
    }

    const leida = await servicio.rpc("obtener_politica_acuse", { p_token: token });
    expect((leida.data as { version: number; secciones: unknown[] }).secciones.length).toBe(2);
    expect((await servicio.rpc("registrar_acuse", { p_token: token, p_nombre: "Persona de prueba" })).data).toBe("ok");
    expect((await servicio.rpc("registrar_acuse", { p_token: token, p_nombre: "X" })).data).toBe("nombre");
    expect((await servicio.rpc("registrar_acuse", { p_token: "x".repeat(32), p_nombre: "Persona de prueba" })).data).toBe("no_valido");
  });

  it("la empresa ve los acuses con nombre y fecha; una empresa ajena no; nadie los borra", async () => {
    const propios = await s["de-cuenta"].from("acuses").select("id, nombre, registrado_el").eq("politica_id", politica);
    expect(propios.data?.map((a) => a.nombre)).toEqual(["Persona de prueba"]);
    expect((await s["de-gestor"].from("acuses").select("id").eq("politica_id", politica)).data?.length).toBe(1);
    expect((await s["de-intruso"].from("acuses").select("id").eq("politica_id", politica)).data).toEqual([]);

    const borrado = await servicio.from("acuses").delete().eq("id", propios.data![0].id);
    expect(borrado.error?.message).toContain("no se puede modificar");

    await s["de-cuenta"].rpc("cambiar_acuse", { p_politica: politica, p_abrir: false });
    expect((await servicio.rpc("registrar_acuse", { p_token: token, p_nombre: "Llega tarde" })).data).toBe("no_valido");
  });

  it("el acuse no comparte nada con los cuestionarios anónimos", async () => {
    const { data } = await s["de-admin"].from("acuses").select("*").eq("politica_id", politica);
    expect(Object.keys(data![0]).sort()).toEqual(["id", "nombre", "politica_id", "registrado_el"]);
  });
});

describe("audiencia y formación", () => {
  it("las registran técnico y empresa, con fecha y autor, y no se pueden alterar", async () => {
    const base = { empresa_id: empresa, fecha: "2026-11-10", asistentes: "Representante de prueba 1, Representante de prueba 2" };
    expect((await s["de-gestor"].from("audiencias").insert({ ...base, creada_por: u["de-gestor"].id })).error).not.toBeNull();
    expect((await s["de-intruso"].from("audiencias").insert({ ...base, creada_por: u["de-intruso"].id })).error).not.toBeNull();
    const rutaAjena = await s["de-cuenta"].from("audiencias").insert({ ...base, acta_ruta: `${empresaAjena}/acta.pdf`, creada_por: u["de-cuenta"].id });
    expect(rutaAjena.error).not.toBeNull();

    const audiencia = await alta(s["de-cuenta"], "audiencias", {
      ...base, politica_id: politica, acta_ruta: `${empresa}/acta-${tanda}.pdf`, acta_nombre: "acta.pdf", acta_sha256: "b".repeat(64), creada_por: u["de-cuenta"].id,
    });
    const formacion = await alta(s["de-tecnico"], "formaciones", {
      empresa_id: empresa, titulo: "Sesión de prueba", fecha: "2026-11-12", participantes: 14, creada_por: u["de-tecnico"].id,
    });

    expect((await servicio.from("audiencias").update({ asistentes: "Alterado" }).eq("id", audiencia)).error?.message).toContain("no se puede modificar");
    expect((await servicio.from("formaciones").delete().eq("id", formacion)).error?.message).toContain("no se puede modificar");
    expect((await s["de-intruso"].from("audiencias").select("id").eq("empresa_id", empresa)).data).toEqual([]);
    expect((await s["de-gestor"].from("formaciones").select("id").eq("empresa_id", empresa)).data?.length).toBe(1);
  });

  it("todo queda en el registro de evidencias", async () => {
    const { data } = await s["de-gestor"].from("evidencias").select("tipo").eq("empresa_id", empresa);
    const tipos = (data ?? []).map((e) => e.tipo);
    for (const tipo of ["politica_aprobada", "acuse_abierto", "acuse_cerrado", "audiencia_registrada", "formacion_registrada"]) {
      expect(tipos).toContain(tipo);
    }
  });
});
