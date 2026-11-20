import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { ORIGEN_INSST } from "@/config/atribucion";
import { CuestionarioPorPasos, type DimensionCuestionario, type ItemCuestionario } from "@/components/cuestionario/cuestionario-por-pasos";
import { GarantiasAnonimato } from "@/components/cuestionario/garantias";
import { EnlaceBoton } from "@/components/ui/boton";
import { Cabecera, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { cargarEmpresa } from "@/lib/empresa";
import { esquemaUuid } from "@/lib/validacion";

export const metadata: Metadata = { title: "Vista previa del cuestionario" };

type Vista = {
  estado: string;
  campana: { nombre: string; tipo: "evaluacion" | "pulso"; minimo_grupo: number };
  instrumento: { nombre: string; minutos: number | null; es_demo: boolean; origen: "propio" | "insst_fpsico"; estructura_fpsico: boolean };
  items: ItemCuestionario[];
  dimensiones: DimensionCuestionario[];
};

// Lo mismo que ve la plantilla, pantalla a pantalla, sin poder enviar nada.
// No usa ningún código ni cuenta participación.
export default async function PaginaVistaPrevia({ params }: { params: Promise<{ empresaId: string; campanaId: string }> }) {
  const { empresaId, campanaId } = await params;
  const { supabase, empresa } = await cargarEmpresa(empresaId);
  const id = esquemaUuid.safeParse(campanaId);
  if (!id.success) notFound();

  const { data: campana } = await supabase.from("campanas").select("id").eq("id", id.data).eq("empresa_id", empresa.id).maybeSingle();
  if (!campana) notFound();
  const { data } = await supabase.rpc("vista_previa_cuestionario", { p_campana: campana.id });
  const vista = data as Vista | null;
  if (!vista || vista.estado !== "ok") notFound();

  const ruta = `/panel/empresa/${empresa.id}/campanas/${campana.id}`;
  const esEvaluacion = vista.campana.tipo === "evaluacion";

  return (
    <>
      <Cabecera
        antetitulo="Vista previa"
        titulo={vista.campana.nombre}
        descripcion="Así lo ve la plantilla al entrar con su código, pantalla a pantalla. Aquí no se envía nada ni cuenta como respuesta."
        acciones={<EnlaceBoton variante="secundario" href={ruta}>Volver a la campaña</EnlaceBoton>}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Etiqueta tono="acento">
          <Eye size={12} aria-hidden /> Solo lectura
        </Etiqueta>
        <Etiqueta>{vista.items.length} preguntas</Etiqueta>
        {vista.instrumento.estructura_fpsico ? <Etiqueta>Estructura FPSICO: 44 preguntas, 89 ítems</Etiqueta> : null}
        {vista.instrumento.es_demo ? <Etiqueta tono="aviso">Textos ficticios</Etiqueta> : null}
      </div>
      <Tarjeta className="mx-auto w-full max-w-2xl">
        <CuestionarioPorPasos
          vistaPrevia
          items={vista.items}
          dimensiones={vista.dimensiones}
          estructuraFpsico={vista.instrumento.estructura_fpsico}
          minutos={vista.instrumento.minutos}
          avisoAnonimato={<GarantiasAnonimato esEvaluacion={esEvaluacion} minimo={vista.campana.minimo_grupo} />}
        />
        {vista.instrumento.origen === "insst_fpsico" ? <p className="mt-6 text-sm text-tinta-suave">{ORIGEN_INSST}</p> : null}
      </Tarjeta>
    </>
  );
}
