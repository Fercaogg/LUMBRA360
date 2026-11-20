import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo } from "@/components/marca/logotipo";
import { CuestionarioDemo, type DatosCuestionarioDemo } from "@/components/demo/cuestionario-demo";
import { Cargando } from "@/components/ui/piezas";
import { crearClienteAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Cuestionario de demostración",
  description: "Así responde la plantilla: con un código, sin cuenta y de forma anónima. En la demostración no se guarda nada.",
};

// Solo se muestran datos marcados como de demostración: instrumento y empresa ficticios.
const INSTRUMENTO_DEMO = process.env.DEMO_INSTRUMENTO_ID ?? "00000000-0000-4000-8c00-000000000001";
const EMPRESA_DEMO = process.env.DEMO_EMPRESA_ID ?? "00000000-0000-4000-b000-000000000001";

async function cargar(): Promise<DatosCuestionarioDemo | null> {
  await connection();
  const admin = crearClienteAdmin();
  const [instrumento, empresa] = await Promise.all([
    admin.from("instrumentos").select("id, nombre, minutos_estimados").eq("id", INSTRUMENTO_DEMO).eq("es_demo", true).maybeSingle(),
    admin.from("empresas").select("id, nombre").eq("id", EMPRESA_DEMO).eq("es_demo", true).maybeSingle(),
  ]);
  if (!instrumento.data || !empresa.data) return null;

  const [items, dimensiones] = await Promise.all([
    admin.from("items").select("id, enunciado, orden, escala_id, factores(orden)").eq("instrumento_id", instrumento.data.id),
    admin.from("dimensiones").select("id, nombre, grupos(id, nombre, orden)").eq("empresa_id", empresa.data.id),
  ]);
  const listaItems = items.data ?? [];
  const escalas = [...new Set(listaItems.map((i) => i.escala_id))];
  const opciones = escalas.length
    ? ((await admin.from("escala_opciones").select("escala_id, etiqueta, valor, orden").in("escala_id", escalas)).data ?? [])
    : [];

  const ordenFactor = (i: (typeof listaItems)[number]) => (i.factores as { orden: number } | null)?.orden ?? 0;
  return {
    empresa: empresa.data.nombre,
    nombre: instrumento.data.nombre,
    minutos: instrumento.data.minutos_estimados,
    items: [...listaItems]
      .sort((a, b) => ordenFactor(a) - ordenFactor(b) || a.orden - b.orden)
      .map((i) => ({
        id: i.id,
        enunciado: i.enunciado,
        opciones: opciones
          .filter((o) => o.escala_id === i.escala_id)
          .sort((a, b) => a.orden - b.orden || a.valor - b.valor)
          .map((o) => ({ valor: o.valor, etiqueta: o.etiqueta })),
      })),
    dimensiones: (dimensiones.data ?? []).map((d) => ({
      id: d.id,
      nombre: d.nombre,
      grupos: [...(d.grupos ?? [])].sort((a, b) => a.orden - b.orden).map((g) => ({ id: g.id, nombre: g.nombre })),
    })),
  };
}

async function Contenido() {
  const datos = await cargar();
  if (!datos || datos.items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-medium tracking-[-0.02em]">La demostración no está disponible en este momento</h1>
        <p className="text-tinta-suave">Inténtelo más tarde o solicite una demostración guiada.</p>
        <Link href="/contacto" className="font-medium underline underline-offset-4">
          Solicitar una demostración
        </Link>
      </div>
    );
  }
  return <CuestionarioDemo datos={datos} />;
}

export default function PaginaCuestionarioDemo() {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between gap-4">
        <EnlaceInicio className="rounded-md">
          <Logotipo alto={26} decorativo />
        </EnlaceInicio>
        <Link href="/demo" className="text-sm font-medium text-tinta-suave underline underline-offset-4 hover:text-tinta">
          Volver a la demostración
        </Link>
      </div>
      <Suspense fallback={<Cargando texto="Cargando el cuestionario…" />}>
        <Contenido />
      </Suspense>
    </main>
  );
}
