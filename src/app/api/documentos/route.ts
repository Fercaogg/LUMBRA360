import type { NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

// Descarga de un documento privado (informe, acta, material de formación).
// Se lee con la sesión de quien lo pide: si RLS no lo permite, no existe.
const RUTA = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.pdf$/;

export async function GET(request: NextRequest) {
  const ruta = request.nextUrl.searchParams.get("ruta") ?? "";
  if (!RUTA.test(ruta)) return new Response("No encontrado", { status: 404 });

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.storage.from("documentos").download(ruta);
  if (error || !data) return new Response("No encontrado", { status: 404 });

  return new Response(data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${ruta.split("/")[1]}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
