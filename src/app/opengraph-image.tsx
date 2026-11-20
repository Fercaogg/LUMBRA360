import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LEMA, NOMBRE } from "@/config/marca";
import { DESCRIPCION } from "@/config/publicacion";
import { ONDA_CAJA, ONDA_TRANSFORMACION, ONDA_TRAZADO } from "@/components/marca/onda";

// Imagen que se ve al compartir el enlace en redes y mensajería.
export const alt = `${NOMBRE}. ${LEMA}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Imagen() {
  const fuente = await readFile(join(process.cwd(), "src/assets/fuentes/instrument-sans-latin-500-normal.woff"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#111111", color: "#ffffff", fontFamily: "Instrument" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg viewBox={ONDA_CAJA} width={96} height={60}>
            <path d={ONDA_TRAZADO} transform={ONDA_TRANSFORMACION} fill="#f25a1f" />
          </svg>
          <span style={{ fontSize: 40, letterSpacing: "-0.02em" }}>{NOMBRE}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <span style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: "-0.035em", maxWidth: 980 }}>{LEMA}</span>
          <span style={{ fontSize: 32, lineHeight: 1.35, color: "#bdbdb6", maxWidth: 900 }}>{DESCRIPCION}</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Instrument", data: fuente, weight: 500, style: "normal" }] },
  );
}
