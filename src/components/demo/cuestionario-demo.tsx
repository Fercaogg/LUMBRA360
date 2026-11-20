"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Eye, KeyRound, ListChecks } from "lucide-react";
import { clasesBoton } from "@/components/ui/boton";
import { Etiqueta } from "@/components/ui/piezas";

// Recorrido de una persona de la plantilla, igual que el real, pero sin enviar nada al servidor.

export type DatosCuestionarioDemo = {
  empresa: string;
  nombre: string;
  minutos: number | null;
  items: { id: string; enunciado: string; opciones: { valor: number; etiqueta: string }[] }[];
  dimensiones: { id: string; nombre: string; grupos: { id: string; nombre: string }[] }[];
};

type Paso = "codigo" | "preguntas" | "enviado";
const PASOS: { id: Paso; texto: string; icono: typeof KeyRound }[] = [
  { id: "codigo", texto: "Código", icono: KeyRound },
  { id: "preguntas", texto: "Preguntas", icono: ListChecks },
  { id: "enviado", texto: "Enviado", icono: Check },
];
const CODIGO_DEMO = "DEMO-7K2Q";

export function CuestionarioDemo({ datos }: { datos: DatosCuestionarioDemo }) {
  const [paso, setPaso] = useState<Paso>("codigo");
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [faltan, setFaltan] = useState(false);
  const inicio = useRef<HTMLDivElement>(null);
  const primeraVez = useRef(true);

  // Al cambiar de paso, se vuelve arriba y el foco va al nuevo título.
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    inicio.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    inicio.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  }, [paso]);

  const respondidas = Object.keys(respuestas).length;
  const total = datos.items.length;
  const indice = PASOS.findIndex((p) => p.id === paso);
  const conGrupos = datos.dimensiones.filter((d) => d.grupos.length > 0);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (respondidas < total) {
      setFaltan(true);
      return;
    }
    setPaso("enviado");
  };

  return (
    <div ref={inicio} className="flex scroll-mt-6 flex-col gap-6">
      <p className="flex items-start gap-2.5 rounded-xl border border-[var(--lumbre-200)] bg-[var(--lumbre-50)] px-4 py-3 text-sm text-[var(--lumbre-800)]">
        <Eye aria-hidden size={18} className="mt-0.5 shrink-0" />
        <span>
          <strong className="font-semibold">Demostración.</strong> Así lo ve una persona de la plantilla. Los textos son ficticios y no se guarda nada.
        </span>
      </p>

      <ol aria-label="Pasos" className="grid grid-cols-3 gap-2">
        {PASOS.map((p, i) => {
          const I = p.icono;
          const hecho = i < indice;
          const actual = i === indice;
          return (
            <li key={p.id} aria-current={actual ? "step" : undefined} className="flex flex-col gap-2">
              <span className={`h-1 rounded-full ${hecho || actual ? "bg-lumbre" : "bg-linea"}`} />
              <span className={`flex items-center gap-1.5 text-xs font-medium ${actual ? "text-tinta" : "text-tinta-suave"}`}>
                <I aria-hidden size={14} strokeWidth={2} />
                {p.texto}
              </span>
            </li>
          );
        })}
      </ol>

      {paso === "codigo" ? (
        <section className="aparecer flex flex-col gap-5 rounded-[20px] border border-linea bg-superficie p-5 sm:p-7">
          <div className="flex flex-col gap-1">
            <h1 tabIndex={-1} className="text-2xl font-medium leading-tight tracking-[-0.02em] outline-none">
              Responder el cuestionario
            </h1>
            <p className="text-pretty text-tinta-suave">Escriba el código que le ha dado su empresa. No necesita cuenta.</p>
          </div>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setPaso("preguntas");
            }}
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Código</span>
              <input
                readOnly
                value={CODIGO_DEMO}
                aria-describedby="codigo-ayuda"
                className="min-h-11 w-full rounded-xl border border-control bg-papel px-3.5 font-mono text-base tracking-[0.08em] text-tinta"
              />
              <span id="codigo-ayuda" className="text-sm text-tinta-suave">
                En la demostración ya está escrito. Cada persona recibe uno distinto, en papel o por enlace.
              </span>
            </label>
            <button type="submit" className={clasesBoton("principal", "w-full sm:w-auto sm:self-start")}>
              Continuar
            </button>
          </form>
          <p className="text-pretty text-sm text-tinta-suave">Es voluntario y anónimo. No se pide su nombre ni su correo.</p>
        </section>
      ) : null}

      {paso === "preguntas" ? (
        <div className="aparecer flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <p className="text-sm text-tinta-suave">{datos.empresa}</p>
            <h1 tabIndex={-1} className="text-balance text-2xl font-medium leading-tight tracking-[-0.02em] outline-none sm:text-3xl">
              {datos.nombre}
            </h1>
            <p className="flex flex-wrap items-center gap-2 text-sm text-tinta-suave">
              <span>{total} preguntas</span>
              {datos.minutos ? <span>· unos {datos.minutos} minutos</span> : null}
              <Etiqueta tono="aviso">Cuestionario de demostración</Etiqueta>
            </p>
          </header>

          <section aria-labelledby="titulo-anonimato" className="flex flex-col gap-2 rounded-xl border border-acento/20 bg-acento-tenue p-4 text-acento-fuerte">
            <h2 id="titulo-anonimato" className="font-semibold">Es voluntario y anónimo</h2>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
              <li>No pedimos su nombre ni su correo.</li>
              <li>Junto a su respuesta no se guarda su dirección IP ni la hora. Solo el día.</li>
              <li>
                Su empresa nunca ve respuestas individuales. El técnico de prevención trata las respuestas, sin ningún dato que le identifique, y solo comunica
                resultados de conjunto.
              </li>
            </ul>
          </section>

          <form onSubmit={enviar} noValidate className="flex flex-col gap-6">
            {conGrupos.map((dimension) => (
              <fieldset key={dimension.id} className="flex flex-col gap-2 rounded-xl border border-linea bg-superficie p-4">
                <legend className="px-1 font-medium">{dimension.nombre} (opcional)</legend>
                <p className="text-sm text-tinta-suave">Sirve para ver resultados por grupo. Puede dejarlo sin indicar.</p>
                <div className="flex flex-col">
                  <label className="flex min-h-11 items-center gap-3">
                    <input type="radio" name={`dim_${dimension.id}`} value="" defaultChecked className="size-5 accent-acento" />
                    <span>Prefiero no indicarlo</span>
                  </label>
                  {dimension.grupos.map((grupo) => (
                    <label key={grupo.id} className="flex min-h-11 items-center gap-3">
                      <input type="radio" name={`dim_${dimension.id}`} value={grupo.id} className="size-5 accent-acento" />
                      <span>{grupo.nombre}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <ol className="flex flex-col gap-4">
              {datos.items.map((item, i) => {
                const sinResponder = faltan && respuestas[item.id] === undefined;
                return (
                  <li key={item.id}>
                    <fieldset
                      aria-invalid={sinResponder || undefined}
                      className={`flex flex-col gap-2 rounded-xl border bg-superficie p-4 transition-colors ${sinResponder ? "border-error" : respuestas[item.id] !== undefined ? "border-[var(--lumbre-200)]" : "border-linea"}`}
                    >
                      <legend className="px-1 font-medium">
                        <span className="text-tinta-suave">{i + 1}. </span>
                        {item.enunciado}
                      </legend>
                      <div className="flex flex-col">
                        {item.opciones.map((opcion) => (
                          <label key={opcion.valor} className="flex min-h-11 items-center gap-3">
                            <input
                              type="radio"
                              name={`item_${item.id}`}
                              value={opcion.valor}
                              checked={respuestas[item.id] === opcion.valor}
                              onChange={() => setRespuestas((r) => ({ ...r, [item.id]: opcion.valor }))}
                              className="size-5 accent-acento"
                            />
                            <span>{opcion.etiqueta}</span>
                          </label>
                        ))}
                      </div>
                      {sinResponder ? <p className="text-sm text-error">Falta esta respuesta.</p> : null}
                    </fieldset>
                  </li>
                );
              })}
            </ol>

            <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-linea bg-superficie/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium tabular-nums" aria-live="polite">
                  {respondidas} de {total} respondidas
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-linea" aria-hidden>
                  <span className="block h-full rounded-full bg-lumbre transition-[width] duration-300" style={{ width: `${(respondidas / total) * 100}%` }} />
                </span>
              </div>
              {faltan && respondidas < total ? (
                <p role="alert" className="text-sm text-error">
                  Faltan preguntas por responder.
                </p>
              ) : null}
              <button type="submit" className={clasesBoton("principal", "w-full")}>
                Enviar respuestas
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {paso === "enviado" ? (
        <section className="aparecer flex flex-col gap-5 rounded-[20px] border border-linea bg-superficie p-5 sm:p-7">
          <span aria-hidden className="grid size-12 place-items-center rounded-full bg-lumbre text-[var(--tinta-950)]">
            <Check size={24} strokeWidth={2.5} />
          </span>
          <div className="flex flex-col gap-2">
            <h1 tabIndex={-1} className="text-2xl font-medium leading-tight tracking-[-0.02em] outline-none sm:text-3xl">
              Gracias. Su respuesta se ha guardado.
            </h1>
            <p className="text-pretty text-tinta-suave">
              Se ha guardado sin su nombre ni su correo. Su empresa solo verá resultados agrupados. Ya puede cerrar esta página.
            </p>
          </div>
          <p className="rounded-xl bg-papel p-4 text-sm text-tinta-suave">
            Esto es lo que ve la persona al terminar. En la demostración no se ha guardado nada.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Enlace normal, sin precarga: /demo/panel abre una sesión al visitarlo. */}
            <a href="/demo/panel" className={clasesBoton("principal")}>
              Ver los resultados en el panel
            </a>
            <button
              type="button"
              className={clasesBoton("secundario")}
              onClick={() => {
                setRespuestas({});
                setFaltan(false);
                setPaso("codigo");
              }}
            >
              Volver a empezar
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
