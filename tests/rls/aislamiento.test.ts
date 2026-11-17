import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  borrarUsuarios,
  clienteAnonimo,
  clienteServicio,
  correoDePrueba,
  crearUsuario,
  entrarComo,
} from "./entorno";

// Demuestra el aislamiento de la fase 1:
// una empresa no lee datos de otra y un partner no ve empresas ajenas.

const tanda = randomUUID().slice(0, 8);
const servicio = clienteServicio();

const ids = {
  partnerA: "",
  partnerB: "",
  empresaA1: "",
  empresaA2: "",
  empresaB1: "",
  empresaDirecta: "",
};
const usuarios: Record<string, { id: string; correo: string }> = {};
const sesiones: Record<string, SupabaseClient> = {};

async function insertar<T extends Record<string, unknown>>(tabla: string, fila: T): Promise<string> {
  const { data, error } = await servicio.from(tabla).insert(fila).select("id").single();
  if (error || !data) throw new Error(`Alta en ${tabla}: ${error?.message}`);
  return (data as { id: string }).id;
}

async function invitar(fila: Record<string, unknown>): Promise<void> {
  const { error } = await servicio.from("invitaciones").insert(fila);
  if (error) throw new Error(`Invitación: ${error.message}`);
}

async function idsVisibles(cliente: SupabaseClient, tabla: string): Promise<string[]> {
  const { data, error } = await cliente.from(tabla).select("id");
  if (error) throw new Error(`${tabla}: ${error.message}`);
  return (data as { id: string }[]).map((f) => f.id);
}

beforeAll(async () => {
  ids.partnerA = await insertar("partners", { nombre: `Partner A ${tanda}`, es_demo: true, marca_blanca: true, marca_nombre: `Marca A ${tanda}` });
  ids.partnerB = await insertar("partners", { nombre: `Partner B ${tanda}`, es_demo: true });
  ids.empresaA1 = await insertar("empresas", { nombre: `Empresa A1 ${tanda}`, partner_id: ids.partnerA, es_demo: true });
  ids.empresaA2 = await insertar("empresas", { nombre: `Empresa A2 ${tanda}`, partner_id: ids.partnerA, es_demo: true });
  ids.empresaB1 = await insertar("empresas", { nombre: `Empresa B1 ${tanda}`, partner_id: ids.partnerB, es_demo: true });
  ids.empresaDirecta = await insertar("empresas", { nombre: `Empresa directa ${tanda}`, es_demo: true });

  const c = (etiqueta: string) => correoDePrueba(etiqueta, tanda);

  // Unas invitaciones se crean antes que la cuenta y otras después: se prueban los dos caminos.
  await invitar({ correo: c("admin"), rol: "admin" });
  await invitar({ correo: c("gestor-a"), rol: "partner", partner_id: ids.partnerA });
  await invitar({ correo: c("empresa-a1"), rol: "empresa", empresa_id: ids.empresaA1 });

  for (const etiqueta of ["admin", "gestor-a", "gestor-b", "tecnico-a", "empresa-a1", "empresa-a2", "empresa-b1", "directa", "sin-rol"]) {
    usuarios[etiqueta] = await crearUsuario(c(etiqueta));
  }

  await invitar({ correo: c("gestor-b"), rol: "partner", partner_id: ids.partnerB });
  await invitar({ correo: c("tecnico-a"), rol: "tecnico", partner_id: ids.partnerA, empresa_id: ids.empresaA1 });
  await invitar({ correo: c("empresa-a2"), rol: "empresa", empresa_id: ids.empresaA2 });
  await invitar({ correo: c("empresa-b1"), rol: "empresa", empresa_id: ids.empresaB1 });
  await invitar({ correo: c("directa"), rol: "empresa", empresa_id: ids.empresaDirecta });

  for (const etiqueta of Object.keys(usuarios)) {
    sesiones[etiqueta] = await entrarComo(usuarios[etiqueta].correo);
  }
});

afterAll(async () => {
  await servicio.from("empresas").delete().in("id", [ids.empresaA1, ids.empresaA2, ids.empresaB1, ids.empresaDirecta]);
  await servicio.from("partners").delete().in("id", [ids.partnerA, ids.partnerB]);
  await borrarUsuarios(Object.values(usuarios).map((u) => u.id));
});

