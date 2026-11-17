import type { Metadata } from "next";
import { EnlaceBoton } from "@/components/ui/boton";
import { ListaEmpresas, Pestanas } from "@/components/panel/listas";
import { Cabecera, EstadoVacio } from "@/components/ui/piezas";
import { estadosDeEvaluacion } from "@/lib/estado-evaluacion";
import { cargarPartner, pestanasPartner } from "@/lib/partner";

export const metadata: Metadata = { title: "Empresas" };

export default async function PaginaPartner({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params;
  const { supabase, partner, esGestor } = await cargarPartner(partnerId);

  const { data: empresas } = await supabase
    .from("empresas")
    .select("id, nombre, plantilla_declarada, es_demo")
    .eq("partner_id", partner.id)
    .order("nombre");

  const estados = await estadosDeEvaluacion(supabase, (empresas ?? []).map((e) => e.id));
  const lista = (empresas ?? []).map((e) => ({ ...e, estado: estados[e.id] }));

  const base = `/panel/partner/${partner.id}`;
  return (
    <>
      <Cabecera
        titulo={partner.nombre}
        descripcion={
          esGestor
            ? "Estas son las empresas que gestionas. Solo verás datos agregados de cada una."
            : "Estas son las empresas que tienes asignadas."
        }
        acciones={esGestor ? <EnlaceBoton href={`${base}/empresas/nueva`}>Dar de alta una empresa</EnlaceBoton> : undefined}
      />
      <Pestanas enlaces={pestanasPartner(partner.id, esGestor)} actual={base} />
      {lista.length > 0 ? (
        <ListaEmpresas empresas={lista} />
      ) : (
        <EstadoVacio
          titulo="Todavía no hay empresas"
          texto={
            esGestor
              ? "Da de alta la primera empresa para preparar su evaluación."
              : "Cuando te asignen una empresa, aparecerá aquí."
          }
          accion={esGestor ? <EnlaceBoton href={`${base}/empresas/nueva`}>Dar de alta una empresa</EnlaceBoton> : undefined}
        />
      )}
    </>
  );
}
