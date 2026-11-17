import type { Metadata } from "next";
import Link from "next/link";
import { crearPlantilla } from "@/app/(privado)/acciones-desconexion";
import { PestanasAdmin } from "@/components/panel/admin";
import { Campo, Enviar, Formulario } from "@/components/ui/formulario";
import { Aviso, Cabecera, EstadoVacio, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { exigirAdmin } from "@/lib/acceso";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Plantillas" };

const ESTADOS = { borrador: "Borrador", publicado: "Publicada", retirado: "Retirada" } as const;

export default async function PaginaPlantillas() {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("politica_plantillas")
    .select("id, nombre, estado, es_demo, revisada_juridicamente, politica_plantilla_secciones(count)")
    .order("creado_el");
  const lista = data ?? [];
  const hayRevisada = lista.some((p) => !p.es_demo && p.revisada_juridicamente);

  return (
    <>
      <Cabecera titulo="Plantillas de política" descripcion="Plantillas editables de la política interna de desconexión digital. Las empresas parten de ellas." />
      <PestanasAdmin actual="/admin/plantillas" />
      {!hayRevisada ? <Aviso>[PENDIENTE: revisión jurídica]. Ninguna plantilla real está revisada. No se publica ninguna sin revisión.</Aviso> : null}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {lista.length === 0 ? (
          <EstadoVacio titulo="Todavía no hay plantillas" texto="Crea la primera con el formulario." />
        ) : (
          <ul className="flex flex-col divide-y divide-linea self-start overflow-hidden rounded-xl border border-linea bg-superficie">
            {lista.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/plantillas/${p.id}`} className="flex flex-col gap-2 p-4 transition-colors duration-150 hover:bg-papel sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{p.nombre}</span>
                    <span className="text-sm text-tinta-suave">{p.politica_plantilla_secciones[0]?.count ?? 0} secciones</span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {p.es_demo ? <Etiqueta tono="aviso">Demo</Etiqueta> : null}
                    {!p.es_demo && !p.revisada_juridicamente ? <Etiqueta tono="aviso">[PENDIENTE: revisión jurídica]</Etiqueta> : null}
                    <Etiqueta tono={p.estado === "publicado" ? "acento" : "neutro"}>{ESTADOS[p.estado]}</Etiqueta>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Tarjeta className="flex flex-col gap-4 self-start">
          <h2 className="text-lg font-semibold">Nueva plantilla</h2>
          <Formulario accion={crearPlantilla}>
            <Campo etiqueta="Nombre" name="nombre" required maxLength={160} />
            <Enviar>Crear en borrador</Enviar>
          </Formulario>
        </Tarjeta>
      </div>
    </>
  );
}