describe("empresa: no lee datos de otra empresa", () => {
  it("solo ve su propia empresa", async () => {
    expect(await idsVisibles(sesiones["empresa-a1"], "empresas")).toEqual([ids.empresaA1]);
    expect(await idsVisibles(sesiones["empresa-b1"], "empresas")).toEqual([ids.empresaB1]);
    expect(await idsVisibles(sesiones["directa"], "empresas")).toEqual([ids.empresaDirecta]);
  });

  it("no obtiene otra empresa aunque pida su id", async () => {
    for (const ajena of [ids.empresaA2, ids.empresaB1, ids.empresaDirecta]) {
      const { data } = await sesiones["empresa-a1"].from("empresas").select("id").eq("id", ajena);
      expect(data).toEqual([]);
    }
  });

  it("no ve partners, invitaciones ni miembros de otras empresas", async () => {
    expect(await idsVisibles(sesiones["empresa-a1"], "partners")).toEqual([]);
    expect(await idsVisibles(sesiones["empresa-a1"], "invitaciones")).toEqual([]);
    const { data } = await sesiones["empresa-a1"].from("empresa_miembros").select("empresa_id");
    expect(data).toEqual([{ empresa_id: ids.empresaA1 }]);
  });

  it("no ve perfiles de cuentas ajenas", async () => {
    const { data } = await sesiones["empresa-a1"].from("perfiles").select("id");
    expect(data).toEqual([{ id: usuarios["empresa-a1"].id }]);
  });

  it("no puede modificar ni borrar empresas, ni la suya ni las ajenas", async () => {
    for (const objetivo of [ids.empresaA1, ids.empresaB1]) {
      const cambio = await sesiones["empresa-a1"].from("empresas").update({ nombre: "Cambiada" }).eq("id", objetivo).select("id");
      expect(cambio.data ?? []).toEqual([]);
      const borrado = await sesiones["empresa-a1"].from("empresas").delete().eq("id", objetivo).select("id");
      expect(borrado.data ?? []).toEqual([]);
    }
    const { data } = await servicio.from("empresas").select("nombre").eq("id", ids.empresaB1).single();
    expect(data?.nombre).toBe(`Empresa B1 ${tanda}`);
  });

  it("no puede darse acceso a otra empresa", async () => {
    const alta = await sesiones["empresa-a1"].from("empresa_miembros").insert({ empresa_id: ids.empresaB1, usuario_id: usuarios["empresa-a1"].id });
    expect(alta.error).not.toBeNull();
    const invitacion = await sesiones["empresa-a1"].from("invitaciones").insert({
      correo: usuarios["empresa-a1"].correo, rol: "empresa", empresa_id: ids.empresaB1, creada_por: usuarios["empresa-a1"].id,
    });
    expect(invitacion.error).not.toBeNull();
  });

  it("recibe la marca blanca de su partner, pero no la de una empresa ajena", async () => {
    const propia = await sesiones["empresa-a1"].rpc("marca_de_empresa", { p_empresa: ids.empresaA1 });
    expect(propia.data).toEqual([{ nombre: `Marca A ${tanda}`, logo_ruta: null }]);
    const ajena = await sesiones["empresa-b1"].rpc("marca_de_empresa", { p_empresa: ids.empresaA1 });
    expect(ajena.data).toEqual([]);
  });
});

