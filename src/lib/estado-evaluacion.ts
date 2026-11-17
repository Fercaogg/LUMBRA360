import "server-only";
import type { crearClienteServidor } from "@/lib/supabase/servidor";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

// Estado de la evaluación más reciente de cada empresa, para las listas del partner.
export async function estadosDeEvaluacion(supabase: Cliente, empresaIds: string[]): Promise<Record<string, string>> {
  if (empresaIds.length === 0) return {};
  const [campanas, informes] = await Promise.all([
    supabase
      .from("campanas")
      .select("id, empresa_id, estado, creada_el")
      .in("empresa_id", empresaIds)
      .eq("tipo", "evaluacion")
      .order("creada_el", { ascending: false }),
    supabase.from("informes").select("campana_id, estado"),
  ]);
  const firmados = new Set((informes.data ?? []).filter((i) => i.estado === "firmado").map((i) => i.campana_id));
  const salida: Record<string, string> = {};
  for (const campana of campanas.data ?? []) {
    if (salida[campana.empresa_id]) continue;
    salida[campana.empresa_id] =
      campana.estado === "abierta"
        ? "Evaluación abierta"
        : campana.estado === "borrador"
          ? "Evaluación en preparación"
          : firmados.has(campana.id)
            ? "Informe firmado"
            : "Evaluación cerrada";
  }
  return salida;
}
