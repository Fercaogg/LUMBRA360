import type { Metadata } from "next";
import { alternarPendiente } from "@/app/(privado)/acciones";
import { PestanasAdmin } from "@/components/panel/admin";
import { Boton } from "@/components/ui/boton";
import { Cabecera, EstadoVacio, Etiqueta } from "@/components/ui/piezas";
import { exigirAdmin } from "@/lib/acceso";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Pendientes" };

export default async function PaginaPendientes() {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("pendientes")
    .select("id, modulo, descripcion, resuelto_el")
    .order("resuelto_el", { nullsFirst: true })
    .order("modulo");
  const lista = data ?? [];

  return (
    <>
      <Cabecera
        titulo="Pendientes"
        descripcion="Lo que falta por confirmar antes de publicar. Esta lista solo se ve aquí, nunca en páginas públicas."
      />
      <PestanasAdmin actual="/admin/pendientes" />
      {lista.length === 0 ? (
        <EstadoVacio titulo="No hay pendientes" texto="Cuando algo quede por confirmar, aparecerá aquí." />
      ) : (
        <ul className="flex flex-col divide-y divide-linea overflow-hidden rounded-xl border border-linea bg-superficie">
          {lista.map((pendiente) => {
            const resuelto = Boolean(pendiente.resuelto_el);
            return (
              <li key={pendiente.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <Etiqueta tono={resuelto ? "acento" : "aviso"}>{resuelto ? "Resuelto" : "[PENDIENTE]"}</Etiqueta>
                    <span className="text-sm font-medium text-tinta-suave">{pendiente.modulo}</span>
                  </span>
                  <span className={resuelto ? "text-tinta-suave line-through" : ""}>{pendiente.descripcion}</span>
                </div>
                <form action={alternarPendiente}>
                  <input type="hidden" name="id" value={pendiente.id} />
                  <input type="hidden" name="resolver" value={resuelto ? "no" : "si"} />
                  <Boton variante="secundario" type="submit">
                    {resuelto ? "Reabrir" : "Marcar resuelto"}
                  </Boton>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
