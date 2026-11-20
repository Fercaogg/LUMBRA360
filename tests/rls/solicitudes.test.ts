import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { borrarUsuarios, clienteAnonimo, clienteServicio, correoDePrueba, crearUsuario, entrarComo } from "./entorno";

// Solicitudes de demostración: entran solo por el servidor y solo la administración las ve y las borra.

const tanda = randomUUID().slice(0, 8);
const servicio = clienteServicio();
let admin: { id: string; correo: string };
let otra: { id: string; correo: string };
let sAdmin: SupabaseClient;
let sOtra: SupabaseClient;
let solicitud = "";

beforeAll(async () => {
  admin = await crearUsuario(correoDePrueba("sol-admin", tanda));
  otra = await crearUsuario(correoDePrueba("sol-otra", tanda));
  const alta = await servicio.from("administradores").insert({ usuario_id: admin.id });
  if (alta.error) throw new Error(alta.error.message);
  const { data, error } = await servicio
    .from("solicitudes_demo")
    .insert({ nombre: `Prueba ${tanda}`, correo: `sol-${tanda}@example.com`, acepta_novedades: true })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message);
  solicitud = data.id;
  sAdmin = await entrarComo(admin.correo);
  sOtra = await entrarComo(otra.correo);
});

afterAll(async () => {
  await servicio.from("solicitudes_demo").delete().eq("id", solicitud);
  await servicio.from("administradores").delete().eq("usuario_id", admin.id);
  await borrarUsuarios([admin.id, otra.id]);
});

describe("solicitudes de demostración", () => {
  it("nadie sin sesión puede leerlas ni crearlas directamente", async () => {
    const anon = clienteAnonimo();
    const lectura = await anon.from("solicitudes_demo").select("id").eq("id", solicitud);
    expect(lectura.data ?? []).toHaveLength(0);
    const alta = await anon.from("solicitudes_demo").insert({ nombre: "Robot", correo: "robot@example.com" });
    expect(alta.error).not.toBeNull();
  });

  it("una cuenta que no es de administración no las ve ni las borra", async () => {
    const lectura = await sOtra.from("solicitudes_demo").select("id").eq("id", solicitud);
    expect(lectura.data ?? []).toHaveLength(0);
    await sOtra.from("solicitudes_demo").delete().eq("id", solicitud);
    const sigue = await servicio.from("solicitudes_demo").select("id").eq("id", solicitud);
    expect(sigue.data).toHaveLength(1);
    const alta = await sOtra.from("solicitudes_demo").insert({ nombre: "Otra", correo: "otra@example.com" });
    expect(alta.error).not.toBeNull();
  });

  it("la administración las ve y puede borrarlas", async () => {
    const lectura = await sAdmin.from("solicitudes_demo").select("id, acepta_novedades").eq("id", solicitud);
    expect(lectura.data).toHaveLength(1);
    expect(lectura.data?.[0].acepta_novedades).toBe(true);
    await sAdmin.from("solicitudes_demo").delete().eq("id", solicitud);
    const queda = await servicio.from("solicitudes_demo").select("id").eq("id", solicitud);
    expect(queda.data).toHaveLength(0);
  });
});
