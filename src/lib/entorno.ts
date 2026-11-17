// Lectura de variables de entorno con errores claros.
// Las NEXT_PUBLIC_* son públicas por diseño. SUPABASE_SECRET_KEY solo existe en el servidor.

function exigir(nombre: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Revise .env.example.`);
  }
  return valor;
}

export function urlSupabase(): string {
  return exigir("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function clavePublicaSupabase(): string {
  return exigir(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

// En producción manda NEXT_PUBLIC_SITE_URL. En las vistas previas de Vercel se usa la URL
// de la rama, que Vercel pone en el entorno: así los enlaces de acceso vuelven a la misma vista previa.
export function urlSitio(): string {
  const vistaPrevia = process.env.VERCEL_ENV === "preview" ? process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL : undefined;
  if (vistaPrevia) return `https://${vistaPrevia}`.replace(/\/+$/, "");
  return exigir("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL).replace(/\/+$/, "");
}
