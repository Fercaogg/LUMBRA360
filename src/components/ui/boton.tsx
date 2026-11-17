import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "principal" | "secundario" | "discreto" | "peligro" | "lumbre" | "sobreMarca";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-[0.95rem] font-medium " +
  "transition-[background-color,border-color,transform] duration-150 ease-salida " +
  "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTES: Record<Variante, string> = {
  principal: "bg-acento text-white hover:bg-acento-fuerte",
  secundario: "border border-linea-fuerte bg-superficie text-tinta hover:border-control hover:bg-papel",
  discreto: "text-acento underline-offset-4 hover:underline",
  peligro: "border border-error/40 bg-superficie text-error hover:bg-error-tenue",
  // Lumbre: reservado a la acción de mayor valor (exportar). Texto petróleo oscuro: 6,8:1.
  lumbre: "bg-lumbre text-[var(--petroleo-900)] hover:bg-lumbre-claro",
  // Sobre la superficie de marca (petróleo oscuro).
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
