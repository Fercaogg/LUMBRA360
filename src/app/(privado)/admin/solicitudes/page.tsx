import type { Metadata } from "next";
import { borrarSolicitudDemo } from "@/app/(privado)/acciones";
import { PestanasAdmin } from "@/components/panel/admin";
import { Boton } from "@/components/ui/boton";
import { Cabecera, EstadoVacio, Etiqueta } from "@/components/ui/piezas";
import { exigirAdmin } from "@/lib/acceso";
import { fecha } from "@/lib/empresa";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Solicitudes de demostración" };

export default async function PaginaSolicitudes() {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("solicitudes_demo").select("id, nombre, correo, acepta_novedades, creada_el").order("creada_el", { ascending: false });
  const lista = data ?? [];

  return (
    <>
      <Cabecera
        titulo="Solicitudes de demostración"
        descripcion="Lo que llega desde el formulario de contacto. Se conservan solo durante el piloto. Si alguien pide que se borren sus datos, bórrela aquí."
      />
      <PestanasAdmin actual="/admin/solicitudes" />
      {lista.length === 0 ? (
        <EstadoVacio titulo="Aún no hay solicitudes" texto="Cuando alguien rellene el formulario de contacto, aparecerá aquí." />
      ) : (
        <ul className="flex flex-col divide-y divide-linea overflow-hidden rounded-xl border border-linea bg-superficie">
          {lista.map((s) => (
            <li key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{s.nombre}</span>
                  {s.acepta_novedades ? <Etiqueta tono="acento">Acepta novedades</Etiqueta> : null}
                </span>
                <a href={`mailto:${s.correo}`} className="break-all text-sm underline underline-offset-4">
                  {s.correo}
                </a>
                <span className="text-xs text-tinta-suave">{fecha(s.creada_el)}</span>
              </div>
              <form action={borrarSolicitudDemo}>
                <input type="hidden" name="id" value={s.id} />
                <Boton variante="secundario" type="submit">
                  Borrar
                </Boton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
