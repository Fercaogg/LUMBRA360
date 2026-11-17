import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import { LEMA, NOMBRE } from "@/config/marca";
import "./globals.css";

// Tipografías de marca (ver brand/brand-guidelines.md): Newsreader para titulares,
// IBM Plex Sans para interfaz y datos, IBM Plex Mono para valores literales.
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const plex = IBM_Plex_Sans({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: NOMBRE, template: `%s · ${NOMBRE}` },
  description: LEMA,
  // La web pública llega en la fase 6. Hasta entonces no se indexa nada.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5f0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="light" className={`${newsreader.variable} ${plex.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-superficie focus:px-4 focus:py-3 focus:text-tinta"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
