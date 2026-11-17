import { crearClienteServidor } from "@/lib/supabase/servidor";
import { esquemaUuid } from "@/lib/validacion";

// Exportación de respuestas de una evaluación para tratarlas en la aplicación FPSICO.
// Quién puede exportar, y cuándo, lo decide la función de la base de datos (solo el técnico asignado).
// El formato lo define administración; aquí solo se unen las líneas.
type Exportacion = { cabecera: string | null; fin_linea: "crlf" | "lf"; lineas: string[] };

export async function GET(_request: Request, { params }: { params: Promise<{ campanaId: string }> }) {
  const { campanaId } = await params;
  const id = esquemaUuid.safeParse(campanaId);
  if (!id.success) return new Response("No encontrado", { status: 404 });

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("exportar_respuestas", { p_campana: id.data });
  if (error || !data) {
    const estado = error?.code === "42501" ? 403 : 409;
    return new Response(error?.message ?? "No disponible", { status: estado, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const exp = data as Exportacion;
  const salto = exp.fin_linea === "crlf" ? "\r\n" : "\n";
  const lineas = exp.cabecera ? [exp.cabecera, ...exp.lineas] : exp.lineas;
  return new Response(lineas.join(salto) + salto, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="respuestas-${id.data.slice(0, 8)}.txt"`,
      "Cache-Control": "private, no-store",
    },
  });
}
