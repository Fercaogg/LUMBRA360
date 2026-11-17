import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "principal" | "secundario" | "discreto" | "peligro";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-[0.95rem] font-medium " +
  "transition-[background-color,border-color,transform] duration-150 ease-salida " +
  "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTES: Record<Variante, string> = {
  principal: "bg-acento text-white hover:bg-acento-fuerte",
  secundario: "border border-linea bg-superficie text-tinta hover:border-tinta-suave",
  discreto: "text-acento underline-offset-4 hover:underline",
  peligro: "border border-error/40 bg-superficie text-error hover:bg-error-tenue",
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
