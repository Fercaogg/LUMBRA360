import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ORIGEN_INSST } from "@/config/atribucion";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo } from "@/components/marca/logotipo";
import { EnlaceBoton } from "@/components/ui/boton";
import { CuestionarioPorPasos, type DimensionCuestionario, type ItemCuestionario } from "@/components/cuestionario/cuestionario-por-pasos";
import { GarantiasAnonimato } from "@/components/cuestionario/garantias";
import { Formulario } from "@/components/ui/formulario";
import { Cargando, Etiqueta } from "@/components/ui/piezas";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { esquemaAccesoRespuesta } from "@/lib/validacion";
import { enviarRespuesta } from "../acciones";

export const metadata: Metadata = { title: "Cuestionario", referrer: "no-referrer" };

type Cuestionario = {
  estado: string;
  campana?: { nombre: string; tipo: "evaluacion" | "pulso"; minimo_grupo: number };
  empresa?: string;
  instrumento?: {
    nombre: string;
    descripcion: string | null;
    minutos: number | null;
    es_demo: boolean;
    origen: "propio" | "insst_fpsico";
    estructura_fpsico: boolean;
  };
  items?: ItemCuestionario[];
  dimensiones?: DimensionCuestionario[];
};

const AVISOS: Record<string, { titulo: string; texto: string }> = {
  no_valido: { titulo: "Este código o enlace no es válido", texto: "Revise que lo ha escrito bien, o pida uno nuevo a su empresa." },
  usado: { titulo: "Este código ya se ha usado", texto: "Cada código sirve una sola vez. Si no ha respondido usted, pida otro a su empresa." },
  cerrada: { titulo: "Esta campaña ya se ha cerrado", texto: "Ya no admite respuestas." },
  no_abierta: { titulo: "Esta campaña todavía no se ha abierto", texto: "Vuelva a probar cuando su empresa le avise." },
  completa: { titulo: "Este enlace ya no admite más respuestas", texto: "Ya han respondido tantas personas como se invitaron. Si usted no ha respondido, avise a su empresa." },
};

async function Contenido({ params }: { params: Promise<{ acceso: string }> }) {
  await connection();
  const { acceso: bruto } = await params;
  const acceso = esquemaAccesoRespuesta.safeParse(decodeURIComponent(bruto));

  let cuestionario: Cuestionario = { estado: "no_valido" };
  if (acceso.success) {
    const { data } = await crearClienteAdmin().rpc("obtener_cuestionario", { p_acceso: acceso.data });
    if (data) cuestionario = data as Cuestionario;
  }

  if (cuestionario.estado !== "ok" || !acceso.success) {
    const aviso = AVISOS[cuestionario.estado] ?? AVISOS.no_valido;
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="font-serif text-2xl font-medium leading-tight tracking-tight">{aviso.titulo}</h1>
        <p className="text-pretty text-tinta-suave">{aviso.texto}</p>
        <EnlaceBoton variante="secundario" href="/responder">
          Escribir otro código
        </EnlaceBoton>
      </div>
    );
  }

  const { campana, empresa, instrumento, items = [], dimensiones = [] } = cuestionario;
  const esEvaluacion = campana?.tipo === "evaluacion";

  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-sm text-tinta-suave">{empresa}</p>
        <h1 className="text-balance font-serif text-2xl font-medium leading-tight tracking-tight sm:text-3xl">{campana?.nombre}</h1>
        <p className="flex flex-wrap items-center gap-2 text-sm text-tinta-suave">
          <span>
            {instrumento?.estructura_fpsico ? `${new Set(items.map((i) => i.pregunta)).size} preguntas (${items.length} respuestas)` : `${items.length} preguntas`}
          </span>
          {instrumento?.minutos ? <span>· unos {instrumento.minutos} minutos</span> : null}
          {instrumento?.es_demo ? <Etiqueta tono="aviso">Cuestionario de demostración</Etiqueta> : null}
          {!esEvaluacion ? <Etiqueta>Seguimiento</Etiqueta> : null}
        </p>
      </header>

      <Formulario accion={enviarRespuesta} className="gap-6">
        <input type="hidden" name="acceso" value={acceso.data} />
        <CuestionarioPorPasos
          items={items}
          dimensiones={dimensiones}
          estructuraFpsico={Boolean(instrumento?.estructura_fpsico)}
          minutos={instrumento?.minutos ?? null}
          avisoAnonimato={<GarantiasAnonimato esEvaluacion={esEvaluacion} minimo={campana?.minimo_grupo ?? 5} />}
        />
      </Formulario>
      {instrumento?.origen === "insst_fpsico" ? <p className="text-sm text-tinta-suave">{ORIGEN_INSST}</p> : null}
    </>
  );
}

export default function PaginaCuestionario({ params }: { params: Promise<{ acceso: string }> }) {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <EnlaceInicio className="self-start rounded-md">
        <Logotipo alto={26} decorativo />
      </EnlaceInicio>
      <Suspense fallback={<Cargando texto="Cargando el cuestionario…" />}>
        <Contenido params={params} />
      </Suspense>
    </main>
  );
}
