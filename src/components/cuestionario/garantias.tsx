import { FileCheck2, KeyRound, ListChecks, Lock, ShieldCheck, Shuffle, type LucideIcon } from "lucide-react";

// Lo que ve la persona trabajadora antes de empezar.
export function GarantiasAnonimato({ esEvaluacion, minimo }: { esEvaluacion: boolean; minimo: number }) {
  return (
    <section aria-labelledby="titulo-anonimato" className="flex flex-col gap-2 rounded-xl border border-acento/20 bg-acento-tenue p-4 text-acento-fuerte">
      <h2 id="titulo-anonimato" className="font-semibold">Es voluntario y anónimo</h2>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
        <li>No pedimos su nombre ni su correo.</li>
        <li>Junto a su respuesta no se guarda su dirección IP ni la hora. Solo el día.</li>
        <li>Una vez enviada, su respuesta no la puede cambiar ni borrar nadie.</li>
        {esEvaluacion ? (
          <li>
            Su empresa nunca ve respuestas individuales. El técnico de prevención las trata en la aplicación FPSICO, sin ningún dato que le identifique,
            y solo comunica resultados de conjunto.
          </li>
        ) : (
          <li>Su empresa nunca ve respuestas individuales. Solo resultados de grupos de {minimo} personas o más.</li>
        )}
      </ul>
    </section>
  );
}

type Garantia = { icono: LucideIcon; titulo: string; texto: string };

// Explicación para el panel (y para quien recorre la demostración): qué protege
// cada paso del cuestionario y por qué. Todo lo que se afirma aquí lo impone la base de datos.
export function BlindajeCuestionario({
  esEvaluacion,
  estructuraFpsico,
  modoAcceso,
  minimo,
  plantilla,
}: {
  esEvaluacion: boolean;
  estructuraFpsico: boolean;
  modoAcceso: "codigos" | "enlace";
  minimo: number;
  plantilla: number | null;
}) {
  const garantias: Garantia[] = [
    modoAcceso === "codigos"
      ? {
          icono: KeyRound,
          titulo: "Una persona, una respuesta",
          texto:
            "Cada código sirve una sola vez y se marca como usado en el mismo instante en que se guarda la respuesta. Solo se guarda su huella, no el código, y no queda relación entre el código y lo respondido." +
            (esEvaluacion ? " Las evaluaciones solo admiten códigos: el enlace general no está permitido." : ""),
        }
      : {
          icono: KeyRound,
          titulo: "Enlace general con tope",
          texto: `El enlace admite como mucho ${plantilla ?? "tantas"} respuestas, las personas invitadas. Al llegar al tope, o al cerrar la campaña, deja de funcionar.`,
        },
    estructuraFpsico
      ? {
          icono: ListChecks,
          titulo: "Estructura FPSICO comprobada",
          texto:
            "Los 89 ítems de las 44 preguntas, numerados como en FPSICO (1, 2 … 10a … 44) y en su orden. Cada ítem solo admite sus valores: de 1 a 4, de 1 a 5 o de 1 a 3. Si falta uno o una escala no cuadra, el cuestionario no se puede publicar.",
        }
      : {
          icono: ListChecks,
          titulo: "Cuestionario completo y cerrado",
          texto: "Todas las preguntas son obligatorias y solo se aceptan las opciones de su escala. Un cuestionario publicado ya no se puede modificar.",
        },
    {
      icono: Lock,
      titulo: "Respuestas inalterables",
      texto:
        "Solo entran con la campaña abierta y con preguntas de su cuestionario. Ya guardadas, nadie las puede cambiar ni borrar, tampoco la administración de la plataforma.",
    },
    {
      icono: ShieldCheck,
      titulo: "Sin rastro de quién responde",
      texto: "Sin cuenta, nombre, correo, IP ni hora: solo el día. Ningún rol puede leer las respuestas una a una.",
    },
    esEvaluacion
      ? {
          icono: Shuffle,
          titulo: "Exportación para FPSICO",
          texto: `Solo el técnico de prevención asignado, con la campaña cerrada y al menos ${minimo} respuestas. Formato .txt del Anexo II del manual de FPSICO 4.1: 89 valores por línea, en orden aleatorio, sin fecha, grupo ni identificador. Antes de entregar el archivo se comprueba cada valor, posición a posición.`,
        }
      : {
          icono: Shuffle,
          titulo: "Resultados solo de grupo",
          texto: `Solo con la campaña cerrada y con ${minimo} respuestas o más, también al filtrar y al combinar filtros.`,
        },
    {
      icono: FileCheck2,
      titulo: "Todo queda registrado",
      texto: "Apertura, cierre, exportación e informe firmado quedan como evidencias con fecha, que no se pueden modificar.",
    },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {garantias.map(({ icono: Icono, titulo, texto }) => (
        <li key={titulo} className="flex gap-3">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-papel text-tinta">
            <Icono size={18} strokeWidth={1.75} />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="font-semibold">{titulo}</span>
            <span className="text-pretty text-sm text-tinta-suave">{texto}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