describe("partner: no ve empresas ajenas", () => {
  it("el gestor ve todas las empresas de su partner y ninguna más", async () => {
    expect((await idsVisibles(sesiones["gestor-a"], "empresas")).sort()).toEqual([ids.empresaA1, ids.empresaA2].sort());
    expect(await idsVisibles(sesiones["gestor-b"], "empresas")).toEqual([ids.empresaB1]);
  });

  it("el gestor solo ve su partner", async () => {
    expect(await idsVisibles(sesiones["gestor-a"], "partners")).toEqual([ids.partnerA]);
  });

  it("no ve miembros, invitaciones ni perfiles del otro partner", async () => {
    const miembros = await sesiones["gestor-a"].from("partner_miembros").select("partner_id");
    expect(new Set((miembros.data ?? []).map((m) => m.partner_id))).toEqual(new Set([ids.partnerA]));
    const invitaciones = await sesiones["gestor-a"].from("invitaciones").select("partner_id, empresa_id");
    for (const inv of invitaciones.data ?? []) {
      expect([ids.partnerA, null]).toContain(inv.partner_id);
      expect([ids.empresaA1, ids.empresaA2, null]).toContain(inv.empresa_id);
    }
    const perfiles = await sesiones["gestor-a"].from("perfiles").select("id");
    const vistos = (perfiles.data ?? []).map((p) => p.id);
    expect(vistos).not.toContain(usuarios["gestor-b"].id);
    expect(vistos).not.toContain(usuarios["empresa-b1"].id);
    expect(vistos).toContain(usuarios["empresa-a1"].id);
  });

  it("puede dar de alta una empresa en su partner, pero no en otro ni sin partner", async () => {
    const propia = await sesiones["gestor-a"].from("empresas")
      .insert({ nombre: `Alta propia ${tanda}`, partner_id: ids.partnerA, creado_por: usuarios["gestor-a"].id })
      .select("id").single();
    expect(propia.error).toBeNull();
    await servicio.from("empresas").delete().eq("id", propia.data!.id);

    const ajena = await sesiones["gestor-a"].from("empresas")
      .insert({ nombre: `Alta ajena ${tanda}`, partner_id: ids.partnerB, creado_por: usuarios["gestor-a"].id });
    expect(ajena.error).not.toBeNull();

    const suelta = await sesiones["gestor-a"].from("empresas")
      .insert({ nombre: `Alta suelta ${tanda}`, creado_por: usuarios["gestor-a"].id });
    expect(suelta.error).not.toBeNull();
  });

  it("no puede modificar empresas ajenas, ni mover una empresa, ni marcarla como demo", async () => {
    const ajena = await sesiones["gestor-a"].from("empresas").update({ nombre: "Cambiada" }).eq("id", ids.empresaB1).select("id");
    expect(ajena.data ?? []).toEqual([]);
    const mover = await sesiones["gestor-a"].from("empresas").update({ partner_id: ids.partnerB }).eq("id", ids.empresaA1);
    expect(mover.error).not.toBeNull();
    const demo = await sesiones["gestor-a"].from("empresas").update({ es_demo: false }).eq("id", ids.empresaA1);
    expect(demo.error).not.toBeNull();
  });

  it("no puede invitar a nadie al otro partner ni a sus empresas, ni crear administradores", async () => {
    const base = { correo: correoDePrueba("intruso", tanda), creada_por: usuarios["gestor-a"].id };
    const casos = [
      { ...base, rol: "partner", partner_id: ids.partnerB },
      { ...base, rol: "empresa", empresa_id: ids.empresaB1 },
      { ...base, rol: "tecnico", empresa_id: ids.empresaB1 },
      { ...base, rol: "tecnico", partner_id: ids.partnerA, empresa_id: ids.empresaB1 },
      { ...base, rol: "admin" },
    ];
    for (const caso of casos) {
      const { error } = await sesiones["gestor-a"].from("invitaciones").insert(caso);
      expect(error, JSON.stringify(caso)).not.toBeNull();
    }
    const admin = await sesiones["gestor-a"].from("administradores").insert({ usuario_id: usuarios["gestor-a"].id });
    expect(admin.error).not.toBeNull();
  });

  it("no puede asignar técnicos a empresas ajenas ni técnicos de otro partner a las suyas", async () => {
    const ajena = await sesiones["gestor-a"].from("tecnico_empresas").insert({ empresa_id: ids.empresaB1, usuario_id: usuarios["tecnico-a"].id });
    expect(ajena.error).not.toBeNull();
    const deFuera = await sesiones["gestor-a"].from("tecnico_empresas").insert({ empresa_id: ids.empresaA2, usuario_id: usuarios["gestor-b"].id });
    expect(deFuera.error).not.toBeNull();
  });

  it("puede editar su marca, pero no la del otro partner", async () => {
    const propia = await sesiones["gestor-a"].from("partners").update({ marca_nombre: `Marca A ${tanda}` }).eq("id", ids.partnerA).select("id");
    expect(propia.data).toEqual([{ id: ids.partnerA }]);
    const ajena = await sesiones["gestor-a"].from("partners").update({ marca_nombre: "Intrusa" }).eq("id", ids.partnerB).select("id");
    expect(ajena.data ?? []).toEqual([]);
  });

  it("solo sube logotipos a la carpeta de su partner", async () => {
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    const propia = await sesiones["gestor-a"].storage.from("marcas").upload(`${ids.partnerA}/logo-${tanda}.png`, png, { contentType: "image/png" });
    expect(propia.error).toBeNull();
    const ajena = await sesiones["gestor-a"].storage.from("marcas").upload(`${ids.partnerB}/logo-${tanda}.png`, png, { contentType: "image/png" });
    expect(ajena.error).not.toBeNull();
    await servicio.storage.from("marcas").remove([`${ids.partnerA}/logo-${tanda}.png`]);
  });
});

