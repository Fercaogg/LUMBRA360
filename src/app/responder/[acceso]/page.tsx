import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { NOMBRE } from "@/config/marca";
import { EnlaceBoton } from "@/components/ui/boton";
import { Enviar, Formulario } from "@/components/ui/formulario";
import { Cargando, Etiqueta } from "@/components/ui/piezas";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { esquemaAccesoRespuesta } from "@/lib/validacion";
import { enviarRespuesta } from "../acciones";

export const metadata: Metadata = { title: "Cuestionario", referrer: "no-referrer" };

type Cuestionario = {
  estado: string;
  campana?: { nombre: string; tipo: "evaluacion" | "pulso"; minimo_grupo: number };
  empresa?: string;
  instrumento?: { nombre: string; descripcion: string | null; minutos: number | null; es_demo: boolean };
  items?: { id: string; enunciado: string; opciones: { valor: number; etiqueta: string }[] }[];
  dimensiones?: { id: string; nombre: string; grupos: { id: string; nombre: string }[] | null }[];
};

const AVISOS: Record<string, { titulo: string; texto: string }> = {
  no_valido: { titulo: "Este código o enlace no es válido", texto: "Revisa que lo has escrito bien, o pide uno nuevo a tu empresa." },
  usado: { titulo: "Este código ya se ha usado", texto: "Cada código sirve una sola vez. Si no has respondido tú, pide otro a tu empresa." },
  cerrada: { titulo: "Esta campaña ya se ha cerrado", texto: "Ya no admite respuestas." },
  no_abierta: { titulo: "Esta campaña todavía no se ha abierto", texto: "Vuelve a probar cuando tu empresa te avise." },
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
        <h1 className="text-2xl font-semibold tracking-tight">{aviso.titulo}</h1>
        <p className="text-pretty text-tinta-suave">{aviso.texto}</p>
        <EnlaceBoton variante="secundario" href="/responder">
          Escribir otro código
        </EnlaceBoton>
      </div>
    );
  }

  const { campana, empresa, instrumento, items = [], dimensiones = [] } = cuestionario;
  const conGrupos = dimensiones.filter((d) => d.grupos && d.grupos.length > 0);

  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-sm text-tinta-suave">{empresa}</p>
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{campana?.nombre}</h1>
        <p className="flex flex-wrap items-center gap-2 text-sm text-tinta-suave">
          <span>{items.length} preguntas</span>
          {instrumento?.minutos ? <span>· unos {instrumento.minutos} minutos</span> : null}
          {instrumento?.es_demo ? <Etiqueta tono="aviso">Cuestionario de demostración</Etiqueta> : null}
        </p>
      </header>

      <section aria-labelledby="titulo-anonimato" className="flex flex-col gap-2 rounded-xl border border-acento/20 bg-acento-tenue p-4 text-acento-fuerte">
        <h2 id="titulo-anonimato" className="font-semibold">Es voluntario y anónimo</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
          <li>No pedimos tu nombre ni tu correo.</li>
          <li>Junto a tu respuesta no se guarda tu dirección IP ni la hora. Solo el día.</li>
          <li>Tu empresa nunca ve respuestas individuales. Solo resultados de grupos de {campana?.minimo_grupo} personas o más.</li>
        </ul>
      </section>

      <Formulario accion={enviarRespuesta} className="gap-6">
        <input type="hidden" name="acceso" value={acceso.data} />

        {conGrupos.map((dimension) => (
          <fieldset key={dimension.id} className="flex flex-col gap-2 rounded-xl border border-linea bg-superficie p-4">
            <legend className="px-1 font-medium">{dimension.nombre} (opcional)</legend>
            <p className="text-sm text-tinta-suave">Sirve para ver resultados por grupo. Puedes dejarlo sin indicar.</p>
            <div className="flex flex-col">
              <label className="flex min-h-11 items-center gap-3">
                <input type="radio" name={`dim_${dimension.id}`} value="" defaultChecked className="size-5 accent-acento" />
                <span>Prefiero no indicarlo</span>
              </label>
              {dimension.grupos!.map((grupo) => (
                <label key={grupo.id} className="flex min-h-11 items-center gap-3">
                  <input type="radio" name={`dim_${dimension.id}`} value={grupo.id} className="size-5 accent-acento" />
                  <span>{grupo.nombre}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <ol className="flex flex-col gap-4">
          {items.map((item, indice) => (
            <li key={item.id}>
              <fieldset className="flex flex-col gap-2 rounded-xl border border-linea bg-superficie p-4">
                <legend className="px-1 font-medium">
                  <span className="text-tinta-suave">{indice + 1}. </span>
                  {item.enunciado}
                </legend>
                <div className="flex flex-col">
                  {item.opciones.map((opcion) => (
                    <label key={opcion.valor} className="flex min-h-11 items-center gap-3">
                      <input type="radio" name={`item_${item.id}`} value={opcion.valor} required className="size-5 accent-acento" />
                      <span>{opcion.etiqueta}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>

        <Enviar>Enviar respuestas</Enviar>
      </Formulario>
    </>
  );
}

export default function PaginaCuestionario({ params }: { params: Promise<{ acceso: string }> }) {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <p className="text-sm font-semibold tracking-wide text-acento">{NOMBRE}</p>
      <Suspense fallback={<Cargando texto="Cargando el cuestionario…" />}>
        <Contenido params={params} />
      </Suspense>
    </main>
  );
}
