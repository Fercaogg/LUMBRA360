import type { Metadata } from "next";
import Link from "next/link";
import { Pestanas } from "@/components/panel/listas";
import { EnlaceBoton } from "@/components/ui/boton";
import { Cabecera, EstadoVacio, Etiqueta } from "@/components/ui/piezas";
import { cargarEmpresa, ESTADOS_CAMPANA, fecha, pestanasEmpresa } from "@/lib/empresa";

export const metadata: Metadata = { title: "Campañas" };

export default async function PaginaCampanas({ params }: { params: Promise<{ empresaId: string }> }) {
  const { empresaId } = await params;
  const { supabase, empresa } = await cargarEmpresa(empresaId);
  const base = `/panel/empresa/${empresa.id}`;
  const { data } = await supabase
    .from("campanas")
    .select("id, nombre, tipo, estado, abierta_el, cerrada_el, creada_el")
    .eq("empresa_id", empresa.id)
    .order("creada_el", { ascending: false });
  const lista = data ?? [];

  return (
    <>
      <Cabecera
        titulo="Campañas y seguimientos"
        descripcion={empresa.nombre}
        acciones={<EnlaceBoton href={`${base}/campanas/nueva`}>Preparar una campaña</EnlaceBoton>}
      />
      <Pestanas enlaces={pestanasEmpresa(empresa.id)} actual={`${base}/campanas`} />
      {lista.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hay campañas"
          texto="Una campaña invita a la plantilla a responder un cuestionario anónimo. Los seguimientos son cuestionarios breves entre evaluaciones."
          accion={<EnlaceBoton href={`${base}/campanas/nueva`}>Preparar una campaña</EnlaceBoton>}
        />
      ) : (
        <ul className="flex flex-col divide-y divide-linea overflow-hidden rounded-xl border border-linea bg-superficie">
          {lista.map((campana) => (
            <li key={campana.id}>
              <Link href={`${base}/campanas/${campana.id}`} className="flex flex-col gap-2 p-4 transition-colors duration-150 hover:bg-papel sm:flex-row sm:items-center sm:justify-between">
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{campana.nombre}</span>
                  <span className="text-sm text-tinta-suave">
                    {campana.estado === "cerrada"
                      ? `Cerrada el ${fecha(campana.cerrada_el)}`
                      : campana.estado === "abierta"
                        ? `Abierta el ${fecha(campana.abierta_el)}`
                        : `Creada el ${fecha(campana.creada_el)}`}
                  </span>
                </span>
                <span className="flex flex-wrap gap-2">
                  <Etiqueta>{campana.tipo === "pulso" ? "Seguimiento" : "Evaluación"}</Etiqueta>
                  <Etiqueta tono={campana.estado === "abierta" ? "acento" : "neutro"}>{ESTADOS_CAMPANA[campana.estado]}</Etiqueta>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
