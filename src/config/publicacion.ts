// Datos de la web pública para buscadores y redes.
// INDEXAR se activa con la variable de entorno INDEXAR=si, solo cuando estén publicados
// el aviso legal y la política de privacidad. Mientras tanto se pide a los buscadores que no indexen.
export const INDEXAR = process.env.INDEXAR === "si";

export const DESCRIPCION =
  "Evaluación psicosocial y desconexión digital para pymes, con cada paso documentado.";

// Rutas privadas o con enlaces personales: nunca se indexan ni se miden.
export const RUTAS_PRIVADAS = ["/panel", "/api", "/auth", "/responder", "/acuse", "/demo", "/acceso"];

// URL base para enlaces absolutos (sitemap, imagen para compartir). Sin variable, la de producción.
export function urlPublica(): string {
  const vistaPrevia = process.env.VERCEL_ENV === "preview" ? process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL : undefined;
  if (vistaPrevia) return `https://${vistaPrevia}`;
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumbra360.vercel.app").replace(/\/+$/, "");
}
