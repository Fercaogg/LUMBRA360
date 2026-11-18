import "server-only";
import { notFound } from "next/navigation";
import { exigirAcceso } from "@/lib/acceso";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { esquemaUuid } from "@/lib/validacion";

// Carga una empresa con la sesión de quien navega. Si RLS no la devuelve, es un 404.
export async function cargarEmpresa(empresaIdBruto: string) {
  const acceso = await exigirAcceso();
  const id = esquemaUuid.safeParse(empresaIdBruto);
  if (!id.success) notFound();

  const supabase = await crearClienteServidor();
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nombre, plantilla_declarada, es_demo, partner_id")
    .eq("id", id.data)
    .maybeSingle();
  if (!empresa) notFound();

  const via = acceso.empresas.find((e) => e.id === empresa.id)?.via;
  const gestiona = acceso.esAdmin || acceso.partners.some((p) => p.id === empresa.partner_id && p.rol === "gestor");
  const esTecnico = via === "tecnico";
  const esCuenta = via === "empresa";
  return { acceso, supabase, empresa, gestiona, esTecnico, esCuenta, editaPlan: esTecnico || esCuenta, soloLectura: acceso.esVisor };
}

export function pestanasEmpresa(empresaId: string) {
  const base = `/panel/empresa/${empresaId}`;
  return [
    { href: base, texto: "Resumen" },
    { href: `${base}/campanas`, texto: "Campañas y seguimientos" },
    { href: `${base}/plan`, texto: "Plan de acción" },
    { href: `${base}/desconexion`, texto: "Desconexión digital" },
    { href: `${base}/estructura`, texto: "Grupos" },
  ];
}

export function fecha(valor: string | null | undefined): string {
  if (!valor) return "";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" }).format(new Date(valor));
}

export const ESTADOS_CAMPANA = { borrador: "Borrador", abierta: "Abierta", cerrada: "Cerrada" } as const;
