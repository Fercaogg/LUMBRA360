"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

// Demostración interactiva de la portada. Todo lo que muestra es un EJEMPLO FICTICIO.
// No hay cifras reales, ni clientes, ni preguntas de ningún instrumento.

const PASOS = [
  { id: "responder", titulo: "Responder", resumen: "La plantilla responde sin cuenta" },
  { id: "anonimato", titulo: "Anonimato", resumen: "Nadie ve grupos pequeños" },
  { id: "evidencias", titulo: "Evidencias", resumen: "Cada paso queda fechado" },
  { id: "dossier", titulo: "Dossier", resumen: "Todo en un único PDF" },
] as const;

type Paso = (typeof PASOS)[number]["id"];

export function Demostracion() {
  const [actual, setActual] = useState<Paso>("responder");
  const base = useId();
  const pestanas = useRef<(HTMLButtonElement | null)[]>([]);

  function teclado(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const ir = (i: number) => {
      const destino = (i + PASOS.length) % PASOS.length;
      setActual(PASOS[destino].id);
      pestanas.current[destino]?.focus();
    };
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") {
      evento.preventDefault();
      ir(indice + 1);
    } else if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") {
      evento.preventDefault();
      ir(indice - 1);
    } else if (evento.key === "Home") {
      evento.preventDefault();
      ir(0);
    } else if (evento.key === "End") {
      evento.preventDefault();
      ir(PASOS.length - 1);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-linea bg-superficie shadow-[0_1px_0_rgba(23,33,30,0.04),0_24px_48px_-24px_rgba(23,33,30,0.18)]">
      <div className="flex items-center justify-between gap-3 border-b border-linea bg-papel/70 px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2 text-sm font-medium text-tinta-suave">
          <span aria-hidden className="size-2 rounded-full bg-acento" />
          Empresa de ejemplo
        </span>
        <span className="rounded-full border border-aviso/25 bg-aviso-tenue px-2.5 py-0.5 text-xs font-medium text-aviso">Ejemplo ficticio</span>
      </div>

      <div className="grid lg:grid-cols-[16rem_1fr]">
        <div role="tablist" aria-label="Pasos de la demostración" aria-orientation="vertical" className="grid grid-cols-2 gap-px border-b border-linea bg-linea lg:grid-cols-1 lg:content-start lg:gap-0 lg:border-b-0 lg:border-r lg:bg-papel/60">
          {PASOS.map((paso, i) => {
            const activo = paso.id === actual;
            return (
              <button
                key={paso.id}
                ref={(el) => {
                  pestanas.current[i] = el;
                }}
                role="tab"
                id={`${base}-tab-${paso.id}`}
                aria-selected={activo}
                aria-controls={`${base}-panel-${paso.id}`}
                tabIndex={activo ? 0 : -1}
                onClick={() => setActual(paso.id)}
                onKeyDown={(e) => teclado(e, i)}
                className={`flex min-h-16 flex-col items-start justify-center gap-0.5 px-4 py-3 text-left transition-colors duration-200 ease-salida sm:px-5 lg:border-b lg:border-linea ${
                  activo ? "bg-superficie" : "bg-papel/60 hover:bg-superficie"
                }`}
              >
                <span className={`flex items-center gap-2 text-sm font-semibold ${activo ? "text-acento" : "text-tinta"}`}>
                  <span className="font-mono text-xs text-tinta-suave">0{i + 1}</span>
                  {paso.titulo}
                </span>
                <span className="text-xs text-tinta-suave">{paso.resumen}</span>
              </button>
            );
          })}
        </div>

        {PASOS.map((paso) => (
          <div
            key={paso.id}
            role="tabpanel"
            id={`${base}-panel-${paso.id}`}
            aria-labelledby={`${base}-tab-${paso.id}`}
            hidden={paso.id !== actual}
            tabIndex={0}
            className="min-h-[26rem] p-5 sm:p-8"
          >
            {paso.id === "responder" ? <PanelResponder /> : null}
            {paso.id === "anonimato" ? <PanelAnonimato /> : null}
            {paso.id === "evidencias" ? <PanelEvidencias /> : null}
            {paso.id === "dossier" ? <PanelDossier /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelResponder() {
  const [elegida, setElegida] = useState<number | null>(null);
  const [enviado, setEnviado] = useState(false);
  const opciones = ["Opción de ejemplo 1", "Opción de ejemplo 2", "Opción de ejemplo 3", "Opción de ejemplo 4"];
  return (
    <div className="aparecer grid items-start gap-8 md:grid-cols-[1fr_15rem]">
      <div className="flex flex-col gap-3">
        <h3 className="font-serif text-2xl leading-tight">Se entra con un código. Sin nombre, sin correo.</h3>
        <ul className="flex flex-col gap-2 text-pretty text-tinta-suave">
          <li>La persona recibe un código de un solo uso, repartido al azar.</li>
          <li>Junto a la respuesta no se guarda IP ni hora. Solo el día.</li>
          <li>Nadie, tampoco la empresa, puede leer respuestas individuales.</li>
        </ul>
      </div>
      <div className="mx-auto w-full max-w-60 rounded-[2rem] border border-linea bg-papel p-2.5 shadow-sm">
        <div className="flex flex-col gap-3 rounded-[1.6rem] bg-superficie p-4">
          <p className="text-xs font-medium text-tinta-suave">Pregunta 1 de 4</p>
          <p className="text-sm font-medium">Enunciado de ejemplo. No es una pregunta real.</p>
          <fieldset className="flex flex-col gap-1">
            <legend className="sr-only">Opciones de ejemplo</legend>
            {opciones.map((texto, i) => (
              <label key={texto} className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-xs transition-colors duration-150 ${elegida === i ? "border-acento bg-acento-tenue" : "border-linea"}`}>
                <input type="radio" name="demo-respuesta" className="size-4 accent-acento" checked={elegida === i} onChange={() => { setElegida(i); setEnviado(false); }} />
                {texto}
              </label>
            ))}
          </fieldset>
          <button
            type="button"
            disabled={elegida === null}
            onClick={() => setEnviado(true)}
            className="min-h-10 rounded-lg bg-acento text-xs font-medium text-white transition-[opacity,transform] duration-150 active:scale-[0.98] disabled:opacity-50"
          >
            Enviar
          </button>
          <p role="status" className="min-h-4 text-center text-xs text-acento-fuerte">
            {enviado ? "Guardada sin datos que identifiquen a nadie." : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

const MINIMO = 5;

function PanelAnonimato() {
  const [pequeno, setPequeno] = useState(3);
  const grupos = [
    { nombre: "Área de ejemplo A", n: 9 },
    { nombre: "Área de ejemplo B", n: 6 },
    { nombre: "Área de ejemplo C", n: pequeno },
  ];
  // Misma regla que la base de datos: si lo oculto suma entre 1 y 4, también se oculta
  // el grupo visible más pequeño, para que nadie lo deduzca restando del total.
  const ocultoPorTamano = grupos.filter((g) => g.n < MINIMO).reduce((a, g) => a + g.n, 0);
  const visibles = grupos.filter((g) => g.n >= MINIMO).sort((a, b) => a.n - b.n);
  const sacrificado = ocultoPorTamano > 0 && ocultoPorTamano < MINIMO ? visibles[0]?.nombre : undefined;
  const maximo = 12;
  const idDeslizador = useId();

  return (
    <div className="aparecer flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-2xl leading-tight">Ningún resultado con menos de 5 respuestas.</h3>
        <p className="max-w-prose text-pretty text-tinta-suave">
          Mueva el control. Cuando un grupo baja de 5, se protege. Y si con el total se pudiera deducir, se protege también el siguiente más pequeño.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={idDeslizador} className="text-sm font-medium">
          Respuestas en el área de ejemplo C: <span className="tabular-nums">{pequeno}</span>
        </label>
        <input id={idDeslizador} type="range" min={0} max={maximo} value={pequeno} onChange={(e) => setPequeno(Number(e.target.value))} className="w-full accent-acento" />
      </div>
      <ul className="flex flex-col gap-3">
        {grupos.map((g) => {
          const protegido = g.n < MINIMO || g.nombre === sacrificado;
          return (
            <li key={g.nombre} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>{g.nombre}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${protegido ? "bg-aviso-tenue text-aviso" : "bg-acento-tenue text-acento-fuerte"}`}>
                  {protegido ? (g.n < MINIMO ? "Protegido: menos de 5" : "Protegido: evitaría la resta") : "Visible"}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-[4px] bg-papel">
                <div
                  className={`h-full rounded-[4px] transition-[width,background-color] duration-300 ease-salida ${protegido ? "bg-[repeating-linear-gradient(45deg,var(--color-linea)_0_6px,transparent_6px_12px)]" : "bg-acento"}`}
                  style={{ width: `${Math.max(4, (g.n / maximo) * 100)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PanelEvidencias() {
  const entradas = [
    { fecha: "Día 1", texto: "Campaña de evaluación abierta", autor: "Dirección (ejemplo)" },
    { fecha: "Día 15", texto: "Campaña cerrada con su participación", autor: "Dirección (ejemplo)" },
    { fecha: "Día 22", texto: "Informe registrado y firmado", autor: "Técnico de prevención (ejemplo)" },
    { fecha: "Día 30", texto: "Medida del plan de acción en curso", autor: "RR. HH. (ejemplo)" },
    { fecha: "Día 41", texto: "Política de desconexión aprobada", autor: "Dirección (ejemplo)" },
  ];
  return (
    <div className="aparecer flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-2xl leading-tight">Una línea de tiempo que no se puede reescribir.</h3>
        <p className="max-w-prose text-pretty text-tinta-suave">Cada paso queda con fecha y autor. No se borra nada: las correcciones se añaden como anotaciones.</p>
      </div>
      <ol className="relative flex flex-col gap-5 border-l border-linea pl-6">
        {entradas.map((e) => (
          <li key={e.texto} className="relative">
            <span aria-hidden className="absolute -left-[1.86rem] top-1.5 size-3 rounded-full border-2 border-superficie bg-acento" />
            <p className="font-medium">{e.texto}</p>
            <p className="text-sm text-tinta-suave">
              {e.fecha} · {e.autor}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PanelDossier() {
  const indice = ["Portada y fecha de generación", "Evaluación psicosocial", "Informe y observaciones", "Plan de acción e historial", "Política de desconexión digital", "Audiencia, acuses y formación"];
  return (
    <div className="aparecer grid items-center gap-8 md:grid-cols-[1fr_14rem]">
      <div className="flex flex-col gap-3">
        <h3 className="font-serif text-2xl leading-tight">El dossier de evidencias, en un único PDF.</h3>
        <p className="max-w-prose text-pretty text-tinta-suave">
          Portada, índice y contenido ordenado, con la fecha de generación. Preparado por si llega un requerimiento de la Inspección de Trabajo.
        </p>
      </div>
      <div className="relative mx-auto w-full max-w-56">
        <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 rounded-lg border border-linea bg-papel" />
        <div className="relative flex aspect-[1/1.41] flex-col gap-3 rounded-lg border border-linea bg-superficie p-5 shadow-sm">
          <p className="text-[0.6rem] font-semibold tracking-[0.2em] text-acento">DOSSIER DE EVIDENCIAS</p>
          <p className="font-serif text-lg leading-tight">Empresa de ejemplo</p>
          <div className="h-px bg-linea" />
          <ol className="flex flex-col gap-1.5 text-[0.65rem] text-tinta-suave">
            {indice.map((linea, i) => (
              <li key={linea} className="flex gap-2">
                <span className="font-mono">{i + 1}.</span>
                {linea}
              </li>
            ))}
          </ol>
          <p className="mt-auto text-[0.6rem] text-tinta-suave">Ejemplo ficticio</p>
        </div>
      </div>
    </div>
  );
}
