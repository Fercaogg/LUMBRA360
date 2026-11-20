import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Paso = { titulo: string; texto: string; href: string; accion: string };

// Recorrido guiado de la demostración. El cuestionario va primero: es la pieza que
// sostiene todo lo demás (evaluación, exportación a FPSICO, informe y plan).
export function RecorridoDemo({
  base,
  evaluacionId,
  seguimientoId,
}: {
  base: string;
  evaluacionId: string | null;
  seguimientoId: string | null;
}) {
  const evaluacion = evaluacionId ? `${base}/campanas/${evaluacionId}` : `${base}/campanas`;
  const pasos: Paso[] = [
    {
      titulo: "Así responde la plantilla",
      texto:
        "El cuestionario tal como lo ve cada persona: sin cuenta, con un código de un solo uso, por páginas y con barra de progreso. La evaluación de la demo tiene la estructura de FPSICO 4.1: 44 preguntas y 89 ítems, con textos ficticios.",
      href: evaluacionId ? `${evaluacion}/vista-previa` : evaluacion,
      accion: "Ver el cuestionario",
    },
    {
      titulo: "Cómo se blinda",
      texto:
        "Una persona, una respuesta. Estructura FPSICO comprobada antes de publicar. Respuestas que nadie puede cambiar ni borrar. Sin IP, hora ni identidad. Lo impone la base de datos, no la pantalla.",
      href: `${evaluacion}#t-blindaje`,
      accion: "Ver las garantías",
    },
    {
      titulo: "De las respuestas a FPSICO",
      texto:
        "La plataforma no puntúa la evaluación. El técnico de prevención exporta el .txt en el formato del Anexo II del manual de FPSICO 4.1, lo trata en la aplicación del INSST y sube aquí el informe firmado.",
      href: `${evaluacion}#t-informe`,
      accion: "Ver exportación e informe",
    },
    {
      titulo: "Resultados de un seguimiento",
      texto: "Los seguimientos sí se puntúan aquí, siempre por grupos de 5 o más. Un grupo pequeño aparece protegido, también al filtrar.",
      href: seguimientoId ? `${base}/campanas/${seguimientoId}` : `${base}/campanas`,
      accion: "Ver resultados",
    },
    {
      titulo: "Plan de acción y desconexión",
      texto: "Las medidas que salen de los resultados, con responsable, fecha e historial, y la política de desconexión digital con sus acuses.",
      href: `${base}/plan`,
      accion: "Ver el plan",
    },
  ];

  return (
    <section aria-labelledby="t-recorrido" className="flex flex-col gap-5 rounded-[24px] bg-tinta p-6 text-[var(--texto-sobre-marca)] sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--lumbre-300)]">Recorrido de la demostración</p>
        <h2 id="t-recorrido" className="text-xl font-semibold">Empiece por el cuestionario: es la base de todo</h2>
        <p className="max-w-[65ch] text-pretty text-[var(--tinta-200)]">
          Cinco pasos, en este orden. Todo es de solo lectura y los datos son ficticios.
        </p>
      </div>
      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {pasos.map((paso, i) => (
          <li key={paso.titulo} className={i === 0 ? "md:col-span-2 xl:col-span-1" : ""}>
            <Link
              href={paso.href}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-white/15 p-5 transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <span className="flex items-center gap-3">
                <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${i === 0 ? "bg-lumbre text-[var(--tinta-950)]" : "bg-white/10"}`}>
                  {i + 1}
                </span>
                <span className="font-semibold">{paso.titulo}</span>
              </span>
              <span className="text-pretty text-sm text-[var(--tinta-200)]">{paso.texto}</span>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium">
                {paso.accion}
                <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
