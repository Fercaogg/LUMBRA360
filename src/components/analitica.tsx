"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { RUTAS_PRIVADAS } from "@/config/publicacion";

// Analítica de visitas de Vercel: sin cookies y sin identificar a nadie.
// Solo mide la web pública. El panel, las encuestas y los acuses no envían nada,
// porque sus direcciones llevan identificadores y códigos personales.
function soloPublico(evento: BeforeSendEvent) {
  const ruta = new URL(evento.url).pathname;
  if (RUTAS_PRIVADAS.some((r) => ruta === r || ruta.startsWith(r + "/"))) return null;
  return evento;
}

// Solo se carga en Vercel: fuera de allí el script no existe y daría un error en la consola.
const EN_VERCEL = Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV);

export function Analitica() {
  return EN_VERCEL ? <Analytics beforeSend={soloPublico} /> : null;
}
