import "server-only";
import { notFound } from "next/navigation";
import { exigirAcceso } from "@/lib/acceso";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { esquemaUuid } from "@/lib/validacion";

// Carga un partner con la sesión de quien navega. Si RLS no lo devuelve, es un 404.
export async function cargarPartner(partnerIdBruto: string) {
  const acceso = await exigirAcceso();
  const id = esquemaUuid.safeParse(partnerIdBruto);
  if (!id.success) notFound();

  const supabase = await crearClienteServidor();
  const { data: partner } = await supabase
    .from("partners")
    .select("id, nombre, marca_blanca, marca_nombre, marca_logo_ruta, es_demo")
    .eq("id", id.data)
    .maybeSingle();
  if (!partner) notFound();

  const esGestor = acceso.esAdmin || acceso.partners.some((p) => p.id === partner.id && p.rol === "gestor");
  return { acceso, supabase, partner, esGestor };
}

export function pestanasPartner(partnerId: string, esGestor: boolean) {
  const base = `/panel/partner/${partnerId}`;
  return esGestor
    ? [
        { href: base, texto: "Empresas" },
        { href: `${base}/equipo`, texto: "Equipo" },
        { href: `${base}/marca`, texto: "Marca" },
      ]
    : [{ href: base, texto: "Empresas" }];
}
