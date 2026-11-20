import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { LEMA, NOMBRE } from "@/config/marca";
import { DESCRIPCION, INDEXAR, urlPublica } from "@/config/publicacion";
import { Analitica } from "@/components/analitica";
import "./globals.css";

// Tipografías de marca (ver brand/DESIGN.md): Instrument Sans para titulares, interfaz y datos
// (con cifras tabulares) e IBM Plex Mono para valores literales. Ambas con licencia SIL OFL.
const instrument = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(urlPublica()),
  title: { default: NOMBRE, template: `%s · ${NOMBRE}` },
  description: DESCRIPCION,
  applicationName: NOMBRE,
  // No se indexa hasta que se publiquen el aviso legal y la privacidad (INDEXAR=si).
  robots: INDEXAR ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", locale: "es_ES", siteName: NOMBRE, title: `${NOMBRE} · ${LEMA}`, description: DESCRIPCION },
  twitter: { card: "summary_large_image", title: `${NOMBRE} · ${LEMA}`, description: DESCRIPCION },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="light" className={`${instrument.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-superficie focus:px-4 focus:py-3 focus:text-tinta"
        >
          Saltar al contenido
        </a>
        {children}
        <Analitica />
      </body>
    </html>
  );
}
