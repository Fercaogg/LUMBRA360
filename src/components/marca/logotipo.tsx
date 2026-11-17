import { NOMBRE } from "@/config/marca";

// Logotipo de marca (brand/logo). Los SVG llevan el nombre convertido a trazados;
// el texto alternativo sale de la constante NOMBRE.
export function Logotipo({
  variante = "positivo",
  alto = 28,
  className = "",
  decorativo = false,
}: {
  variante?: "positivo" | "negativo";
  alto?: number;
  className?: string;
  decorativo?: boolean;
}) {
  // Proporción del SVG horizontal: 271 × 48.
  const ancho = Math.round((alto * 271) / 48);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/marca/lumbra360-horizontal-${variante}.svg`}
      alt={decorativo ? "" : NOMBRE}
      width={ancho}
      height={alto}
      className={`block h-auto max-w-full ${className}`}
      style={{ height: alto, width: "auto" }}
    />
  );
}

export function Simbolo({ tamano = 32, className = "" }: { tamano?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/marca/lumbra360-simbolo-positivo.svg" alt="" width={tamano} height={tamano} className={className} />
  );
}
