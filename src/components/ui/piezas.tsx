import type { ReactNode } from "react";

export function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-linea bg-superficie p-5 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function Cabecera({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-balance font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl">{titulo}</h1>
        {descripcion ? <p className="max-w-prose text-pretty text-tinta-suave">{descripcion}</p> : null}
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
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-linea bg-superficie/60 p-6">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <p className="max-w-prose text-pretty text-tinta-suave">{texto}</p>
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
    neutro: "border-linea bg-papel text-tinta-suave",
    acento: "border-acento/20 bg-acento-tenue text-acento-fuerte",
    aviso: "border-aviso/20 bg-aviso-tenue text-aviso",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tonos[tono]}`}>
      {children}
    </span>
  );
}

export function Aviso({ children, tono = "aviso" }: { children: ReactNode; tono?: "aviso" | "error" }) {
  const tonos = {
    aviso: "border-aviso/20 bg-aviso-tenue text-aviso",
    error: "border-error/20 bg-error-tenue text-error",
  } as const;
  return <p className={`rounded-lg border px-3 py-2 text-sm ${tonos[tono]}`}>{children}</p>;
}

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div role="status" className="flex flex-col gap-3" aria-label={texto}>
      <div className="h-8 w-56 animate-pulse rounded-md bg-linea/60" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-linea/50" />
      <div className="mt-4 h-40 animate-pulse rounded-xl bg-linea/40" />
    </div>
  );
}
