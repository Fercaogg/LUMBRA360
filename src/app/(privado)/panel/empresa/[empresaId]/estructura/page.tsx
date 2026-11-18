import type { Metadata } from "next";
import {
  borrarEstructura,
  crearDimension,
  crearGrupo,
} from "@/app/(privado)/acciones-evaluacion";
import { Pestanas } from "@/components/panel/listas";
import { Campo, Enviar, Formulario } from "@/components/ui/formulario";
import { Cabecera, EstadoVacio, Tarjeta } from "@/components/ui/piezas";
import { cargarEmpresa, pestanasEmpresa } from "@/lib/empresa";

export const metadata: Metadata = { title: "Grupos" };

export default async function PaginaEstructura({
  params,
}: {
  params: Promise<{ empresaId: string }>;
}) {
  const { empresaId } = await params;
  const { supabase, empresa, soloLectura } = await cargarEmpresa(empresaId);
  const base = `/panel/empresa/${empresa.id}`;
  const { data } = await supabase
    .from("dimensiones")
    .select("id, nombre, grupos(id, nombre, orden)")
    .eq("empresa_id", empresa.id)
    .order("nombre");
  const lista = data ?? [];

  return (
    <>
      <Cabecera
        titulo="Grupos"
        descripcion="Defina cómo quiere ver los resultados: por departamento, por turno o por centro. La persona elige su grupo al responder, si quiere."
      />
      <Pestanas
        enlaces={pestanasEmpresa(empresa.id)}
        actual={`${base}/estructura`}
      />
      <p className="max-w-prose text-pretty text-sm text-tinta-suave">
        Un grupo con menos de 5 respuestas nunca muestra resultados. Evite
        grupos muy pequeños: no aportan datos y la gente se siente señalada.
      </p>
      {lista.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hay grupos"
          texto="Cree una dimensión, por ejemplo «Departamento», y añada sus grupos."
        />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        {lista.map((dimension) => (
          <Tarjeta key={dimension.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{dimension.nombre}</h2>
              {soloLectura ? null : (
                <Formulario accion={borrarEstructura} className="items-end">
                  <input type="hidden" name="tabla" value="dimensiones" />
                  <input type="hidden" name="id" value={dimension.id} />
                  <Enviar variante="peligro">Borrar dimensión</Enviar>
                </Formulario>
              )}
            </div>
            <ul className="flex flex-col divide-y divide-linea">
              {[...dimension.grupos]
                .sort((a, b) => a.orden - b.orden)
                .map((grupo) => (
                  <li
                    key={grupo.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <span>{grupo.nombre}</span>
                    {soloLectura ? null : (
                      <Formulario
                        accion={borrarEstructura}
                        className="items-end"
                      >
                        <input type="hidden" name="tabla" value="grupos" />
                        <input type="hidden" name="id" value={grupo.id} />
                        <Enviar variante="peligro">Borrar</Enviar>
                      </Formulario>
                    )}
                  </li>
                ))}
            </ul>
            {soloLectura ? null : (
              <Formulario accion={crearGrupo}>
                <input type="hidden" name="dimensionId" value={dimension.id} />
                <Campo
                  etiqueta={`Nuevo grupo en ${dimension.nombre}`}
                  name="nombre"
                  required
                  maxLength={80}
                />
                <Enviar variante="secundario">Añadir grupo</Enviar>
              </Formulario>
            )}
          </Tarjeta>
        ))}
        {soloLectura ? null : (
          <Tarjeta className="flex flex-col gap-3 self-start">
            <h2 className="text-lg font-semibold">Nueva dimensión</h2>
            <Formulario accion={crearDimension}>
              <input type="hidden" name="empresaId" value={empresa.id} />
              <Campo
                etiqueta="Nombre"
                name="nombre"
                required
                maxLength={80}
                ayuda="Por ejemplo: Departamento, Turno, Centro."
              />
              <Enviar variante="secundario">Añadir dimensión</Enviar>
            </Formulario>
          </Tarjeta>
        )}
      </div>
    </>
  );
}
