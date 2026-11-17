import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresca la sesión y protege las zonas privadas.
// La autorización real está en RLS: esto solo evita enseñar pantallas sin sesión.
export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !clave) return respuesta;

  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(nuevas) {
        nuevas.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        nuevas.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  const ruta = request.nextUrl.pathname;
  const esPrivada = ruta.startsWith("/panel") || ruta.startsWith("/admin");
  if (esPrivada && !data.user) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/acceso";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*", "/acceso", "/auth/:path*"],
};
