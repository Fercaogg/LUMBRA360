/**
 * LUMBRA360 · Tema de Tailwind
 *
 * Formato de configuración (Tailwind 3, o Tailwind 4 con `@config "./brand/tailwind.config.ts";`).
 * Todos los colores apuntan a las variables de brand/tokens.css, así el modo oscuro
 * funciona sin clases `dark:`: cambia el valor de la variable, no la clase.
 *
 * Para Tailwind 4 sin archivo de configuración, usa brand/tailwind.theme.css.
 */
import type { Config } from "tailwindcss";

const escala = (nombre: string, pasos: (number | string)[]) =>
  Object.fromEntries(pasos.map((p) => [p, `var(--${nombre}-${p})`]));

const config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // Se sustituye la paleta por defecto: solo existen los colores de marca.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      petroleo: escala("petroleo", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
      lumbre: escala("lumbre", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
      piedra: escala("piedra", [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),

      // Semánticos: los que usan los componentes
      fondo: { DEFAULT: "var(--fondo)", hundido: "var(--fondo-hundido)" },
      superficie: { DEFAULT: "var(--superficie)", elevada: "var(--superficie-elevada)", marca: "var(--superficie-marca)" },
      texto: { DEFAULT: "var(--texto)", suave: "var(--texto-suave)", "sobre-marca": "var(--texto-sobre-marca)", desactivado: "var(--texto-desactivado)" },
      linea: { DEFAULT: "var(--linea)", fuerte: "var(--linea-fuerte)", control: "var(--borde-control)" },
      primario: {
        DEFAULT: "var(--primario)",
        hover: "var(--primario-hover)",
        texto: "var(--primario-texto)",
        suave: "var(--primario-suave)",
        "suave-texto": "var(--primario-suave-texto)",
      },
      enlace: "var(--enlace)",
      foco: "var(--foco)",
      acento: {
        DEFAULT: "var(--lumbre)",
        texto: "var(--lumbre-texto)",
        suave: "var(--lumbre-suave)",
        "suave-texto": "var(--lumbre-suave-texto)",
      },
      correcto: { texto: "var(--correcto-texto)", fondo: "var(--correcto-fondo)", borde: "var(--correcto-borde)", solido: "var(--correcto-solido)" },
      aviso: { texto: "var(--aviso-texto)", fondo: "var(--aviso-fondo)", borde: "var(--aviso-borde)", solido: "var(--aviso-solido)" },
      error: { texto: "var(--error-texto)", fondo: "var(--error-fondo)", borde: "var(--error-borde)", solido: "var(--error-solido)" },
      info: { texto: "var(--info-texto)", fondo: "var(--info-fondo)", borde: "var(--info-borde)", solido: "var(--info-solido)" },
      velo: "var(--velo)",
    },
    fontFamily: {
      titular: ["var(--fuente-titular)"],
      sans: ["var(--fuente-interfaz)"],
      mono: ["var(--fuente-datos)"],
    },
    fontSize: {
      mini: ["var(--texto-mini)", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      pequeno: ["var(--texto-pequeno)", { lineHeight: "var(--interlineado-interfaz)" }],
      base: ["var(--texto-base)", { lineHeight: "var(--interlineado-interfaz)" }],
      grande: ["var(--texto-grande)", { lineHeight: "var(--interlineado-texto)" }],
      h4: ["var(--texto-h4)", { lineHeight: "var(--interlineado-compacto)", fontWeight: "600" }],
      h3: ["var(--texto-h3)", { lineHeight: "var(--interlineado-compacto)" }],
      h2: ["var(--texto-h2)", { lineHeight: "var(--interlineado-titular)", letterSpacing: "var(--tracking-titular)" }],
      h1: ["var(--texto-h1)", { lineHeight: "var(--interlineado-titular)", letterSpacing: "var(--tracking-titular)" }],
      display: ["var(--texto-display)", { lineHeight: "1.04", letterSpacing: "var(--tracking-titular)" }],
    },
    spacing: {
      px: "1px",
      0: "0",
      1: "var(--espacio-1)",
      2: "var(--espacio-2)",
      3: "var(--espacio-3)",
      4: "var(--espacio-4)",
      5: "var(--espacio-5)",
      6: "var(--espacio-6)",
      8: "var(--espacio-8)",
      10: "var(--espacio-10)",
      11: "var(--control-alto)",
      12: "var(--espacio-12)",
      16: "var(--espacio-16)",
      20: "var(--espacio-20)",
      24: "var(--espacio-24)",
    },
    borderRadius: {
      none: "0",
      xs: "var(--radio-xs)",
      sm: "var(--radio-sm)",
      DEFAULT: "var(--radio-md)",
      md: "var(--radio-md)",
      lg: "var(--radio-lg)",
      xl: "var(--radio-xl)",
      full: "var(--radio-total)",
    },
    boxShadow: {
      none: "none",
      1: "var(--sombra-1)",
      2: "var(--sombra-2)",
      3: "var(--sombra-3)",
    },
    extend: {
      maxWidth: { lectura: "var(--ancho-lectura)" },
      transitionDuration: {
        rapida: "var(--duracion-rapida)",
        base: "var(--duracion-base)",
        lenta: "var(--duracion-lenta)",
        enfasis: "var(--duracion-enfasis)",
      },
      transitionTimingFunction: {
        salida: "var(--curva-salida)",
        "entrada-salida": "var(--curva-entrada-salida)",
        estandar: "var(--curva-estandar)",
      },
      zIndex: { cabecera: "30", menu: "40", modal: "50", aviso: "60" },
    },
  },
} satisfies Config;

export default config;