describe("técnico de prevención", () => {
  it("solo ve las empresas que tiene asignadas", async () => {
    expect(await idsVisibles(sesiones["tecnico-a"], "empresas")).toEqual([ids.empresaA1]);
  });

  it("no puede dar de alta empresas ni invitar", async () => {
    const alta = await sesiones["tecnico-a"].from("empresas")
      .insert({ nombre: `Alta técnico ${tanda}`, partner_id: ids.partnerA, creado_por: usuarios["tecnico-a"].id });
    expect(alta.error).not.toBeNull();
    const inv = await sesiones["tecnico-a"].from("invitaciones")
      .insert({ correo: correoDePrueba("otro", tanda), rol: "empresa", empresa_id: ids.empresaA1, creada_por: usuarios["tecnico-a"].id });
    expect(inv.error).not.toBeNull();
  });
});

describe("cuentas sin rol y visitantes", () => {
  it("una cuenta sin rol no ve nada", async () => {
    for (const tabla of ["empresas", "partners", "invitaciones", "pendientes"]) {
      expect(await idsVisibles(sesiones["sin-rol"], tabla)).toEqual([]);
    }
  });

  it("un visitante sin sesión no tiene permiso sobre ninguna tabla", async () => {
    const anon = clienteAnonimo();
    for (const tabla of ["empresas", "partners", "perfiles", "invitaciones", "pendientes", "administradores", "partner_miembros", "empresa_miembros", "tecnico_empresas"]) {
      const { data, error } = await anon.from(tabla).select("*");
      expect(error, tabla).not.toBeNull();
      expect(data).toBeNull();
    }
  });
});

describe("administración", () => {
  it("ve todas las empresas y partners", async () => {
    const empresas = await idsVisibles(sesiones["admin"], "empresas");
    for (const id of [ids.empresaA1, ids.empresaA2, ids.empresaB1, ids.empresaDirecta]) expect(empresas).toContain(id);
    const partners = await idsVisibles(sesiones["admin"], "partners");
    expect(partners).toContain(ids.partnerA);
    expect(partners).toContain(ids.partnerB);
  });

  it("es la única que lee la lista de pendientes", async () => {
    expect((await idsVisibles(sesiones["admin"], "pendientes")).length).toBeGreaterThan(0);
    expect(await idsVisibles(sesiones["gestor-a"], "pendientes")).toEqual([]);
  });
});

describe("invitaciones y funciones de servidor", () => {
  it("una invitación no se aplica hasta que el correo está confirmado", async () => {
    const correo = correoDePrueba("sin-confirmar", tanda);
    await invitar({ correo, rol: "empresa", empresa_id: ids.empresaB1 });
    const cuenta = await crearUsuario(correo, false);
    usuarios["sin-confirmar"] = cuenta;

    const antes = await servicio.from("empresa_miembros").select("empresa_id").eq("usuario_id", cuenta.id);
    expect(antes.data).toEqual([]);

    await servicio.auth.admin.updateUserById(cuenta.id, { email_confirm: true });
    const despues = await servicio.from("empresa_miembros").select("empresa_id").eq("usuario_id", cuenta.id);
    expect(despues.data).toEqual([{ empresa_id: ids.empresaB1 }]);
  });

  it("el límite de intentos solo lo usa el servidor y corta al superar el máximo", async () => {
    const clave = createHash("sha256").update(`test:${tanda}`).digest("hex");
    const prohibido = await sesiones["gestor-a"].rpc("consumir_intento", { p_clave: clave, p_max: 2, p_ventana_segundos: 60 });
    expect(prohibido.error).not.toBeNull();

    const resultados: boolean[] = [];
    for (let i = 0; i < 3; i++) {
      const { data, error } = await servicio.rpc("consumir_intento", { p_clave: clave, p_max: 2, p_ventana_segundos: 60 });
      expect(error).toBeNull();
      resultados.push(data as boolean);
    }
    expect(resultados).toEqual([true, true, false]);
  });

  it("la comprobación de correo invitado no está al alcance de las cuentas", async () => {
    const { error } = await sesiones["sin-rol"].rpc("correo_puede_acceder", { p_correo: usuarios["admin"].correo });
    expect(error).not.toBeNull();
    const invitado = await servicio.rpc("correo_puede_acceder", { p_correo: usuarios["admin"].correo });
    expect(invitado.data).toBe(true);
    const desconocido = await servicio.rpc("correo_puede_acceder", { p_correo: correoDePrueba("nadie", tanda) });
    expect(desconocido.data).toBe(false);
  });
});
