import { NOMBRE } from "@/config/marca";
import { ONDA_CAJA, ONDA_TRANSFORMACION, ONDA_TRAZADO } from "./onda";

// Logotipo de marca (brand/logo, generado desde el original con brand/scripts/logo_lumbra.py).
// El texto alternativo sale de la constante NOMBRE.
const PROPORCION = 1093.37 / 274.97;

export function Logotipo({
  variante = "positivo",
  alto = 24,
  className = "",
  decorativo = false,
}: {
  variante?: "positivo" | "negativo" | "acento";
  alto?: number;
  className?: string;
  decorativo?: boolean;
}) {
  const ancho = Math.round(alto * PROPORCION);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/marca/lumbra-horizontal-${variante}.svg`}
      alt={decorativo ? "" : NOMBRE}
      width={ancho}
      height={alto}
      className={`block max-w-full shrink-0 ${className}`}
      style={{ height: alto, width: ancho }}
    />
  );
}

// Símbolo: la onda del logotipo. `tamano` es el ancho en px.
export function Simbolo({ tamano = 32, color = "currentColor", className = "" }: { tamano?: number; color?: string; className?: string }) {
  return (
    <svg viewBox={ONDA_CAJA} width={tamano} height={Math.round((tamano * 201.4) / 324.36)} aria-hidden className={className}>
      <path d={ONDA_TRAZADO} transform={ONDA_TRANSFORMACION} fill={color} />
    </svg>
  );
}
