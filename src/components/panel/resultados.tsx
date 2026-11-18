import { ShieldCheck } from "lucide-react";

export type Tono = "favorable" | "intermedio" | "desfavorable";

export type FactorResultado = {
  factor_id: string;
  nombre: string;
  media: number;
  nivel: { etiqueta: string; tono: Tono } | null;
  distribucion: { etiqueta: string; tono: Tono; porcentaje: number }[] | null;
};

export type BloqueResultados = { suprimido: boolean; n?: number; minimo?: number; factores?: FactorResultado[] };

const FONDO: Record<Tono, string> = {
  favorable: "bg-nivel-favorable",
  intermedio: "bg-nivel-intermedio",
  desfavorable: "bg-nivel-desfavorable",
};

const numero = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

// Resultados por factor. El color nunca va solo: cada nivel lleva su etiqueta y su porcentaje en texto.
export function ResultadosPorFactor({
  actual,
  anterior,
  nombreAnterior,
}: {
  actual: FactorResultado[];
  anterior?: FactorResultado[] | null;
  nombreAnterior?: string;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {actual.map((factor) => {
        const previo = anterior?.find((f) => f.factor_id === factor.factor_id);
        const diferencia = previo ? Number(factor.media) - Number(previo.media) : null;
        const distribucion = (factor.distribucion ?? []).filter((d) => d.porcentaje > 0);
        return (
          <li key={factor.factor_id} className="flex flex-col gap-5 rounded-[20px] border border-linea bg-superficie p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="text-lg font-semibold">{factor.nombre}</h3>
              <div className="flex flex-wrap items-center gap-2">
                {factor.nivel ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-papel px-3 py-1 text-sm font-medium ring-1 ring-inset ring-linea">
                    <span aria-hidden className={`size-2.5 rounded-full ${FONDO[factor.nivel.tono]}`} />
                    {factor.nivel.etiqueta}
                  </span>
                ) : null}
                <span className="inline-flex items-baseline gap-1.5 rounded-full bg-papel px-3 py-1 text-sm ring-1 ring-inset ring-linea">
                  <span className="text-tinta-suave">Media</span>
                  <span className="font-semibold tabular-nums">{numero.format(Number(factor.media))}</span>
                </span>
              </div>
            </div>

            <div
              role="img"
              aria-label={`Reparto por niveles: ${distribucion.map((d) => `${d.etiqueta} ${d.porcentaje} %`).join(", ")}`}
              className="flex h-3 w-full gap-1 overflow-hidden rounded-full"
            >
              {distribucion.map((d) => (
                <span key={d.etiqueta} title={`${d.etiqueta}: ${d.porcentaje} %`} className={`h-full rounded-full ${FONDO[d.tono]}`} style={{ width: `${d.porcentaje}%` }} />
              ))}
            </div>
            <ul className="grid gap-2 text-sm sm:grid-cols-3">
              {(factor.distribucion ?? []).map((d) => (
                <li key={d.etiqueta} className="flex items-center justify-between gap-2 rounded-xl bg-papel px-3 py-2">
                  <span className="flex items-center gap-2">
                    <span aria-hidden className={`size-2.5 rounded-full ${FONDO[d.tono]}`} />
                    <span className="text-tinta-suave">{d.etiqueta}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{d.porcentaje} %</span>
                </li>
              ))}
            </ul>

            {previo && diferencia !== null ? (
              <p className="flex flex-wrap items-center gap-2 border-t border-linea pt-4 text-sm text-tinta-suave">
                <span className="rounded-full bg-papel px-2.5 py-0.5 font-semibold tabular-nums text-tinta ring-1 ring-inset ring-linea">
                  {diferencia > 0 ? "+" : ""}
                  {numero.format(diferencia)}
                </span>
                respecto a {nombreAnterior ? `«${nombreAnterior}»` : "la campaña anterior"}: media {numero.format(Number(previo.media))}
                {previo.nivel ? ` (${previo.nivel.etiqueta})` : ""}.
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function AvisoSuprimido({ minimo }: { minimo: number }) {
  return (
    <div className="flex items-start gap-4 rounded-[20px] border border-dashed border-linea-fuerte bg-superficie p-6">
      <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--correcto-fondo)] text-[var(--correcto-solido)]">
        <ShieldCheck size={20} strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-semibold">Protegido por anonimato</p>
        <p className="max-w-[60ch] text-pretty text-tinta-suave">
          No se muestran resultados de grupos con menos de {minimo} respuestas, ni los que permitirían deducir los de un grupo pequeño.
        </p>
      </div>
    </div>
  );
}
