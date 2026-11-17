import type { Metadata } from "next";
import Link from "next/link";
import { crearInstrumento } from "@/app/(privado)/acciones-evaluacion";
import { PestanasAdmin } from "@/components/panel/admin";
import { AreaTexto, Campo, Enviar, Formulario, Selector } from "@/components/ui/formulario";
import { Aviso, Cabecera, EstadoVacio, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { exigirAdmin } from "@/lib/acceso";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Instrumentos" };

const ESTADOS = { borrador: "Borrador", publicado: "Publicado", retirado: "Retirado" } as const;

export default async function PaginaInstrumentos() {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("instrumentos")
    .select("id, nombre, tipo, estado, origen, es_demo, licencia_confirmada, items(count)")
    .order("creado_el");
  const lista = data ?? [];
  const hayAutorizado = lista.some((i) => i.origen === "insst_fpsico" && i.licencia_confirmada);

  return (
    <>
      <Cabecera
        titulo="Instrumentos"
        descripcion="Evaluación con FPSICO (sin puntuar aquí) y seguimientos con ítems propios. Todo se configura aquí, nada en el código."
      />
      <PestanasAdmin actual="/admin/instrumentos" />
      {!hayAutorizado ? (
        <Aviso>[PENDIENTE: autorización escrita del INSST]. El banco de ítems de FPSICO está vacío. No se copia ningún ítem hasta tenerla.</Aviso>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {lista.length === 0 ? (
          <EstadoVacio titulo="Todavía no hay instrumentos" texto="Cree el primero con el formulario. Empieza en borrador." />
        ) : (
          <ul className="flex flex-col divide-y divide-linea self-start overflow-hidden rounded-xl border border-linea bg-superficie">
            {lista.map((instrumento) => (
              <li key={instrumento.id}>
                <Link href={`/admin/instrumentos/${instrumento.id}`} className="flex flex-col gap-2 p-4 transition-colors duration-150 hover:bg-papel sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{instrumento.nombre}</span>
                    <span className="text-sm text-tinta-suave">
                      {instrumento.tipo === "pulso" ? "Seguimiento" : "Evaluación"} · {instrumento.items[0]?.count ?? 0} ítems
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {instrumento.es_demo ? <Etiqueta tono="aviso">Demo</Etiqueta> : null}
                    <Etiqueta tono={instrumento.estado === "publicado" ? "acento" : "neutro"}>{ESTADOS[instrumento.estado]}</Etiqueta>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Tarjeta className="flex flex-col gap-4 self-start">
          <h2 className="text-lg font-semibold">Nuevo instrumento</h2>
          <Formulario accion={crearInstrumento}>
            <Campo etiqueta="Nombre" name="nombre" autoComplete="off" required maxLength={160} />
            <Selector etiqueta="Tipo" name="tipo" defaultValue="evaluacion">
              <option value="evaluacion">Evaluación (FPSICO, INSST)</option>
              <option value="pulso">Seguimiento (ítems propios)</option>
            </Selector>
            <AreaTexto etiqueta="Descripción (opcional)" name="descripcion" maxLength={1000} />
            <Campo etiqueta="Minutos estimados (opcional)" name="minutos" type="number" inputMode="numeric" min={1} max={120} />
            <Enviar>Crear en borrador</Enviar>
          </Formulario>
        </Tarjeta>
      </div>
    </>
  );
}
