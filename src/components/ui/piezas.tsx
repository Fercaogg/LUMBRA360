import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-linea bg-superficie p-5 sm:p-7 ${className}`}>{children}</section>;
}

export function Cabecera({
  titulo,
  descripcion,
  acciones,
  antetitulo,
}: {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
  antetitulo?: string;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        {antetitulo ? <p className="font-mono text-xs uppercase tracking-[0.14em] text-tinta-suave">{antetitulo}</p> : null}
        <h1 className="text-balance text-[1.875rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[2.25rem]">{titulo}</h1>
        {descripcion ? <p className="max-w-[62ch] text-pretty text-tinta-suave">{descripcion}</p> : null}
      </div>
      {acciones ? <div className="flex flex-wrap gap-2">{acciones}</div> : null}
    </header>
  );
}

export function EstadoVacio({
  titulo,
  texto,
  accion,
}: {
  titulo: string;
  texto: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-[20px] border border-dashed border-linea-fuerte bg-superficie p-7">
      <span aria-hidden className="grid size-11 place-items-center rounded-xl bg-papel text-tinta-suave">
        <Inbox size={20} strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{titulo}</h2>
        <p className="max-w-[60ch] text-pretty text-tinta-suave">{texto}</p>
      </div>
      {accion}
    </div>
  );
}

export function Etiqueta({
  children,
  tono = "neutro",
}: {
  children: ReactNode;
  tono?: "neutro" | "acento" | "aviso";
}) {
  const tonos = {
    neutro: "bg-papel text-tinta-suave ring-linea",
    acento: "bg-[var(--lumbre-50)] text-[var(--lumbre-700)] ring-[var(--lumbre-200)]",
    aviso: "bg-aviso-tenue text-aviso ring-aviso/20",
  } as const;
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tonos[tono]}`}>{children}</span>;
}

export function Aviso({ children, tono = "aviso" }: { children: ReactNode; tono?: "aviso" | "error" }) {
  const tonos = {
    aviso: "border-aviso/20 bg-aviso-tenue text-aviso",
    error: "border-error/20 bg-error-tenue text-error",
  } as const;
  return <p className={`rounded-xl border px-4 py-3 text-sm ${tonos[tono]}`}>{children}</p>;
}

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div role="status" className="flex flex-col gap-3" aria-label={texto}>
      <div className="h-9 w-64 animate-pulse rounded-lg bg-linea/60" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-linea/50" />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-[20px] bg-linea/40" />
        <div className="h-28 animate-pulse rounded-[20px] bg-linea/40" />
        <div className="h-28 animate-pulse rounded-[20px] bg-linea/40" />
      </div>
    </div>
  );
}
