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

export function Analitica() {
  return <Analytics beforeSend={soloPublico} />;
}
