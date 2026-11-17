import type { Metadata } from "next";
import { cambiarEstadoMedida, crearMedida } from "@/app/(privado)/acciones-evaluacion";
import { Pestanas } from "@/components/panel/listas";
import { AreaTexto, Campo, Enviar, Formulario, Selector } from "@/components/ui/formulario";
import { Cabecera, EstadoVacio, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { cargarEmpresa, fecha, pestanasEmpresa } from "@/lib/empresa";

export const metadata: Metadata = { title: "Plan de acción" };

const ESTADOS = { pendiente: "Pendiente", en_curso: "En curso", hecha: "Hecha", descartada: "Descartada" } as const;
const CAMPOS: Record<string, string> = {
  creada: "Medida creada",
  titulo: "Título",
  descripcion: "Descripción",
  responsable: "Responsable",
  fecha_prevista: "Fecha prevista",
  estado: "Estado",
};

export default async function PaginaPlan({ params }: { params: Promise<{ empresaId: string }> }) {
  const { empresaId } = await params;
  const { supabase, empresa, editaPlan } = await cargarEmpresa(empresaId);
  const base = `/panel/empresa/${empresa.id}`;
  const [medidas, campanas] = await Promise.all([
    supabase
      .from("medidas")
      .select("id, titulo, descripcion, responsable, fecha_prevista, estado, creada_el, campanas(nombre), medida_historial(id, cuando, campo, antes, despues, perfiles(correo))")
      .eq("empresa_id", empresa.id)
      .order("creada_el", { ascending: false }),
    supabase.from("campanas").select("id, nombre").eq("empresa_id", empresa.id).order("creada_el", { ascending: false }),
  ]);
  const lista = medidas.data ?? [];
  const valor = (campo: string, v: string | null) =>
    v === null ? "sin indicar" : campo === "estado" ? (ESTADOS[v as keyof typeof ESTADOS] ?? v) : campo === "fecha_prevista" ? fecha(v) : v;

  return (
    <>
      <Cabecera titulo="Plan de acción" descripcion="Medidas, responsable, fecha y estado. Cada cambio queda registrado con fecha y autor." />
      <Pestanas enlaces={pestanasEmpresa(empresa.id)} actual={`${base}/plan`} />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          {lista.length === 0 ? (
            <EstadoVacio
              titulo="Todavía no hay medidas"
              texto={editaPlan ? "Añada la primera medida con el formulario." : "Cuando la empresa o su técnico añadan medidas, aparecerán aquí."}
            />
          ) : null}
          {lista.map((medida) => (
            <Tarjeta key={medida.id} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-lg font-semibold">{medida.titulo}</h2>
                <Etiqueta tono={medida.estado === "hecha" ? "acento" : medida.estado === "descartada" ? "neutro" : "aviso"}>{ESTADOS[medida.estado]}</Etiqueta>
              </div>
              {medida.descripcion ? <p className="whitespace-pre-line text-pretty">{medida.descripcion}</p> : null}
              <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="text-tinta-suave">Responsable:</dt>
                  <dd>{medida.responsable ?? "Sin indicar"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-tinta-suave">Fecha prevista:</dt>
                  <dd>{medida.fecha_prevista ? fecha(medida.fecha_prevista) : "Sin indicar"}</dd>
                </div>
                {medida.campanas ? (
                  <div className="flex gap-2">
                    <dt className="text-tinta-suave">Campaña:</dt>
                    <dd>{medida.campanas.nombre}</dd>
                  </div>
                ) : null}
              </dl>
              {editaPlan ? (
                <Formulario accion={cambiarEstadoMedida} className="sm:flex-row sm:items-end">
                  <input type="hidden" name="id" value={medida.id} />
                  <Selector etiqueta="Cambiar estado" name="estado" defaultValue={medida.estado}>
                    {Object.entries(ESTADOS).map(([clave, texto]) => (
                      <option key={clave} value={clave}>
                        {texto}
                      </option>
                    ))}
                  </Selector>
                  <Enviar variante="secundario">Guardar estado</Enviar>
                </Formulario>
              ) : null}
              <details className="text-sm">
                <summary className="min-h-11 cursor-pointer py-3 font-medium text-acento">Historial de cambios ({medida.medida_historial.length})</summary>
                <ol className="flex flex-col gap-2 border-l-2 border-linea pl-4">
                  {[...medida.medida_historial].sort((a, b) => a.cuando.localeCompare(b.cuando)).map((h) => (
                    <li key={h.id}>
                      <span className="font-medium">{CAMPOS[h.campo] ?? h.campo}</span>
                      {h.campo !== "creada" ? `: de «${valor(h.campo, h.antes)}» a «${valor(h.campo, h.despues)}»` : ""}
                      <span className="block text-tinta-suave">
                        {fecha(h.cuando)}
                        {h.perfiles?.correo ? ` · ${h.perfiles.correo}` : ""}
                      </span>
                    </li>
                  ))}
                </ol>
              </details>
            </Tarjeta>
          ))}
        </div>
        {editaPlan ? (
          <Tarjeta className="flex flex-col gap-4 self-start">
            <h2 className="text-lg font-semibold">Nueva medida</h2>
            <Formulario accion={crearMedida}>
              <input type="hidden" name="empresaId" value={empresa.id} />
              <Campo etiqueta="Medida" name="titulo" required maxLength={200} />
              <AreaTexto etiqueta="Descripción (opcional)" name="descripcion" maxLength={4000} />
              <Campo etiqueta="Responsable (opcional)" name="responsable" maxLength={160} />
              <Campo etiqueta="Fecha prevista (opcional)" name="fecha" type="date" />
              <Selector etiqueta="Campaña relacionada (opcional)" name="campanaId" defaultValue="">
                <option value="">Ninguna</option>
                {(campanas.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Selector>
              <Enviar>Añadir medida</Enviar>
            </Formulario>
          </Tarjeta>
        ) : (
          <p className="self-start rounded-xl border border-linea bg-superficie p-4 text-sm text-tinta-suave">
            El plan lo editan la empresa y su técnico de prevención. Usted puede consultarlo.
          </p>
        )}
      </div>
    </>
  );
}
