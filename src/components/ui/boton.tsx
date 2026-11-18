import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "principal" | "secundario" | "discreto" | "peligro" | "lumbre" | "sobreMarca";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[0.95rem] font-medium " +
  "transition-[background-color,border-color,transform] duration-150 ease-salida " +
  "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTES: Record<Variante, string> = {
  principal: "bg-tinta text-[var(--texto-sobre-marca)] hover:bg-[var(--tinta-800)]",
  secundario: "border border-linea-fuerte bg-superficie text-tinta hover:border-tinta",
  discreto: "text-tinta underline decoration-linea-fuerte underline-offset-4 hover:decoration-tinta",
  peligro: "border border-error/40 bg-superficie text-error hover:bg-error-tenue",
  // Lumbre: reservado a la acción de mayor valor (exportar). Texto en tinta: 5,6:1.
  lumbre: "bg-lumbre text-[var(--tinta-950)] hover:bg-lumbre-claro",
  // Sobre la superficie de marca (tinta).
  sobreMarca: "border border-white/25 text-white hover:border-white/50 hover:bg-white/10",
};

export function clasesBoton(variante: Variante = "principal", extra = ""): string {
  return `${BASE} ${VARIANTES[variante]} ${extra}`.trim();
}

export function Boton({
  variante = "principal",
  className = "",
  ...resto
}: ComponentProps<"button"> & { variante?: Variante }) {
  return <button className={clasesBoton(variante, className)} {...resto} />;
}

export function EnlaceBoton({
  variante = "principal",
  className = "",
  ...resto
}: ComponentProps<typeof Link> & { variante?: Variante }) {
  return <Link className={clasesBoton(variante, className)} {...resto} />;
}
