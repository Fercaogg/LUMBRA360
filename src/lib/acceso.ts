import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export type RolPartner = "gestor" | "tecnico";

export type Acceso = {
  usuario: { id: string; correo: string };
  esAdmin: boolean;
  partners: { id: string; nombre: string; rol: RolPartner }[];
  empresas: { id: string; nombre: string; via: "empresa" | "tecnico" }[];
};

// Qué puede abrir la cuenta que navega. Se calcula una vez por petición.
export const obtenerAcceso = cache(async (): Promise<Acceso | null> => {
  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  const usuario = sesion.user;
  if (!usuario?.email) return null;

  const [admin, partners, cuentas, asignadas] = await Promise.all([
    supabase.from("administradores").select("usuario_id").eq("usuario_id", usuario.id).maybeSingle(),
    supabase.from("partner_miembros").select("rol, partners(id, nombre)").eq("usuario_id", usuario.id),
    supabase.from("empresa_miembros").select("empresas(id, nombre)").eq("usuario_id", usuario.id),
    supabase.from("tecnico_empresas").select("empresas(id, nombre)").eq("usuario_id", usuario.id),
  ]);

  const empresas: Acceso["empresas"] = [];
  for (const fila of cuentas.data ?? []) {
    if (fila.empresas) empresas.push({ ...fila.empresas, via: "empresa" });
  }
  for (const fila of asignadas.data ?? []) {
    if (fila.empresas && !empresas.some((e) => e.id === fila.empresas!.id)) {
      empresas.push({ ...fila.empresas, via: "tecnico" });
    }
  }

  return {
    usuario: { id: usuario.id, correo: usuario.email },
    esAdmin: Boolean(admin.data),
    partners: (partners.data ?? []).flatMap((fila) =>
      fila.partners ? [{ ...fila.partners, rol: fila.rol }] : [],
    ),
    empresas: empresas.sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
  };
});

export async function exigirAcceso(): Promise<Acceso> {
  const acceso = await obtenerAcceso();
  if (!acceso) redirect("/acceso");
  return acceso;
}

export async function exigirAdmin(): Promise<Acceso> {
  const acceso = await exigirAcceso();
  if (!acceso.esAdmin) redirect("/panel");
  return acceso;
}
