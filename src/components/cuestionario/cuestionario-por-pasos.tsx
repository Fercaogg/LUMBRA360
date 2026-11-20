"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Enviar } from "@/components/ui/formulario";
import { clasesBoton } from "@/components/ui/boton";

// Cuestionario por pasos, con la misma pauta que FPSICO 4.1 (manual del INSST, apdo. C.2.1):
// pantalla de bienvenida con instrucciones, preguntas por páginas con «Atrás» y «Siguiente»,
// barra de progreso y aviso en rojo si se intenta avanzar con preguntas en blanco.
//
// Nada se guarda en el navegador (ni localStorage ni cookies): en un ordenador compartido,
// otra persona podría ver las respuestas. Si se cierra la página, se pierde lo respondido
// y el código sigue sin usar.

export type ItemCuestionario = {
  id: string;
  enunciado: string;
  codigo: string | null;
  pregunta: number | null;
  opciones: { valor: number; etiqueta: string }[];
};

export type DimensionCuestionario = { id: string; nombre: string; grupos: { id: string; nombre: string }[] | null };

type Pagina = { tipo: "grupos" } | { tipo: "items"; items: ItemCuestionario[]; desde: number };

const MAXIMO_POR_PAGINA = 9;

// Las preguntas múltiples de FPSICO (10a … 10h) no se parten entre páginas.
function repartir(items: ItemCuestionario[], estructuraFpsico: boolean): ItemCuestionario[][] {
  const bloques: ItemCuestionario[][] = [];
  if (estructuraFpsico) {
    for (const item of items) {
      const ultimo = bloques.at(-1);
      if (ultimo && ultimo[0].pregunta === item.pregunta && item.pregunta !== null) ultimo.push(item);
      else bloques.push([item]);
    }
  } else {
    for (const item of items) bloques.push([item]);
  }
  const paginas: ItemCuestionario[][] = [];
  for (const bloque of bloques) {
    const actual = paginas.at(-1);
    if (actual && actual.length + bloque.length <= MAXIMO_POR_PAGINA) actual.push(...bloque);
    else paginas.push([...bloque]);
  }
  return paginas;
}

function numero(item: ItemCuestionario, indice: number): string {
  if (!item.codigo) return String(indice + 1);
  return item.codigo.replace(/^(\d+)([a-h])$/, "$1 $2)");
}

// «Preguntas 10 a 12», o «Pregunta 10» si la página es una sola pregunta múltiple.
function rotulo(lista: ItemCuestionario[], desde: number): string {
  const primera = lista[0].pregunta ?? desde + 1;
  const ultima = lista.at(-1)!.pregunta ?? desde + lista.length;
  return primera === ultima ? `Pregunta ${primera}` : `Preguntas ${primera} a ${ultima}`;
}

