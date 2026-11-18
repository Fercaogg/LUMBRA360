import { Check } from "lucide-react";

// Lista de pasos con su estado. Sirve para orientarse: qué está hecho y qué falta.
export type Paso = { titulo: string; detalle?: string; hecho: boolean; actual?: boolean; href?: string };

export function Pasos({ pasos, etiqueta }: { pasos: Paso[]; etiqueta: string }) {
  const hechos = pasos.filter((p) => p.hecho).length;
  return (
    <nav aria-label={etiqueta} className="rounded-[20px] border border-linea bg-superficie p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{etiqueta}</p>
        <p className="font-mono text-xs text-tinta-suave">
          {hechos} de {pasos.length}
        </p>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pasos.map((p, i) => {
          const contenido = (
            <>
              <span
                aria-hidden
                className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                  p.hecho
                    ? "bg-[var(--correcto-solido)] text-white"
                    : p.actual
                      ? "bg-lumbre text-[var(--tinta-950)]"
                      : "border border-linea-fuerte text-tinta-suave"
                }`}
              >
                {p.hecho ? <Check size={15} strokeWidth={3} /> : i + 1}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold leading-snug">
                  {p.titulo}
                  <span className="sr-only">{p.hecho ? " (hecho)" : p.actual ? " (siguiente)" : " (pendiente)"}</span>
                </span>
                {p.detalle ? <span className="text-xs text-tinta-suave">{p.detalle}</span> : null}
              </span>
            </>
          );
          const clases = `flex items-start gap-3 rounded-xl p-2.5 ${p.actual ? "bg-[var(--lumbre-50)]" : ""}`;
          return (
            <li key={p.titulo}>
              {p.href ? (
                <a href={p.href} className={`${clases} transition-colors hover:bg-papel`}>
                  {contenido}
                </a>
              ) : (
                <div className={clases}>{contenido}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Anillo de proporción (0 a 1) con una cifra en el centro.
export function Anillo({ valor, centro, pie, tamano = 132 }: { valor: number; centro: string; pie?: string; tamano?: number }) {
  const v = Math.max(0, Math.min(1, valor));
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: tamano, height: tamano }}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--piedra-200)" strokeWidth="10" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--lumbre)" strokeWidth="10" strokeLinecap="round" pathLength={100} strokeDasharray={`${v * 100} 100`} />
      </svg>
      <span className="flex flex-col items-center leading-none">
        <span className="text-[1.75rem] font-medium tracking-[-0.03em] tabular-nums">{centro}</span>
        {pie ? <span className="mt-1 text-[0.7rem] text-tinta-suave">{pie}</span> : null}
      </span>
    </div>
  );
}
