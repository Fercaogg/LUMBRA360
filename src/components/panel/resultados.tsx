import { Etiqueta } from "@/components/ui/piezas";

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
          <li key={factor.factor_id} className="flex flex-col gap-3 rounded-xl border border-linea bg-superficie p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="text-lg font-semibold">{factor.nombre}</h3>
              <div className="flex flex-wrap items-center gap-2">
                {factor.nivel ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-linea px-2.5 py-0.5 text-sm font-medium">
                    <span aria-hidden className={`size-2.5 rounded-full ${FONDO[factor.nivel.tono]}`} />
                    {factor.nivel.etiqueta}
                  </span>
                ) : null}
                <span className="text-sm text-tinta-suave">
                  Media <span className="font-semibold tabular-nums text-tinta">{numero.format(Number(factor.media))}</span>
                </span>
              </div>
            </div>

            <div
              role="img"
              aria-label={`Reparto por niveles: ${distribucion.map((d) => `${d.etiqueta} ${d.porcentaje} %`).join(", ")}`}
              className="flex h-4 w-full gap-0.5 overflow-hidden rounded-[4px]"
            >
              {distribucion.map((d) => (
                <span key={d.etiqueta} title={`${d.etiqueta}: ${d.porcentaje} %`} className={`h-full ${FONDO[d.tono]}`} style={{ width: `${d.porcentaje}%` }} />
              ))}
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {(factor.distribucion ?? []).map((d) => (
                <li key={d.etiqueta} className="flex items-center gap-2">
                  <span aria-hidden className={`size-2.5 rounded-sm ${FONDO[d.tono]}`} />
                  <span className="text-tinta-suave">{d.etiqueta}</span>
                  <span className="font-medium tabular-nums">{d.porcentaje} %</span>
                </li>
              ))}
            </ul>

            {previo && diferencia !== null ? (
              <p className="text-sm text-tinta-suave">
                {nombreAnterior ? `En «${nombreAnterior}»: ` : "Campaña anterior: "}
                media {numero.format(Number(previo.media))}
                {previo.nivel ? ` (${previo.nivel.etiqueta})` : ""}. Diferencia:{" "}
                <span className="font-medium tabular-nums text-tinta">
                  {diferencia > 0 ? "+" : ""}
                  {numero.format(diferencia)}
                </span>
                .
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
    <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-linea bg-superficie/60 p-5">
      <Etiqueta tono="aviso">Protegido por anonimato</Etiqueta>
      <p className="max-w-prose text-pretty text-tinta-suave">
        No se muestran resultados de grupos con menos de {minimo} respuestas, ni los que permitirían deducir los de un grupo pequeño.
      </p>
    </div>
  );
}