export function CuestionarioPorPasos({
  items,
  dimensiones,
  estructuraFpsico,
  minutos,
  avisoAnonimato,
  vistaPrevia = false,
}: {
  items: ItemCuestionario[];
  dimensiones: DimensionCuestionario[];
  estructuraFpsico: boolean;
  minutos: number | null;
  avisoAnonimato: ReactNode;
  vistaPrevia?: boolean;
}) {
  const conGrupos = dimensiones.filter((d) => d.grupos && d.grupos.length > 0);
  const paginas = useMemo<Pagina[]>(() => {
    const lista: Pagina[] = conGrupos.length > 0 ? [{ tipo: "grupos" }] : [];
    let desde = 0;
    for (const grupo of repartir(items, estructuraFpsico)) {
      lista.push({ tipo: "items", items: grupo, desde });
      desde += grupo.length;
    }
    return lista;
  }, [items, estructuraFpsico, conGrupos.length]);

  // -1 es la bienvenida.
  const [paso, setPaso] = useState(-1);
  const [respondidas, setRespondidas] = useState<Record<string, true>>({});
  const [faltan, setFaltan] = useState<string[]>([]);
  const titulo = useRef<HTMLHeadingElement>(null);
  const aviso = useRef<HTMLDivElement>(null);
  const total = items.length;
  const hechas = Object.keys(respondidas).length;
  const ultima = paso === paginas.length - 1;

  // Aviso al salir con respuestas a medias: no se guardan en ningún sitio.
  useEffect(() => {
    if (vistaPrevia || hechas === 0) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [hechas, vistaPrevia]);

  useEffect(() => {
    if (paso >= 0) titulo.current?.focus({ preventScroll: false });
  }, [paso]);

  useEffect(() => {
    if (faltan.length > 0) aviso.current?.focus();
  }, [faltan]);

  function sinResponder(hasta: number): string[] {
    const ids: string[] = [];
    for (const pagina of paginas.slice(0, hasta + 1)) {
      if (pagina.tipo === "items") for (const item of pagina.items) if (!respondidas[item.id]) ids.push(item.id);
    }
    return ids;
  }

  function ir(destino: number) {
    setFaltan([]);
    setPaso(destino);
    window.scrollTo({ top: 0 });
  }

  function siguiente() {
    const pagina = paginas[paso];
    const pendientes = pagina.tipo === "items" ? pagina.items.filter((i) => !respondidas[i.id]).map((i) => i.id) : [];
    if (pendientes.length > 0) {
      setFaltan(pendientes);
      return;
    }
    ir(paso + 1);
  }

  const numeroDe = (id: string) => {
    const indice = items.findIndex((i) => i.id === id);
    return indice >= 0 ? numero(items[indice], indice) : "";
  };

  return (
    <div
      className="flex flex-col gap-6"
      onChange={(e) => {
        const objetivo = e.target as HTMLInputElement;
        if (objetivo.type === "radio" && objetivo.name.startsWith("item_")) {
          const id = objetivo.name.slice(5);
          setRespondidas((previas) => (previas[id] ? previas : { ...previas, [id]: true }));
          setFaltan((previas) => previas.filter((x) => x !== id));
        }
      }}
    >
      {/* Bienvenida */}
      <section hidden={paso !== -1} aria-labelledby="t-bienvenida" className="flex flex-col gap-5">
        <h2 id="t-bienvenida" className="font-serif text-xl font-medium">Antes de empezar</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-pretty">
          <li>
            {estructuraFpsico ? `Son ${new Set(items.map((i) => i.pregunta)).size} preguntas, algunas con varios apartados (${total} respuestas en total)` : `Son ${total} preguntas`}
            {minutos ? `, unos ${minutos} minutos` : ""}. Responda pensando en su trabajo habitual. No hay respuestas buenas ni malas.
          </li>
          <li>Todas las preguntas son obligatorias. No podrá pasar de página con preguntas en blanco.</li>
          <li>Puede volver atrás y cambiar cualquier respuesta hasta que pulse «Enviar respuestas».</li>
          <li>
            Nada se guarda hasta el final, ni siquiera en este dispositivo. Si cierra la página, lo respondido se pierde
            {vistaPrevia ? "." : " y su código sigue sin usar."}
          </li>
        </ul>
        {avisoAnonimato}
        <button type="button" onClick={() => ir(0)} className={clasesBoton("principal", "self-start")}>
          Empezar <ArrowRight size={16} aria-hidden />
        </button>
      </section>

      {/* Progreso */}
      {paso >= 0 ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3 text-sm text-tinta-suave">
            <span>
              Página {paso + 1} de {paginas.length}
            </span>
            <span className="tabular-nums">
              {hechas} de {total} respondidas
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Preguntas respondidas"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={hechas}
            className="h-2 overflow-hidden rounded-full bg-linea"
          >
            <div className="h-full rounded-full bg-acento transition-[width] duration-300" style={{ width: `${total ? (hechas / total) * 100 : 0}%` }} />
          </div>
        </div>
      ) : null}

      {/* Páginas: todas en el mismo formulario; solo se ve la actual. */}
      {paginas.map((pagina, indicePagina) => (
        <section
          key={indicePagina}
          hidden={paso !== indicePagina}
          aria-labelledby={`t-pagina-${indicePagina}`}
          className="flex flex-col gap-4"
        >
          <h2 id={`t-pagina-${indicePagina}`} ref={paso === indicePagina ? titulo : undefined} tabIndex={-1} className="font-serif text-xl font-medium outline-none">
            {pagina.tipo === "grupos"
              ? "Datos de grupo (opcionales)"
              : rotulo(pagina.items, pagina.desde)}
          </h2>

          {pagina.tipo === "grupos"
            ? conGrupos.map((dimension) => (
                <fieldset key={dimension.id} className="flex flex-col gap-2 rounded-xl border border-linea bg-superficie p-4">
                  <legend className="px-1 font-medium">{dimension.nombre} (opcional)</legend>
                  <p className="text-sm text-tinta-suave">
                    Sirve para ver resultados por grupo, y solo si el grupo reúne el mínimo de respuestas. Puede dejarlo sin indicar.
                  </p>
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
              ))
            : (
                <ol className="flex flex-col gap-4">
                  {pagina.items.map((item, i) => {
                    const pendiente = faltan.includes(item.id);
                    return (
                      <li key={item.id}>
                        <fieldset
                          aria-invalid={pendiente || undefined}
                          className={`flex flex-col gap-2 rounded-xl border bg-superficie p-4 ${pendiente ? "border-error ring-1 ring-error" : "border-linea"}`}
                        >
                          <legend className="px-1 font-medium">
                            <span className="text-tinta-suave">{numero(item, pagina.desde + i)}. </span>
                            {item.enunciado}
                          </legend>
                          <div className="flex flex-col">
                            {item.opciones.map((opcion) => (
                              <label key={opcion.valor} className="flex min-h-11 items-center gap-3">
                                <input type="radio" name={`item_${item.id}`} value={opcion.valor} className="size-5 accent-acento" />
                                <span>{opcion.etiqueta}</span>
                              </label>
                            ))}
                          </div>
                          {pendiente ? <p className="text-sm font-medium text-error">Falta esta respuesta.</p> : null}
                        </fieldset>
                      </li>
                    );
                  })}
                </ol>
              )}
        </section>
      ))}

      {faltan.length > 0 ? (
        <div ref={aviso} tabIndex={-1} role="alert" className="aparecer rounded-xl border border-[var(--error-borde)] bg-error-tenue px-4 py-3 text-sm text-error outline-none">
          Faltan por responder: {faltan.map(numeroDe).join(", ")}. Todas las preguntas son obligatorias.
        </div>
      ) : null}

      {paso >= 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => ir(paso - 1)} className={clasesBoton("secundario")}>
            <ArrowLeft size={16} aria-hidden /> Atrás
          </button>
          {!ultima ? (
            <button type="button" onClick={siguiente} className={clasesBoton("principal")}>
              Siguiente <ArrowRight size={16} aria-hidden />
            </button>
          ) : vistaPrevia ? (
            <span className="inline-flex items-center gap-2 rounded-xl border border-dashed border-linea-fuerte px-4 py-2.5 text-sm text-tinta-suave">
              <Lock size={14} aria-hidden /> Vista previa: aquí termina. No se envía nada.
            </span>
          ) : (
            <EnviarSiCompleto
              completo={hechas === total}
              alFaltar={() => {
                const todas = sinResponder(paginas.length - 1);
                const primera = paginas.findIndex((p) => p.tipo === "items" && p.items.some((i) => todas.includes(i.id)));
                if (primera >= 0 && primera !== paso) setPaso(primera);
                setFaltan(todas);
              }}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

// El botón de envío solo envía si está todo respondido. El servidor lo vuelve a comprobar.
function EnviarSiCompleto({ completo, alFaltar }: { completo: boolean; alFaltar: () => void }) {
  return (
    <span
      onClickCapture={(e) => {
        if (!completo) {
          e.preventDefault();
          alFaltar();
        }
      }}
    >
      <Enviar>Enviar respuestas</Enviar>
    </span>
  );
}
