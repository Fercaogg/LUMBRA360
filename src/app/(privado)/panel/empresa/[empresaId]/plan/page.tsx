import type { Metadata } from "next";
import { cambiarEstadoMedida, crearMedida } from "@/app/(privado)/acciones-evaluacion";
import { AreaTexto, Campo, Enviar, Formulario, Selector } from "@/components/ui/formulario";
import { Cabecera, EstadoVacio, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { cargarEmpresa, fecha } from "@/lib/empresa";
import { Anillo } from "@/components/panel/pasos";
import { CalendarDays, ClipboardList, UserRound } from "lucide-react";

export const metadata: Metadata = { title: "Plan de acción" };

const ESTADOS = { pendiente: "Pendiente", en_curso: "En curso", hecha: "Hecha", descartada: "Descartada" } as const;
const PUNTO: Record<keyof typeof ESTADOS, string> = {
  pendiente: "bg-[var(--ambar-solido)]",
  en_curso: "bg-lumbre",
  hecha: "bg-[var(--correcto-solido)]",
  descartada: "bg-[var(--piedra-400)]",
};
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
  const [medidas, campanas] = await Promise.all([
    supabase
      .from("medidas")
      .select("id, titulo, descripcion, responsable, fecha_prevista, estado, creada_el, campanas(nombre), medida_historial(id, cuando, campo, antes, despues, perfiles(correo))")
      .eq("empresa_id", empresa.id)
      .order("creada_el", { ascending: false }),
    supabase.from("campanas").select("id, nombre").eq("empresa_id", empresa.id).order("creada_el", { ascending: false }),
  ]);
  const lista = medidas.data ?? [];
  const cuenta = (estado: keyof typeof ESTADOS) => lista.filter((m) => m.estado === estado).length;
  const vivas = lista.filter((m) => m.estado !== "descartada").length;
  const hoy = new Date().toISOString().slice(0, 10);
  const vencida = (m: (typeof lista)[number]) => Boolean(m.fecha_prevista && m.fecha_prevista < hoy && (m.estado === "pendiente" || m.estado === "en_curso"));
  const vencidas = lista.filter(vencida).length;
  const grupos = (["en_curso", "pendiente", "hecha", "descartada"] as const)
    .map((estado) => ({ estado, medidas: lista.filter((m) => m.estado === estado) }))
    .filter((g) => g.medidas.length > 0);
  const valor = (campo: string, v: string | null) =>
    v === null ? "sin indicar" : campo === "estado" ? (ESTADOS[v as keyof typeof ESTADOS] ?? v) : campo === "fecha_prevista" ? fecha(v) : v;

  return (
    <>
      <Cabecera titulo="Plan de acción" descripcion="Medidas, responsable, fecha y estado. Cada cambio queda registrado con fecha y autor." />
      {lista.length > 0 ? (
        <div className="flex flex-col gap-6 rounded-[20px] border border-linea bg-superficie p-6 sm:flex-row sm:items-center">
          <Anillo valor={vivas ? cuenta("hecha") / vivas : 0} centro={`${cuenta("hecha")}/${vivas}`} pie="hechas" tamano={112} />
          <div className="flex flex-1 flex-col gap-4">
            <p className="text-pretty text-tinta-suave">
              {cuenta("hecha") === vivas
                ? "Todas las medidas están hechas."
                : `Quedan ${cuenta("pendiente") + cuenta("en_curso")} medidas por terminar${vencidas ? `, ${vencidas} con la fecha prevista ya pasada` : ""}.`}
            </p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(ESTADOS) as (keyof typeof ESTADOS)[]).map((estado) => (
                <li key={estado} className="flex items-center justify-between gap-2 rounded-xl bg-papel px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span aria-hidden className={`size-2.5 rounded-full ${PUNTO[estado]}`} />
                    {ESTADOS[estado]}
                  </span>
                  <span className="font-semibold tabular-nums">{cuenta(estado)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-8">
          {lista.length === 0 ? (
            <EstadoVacio
              titulo="Todavía no hay medidas"
              texto={editaPlan ? "Añada la primera medida con el formulario." : "Cuando la empresa o su técnico añadan medidas, aparecerán aquí."}
            />
          ) : null}
          {grupos.map((grupo) => (
            <div key={grupo.estado} className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-tinta-suave">
                <span aria-hidden className={`size-2.5 rounded-full ${PUNTO[grupo.estado]}`} />
                {ESTADOS[grupo.estado]} · {grupo.medidas.length}
              </h2>
              {grupo.medidas.map((medida) => (
            <Tarjeta key={medida.id} className={`flex flex-col gap-4 ${medida.estado === "hecha" || medida.estado === "descartada" ? "opacity-80" : ""}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-lg font-semibold leading-snug">{medida.titulo}</h2>
                <span className="flex flex-wrap gap-2">
                  {vencida(medida) ? <Etiqueta tono="aviso">Fecha pasada</Etiqueta> : null}
                  <Etiqueta tono={medida.estado === "hecha" ? "acento" : medida.estado === "descartada" ? "neutro" : "aviso"}>{ESTADOS[medida.estado]}</Etiqueta>
                </span>
              </div>
              {medida.descripcion ? <p className="whitespace-pre-line text-pretty text-tinta-suave">{medida.descripcion}</p> : null}
              <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <dt>
                    <UserRound size={15} aria-hidden className="text-tinta-suave" />
                    <span className="sr-only">Responsable:</span>
                  </dt>
                  <dd>{medida.responsable ?? "Sin responsable"}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt>
                    <CalendarDays size={15} aria-hidden className="text-tinta-suave" />
                    <span className="sr-only">Fecha prevista:</span>
                  </dt>
                  <dd>{medida.fecha_prevista ? fecha(medida.fecha_prevista) : "Sin fecha"}</dd>
                </div>
                {medida.campanas ? (
                  <div className="flex items-center gap-2">
                    <dt>
                      <ClipboardList size={15} aria-hidden className="text-tinta-suave" />
                      <span className="sr-only">Campaña:</span>
                    </dt>
                    <dd>{medida.campanas.nombre}</dd>
                  </div>
                ) : null}
              </dl>
              {editaPlan ? (
                <Formulario accion={cambiarEstadoMedida} className="border-t border-linea pt-4 sm:flex-row sm:items-end">
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
                <summary className="min-h-11 cursor-pointer py-3 font-medium">Historial de cambios ({medida.medida_historial.length})</summary>
                <ol className="flex flex-col gap-3 border-l border-linea-fuerte pl-4">
                  {[...medida.medida_historial].sort((a, b) => a.cuando.localeCompare(b.cuando)).map((h) => (
                    <li key={h.id}>
                      <span className="font-medium">{CAMPOS[h.campo] ?? h.campo}</span>
                      {h.campo !== "creada" ? `: de «${valor(h.campo, h.antes)}» a «${valor(h.campo, h.despues)}»` : ""}
                      <span className="block font-mono text-xs text-tinta-suave">
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
          ))}
        </div>
        {editaPlan ? (
          <Tarjeta className="flex flex-col gap-4 self-start lg:sticky lg:top-24">
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
          <p className="self-start rounded-[20px] border border-linea bg-superficie p-5 text-sm text-tinta-suave">
            El plan lo editan la empresa y su técnico de prevención. Usted puede consultarlo.
          </p>
        )}
      </div>
    </>
  );
}
