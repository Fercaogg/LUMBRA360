import type { Metadata } from "next";
import Link from "next/link";
import { cambiarAcuse, iniciarPolitica, registrarAudiencia, registrarFormacion } from "@/app/(privado)/acciones-desconexion";
import { EnlaceBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, Enviar, Formulario, Selector } from "@/components/ui/formulario";
import { Cabecera, EstadoVacio, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { cargarEmpresa, fecha } from "@/lib/empresa";
import { urlSitio } from "@/lib/entorno";

export const metadata: Metadata = { title: "Desconexión digital" };

const CLASE_ARCHIVO =
  "min-h-11 w-full rounded-lg border border-linea bg-superficie p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-acento-tenue file:px-3 file:py-1.5 file:text-acento-fuerte";

function EnlaceDocumento({ ruta, nombre }: { ruta: string | null; nombre: string | null }) {
  if (!ruta) return null;
  return (
    <a href={`/api/documentos?ruta=${encodeURIComponent(ruta)}`} className="text-sm font-medium text-acento underline-offset-4 hover:underline">
      Descargar {nombre ?? "documento"}
    </a>
  );
}

export default async function PaginaDesconexion({ params }: { params: Promise<{ empresaId: string }> }) {
  const { empresaId } = await params;
  const { supabase, empresa, editaPlan } = await cargarEmpresa(empresaId);
  const base = `/panel/empresa/${empresa.id}`;

  const [politicas, plantillas, audiencias, formaciones] = await Promise.all([
    supabase
      .from("politicas")
      .select("id, version, estado, aprobada_nombre, aprobada_el, token_acuse, creada_el, politica_plantillas(nombre, es_demo), acuses(id, nombre, registrado_el)")
      .eq("empresa_id", empresa.id)
      .order("version", { ascending: false }),
    supabase.from("politica_plantillas").select("id, nombre, es_demo").eq("estado", "publicado").order("nombre"),
    supabase.from("audiencias").select("id, fecha, asistentes, notas, acta_ruta, acta_nombre, creada_el, politicas(version)").eq("empresa_id", empresa.id).order("fecha", { ascending: false }),
    supabase.from("formaciones").select("id, titulo, fecha, descripcion, participantes, documento_ruta, documento_nombre").eq("empresa_id", empresa.id).order("fecha", { ascending: false }),
  ]);

  const versiones = politicas.data ?? [];
  const borrador = versiones.find((p) => p.estado === "borrador");
  const vigente = versiones.find((p) => p.estado === "aprobada");
  const aprobadas = versiones.filter((p) => p.estado === "aprobada");

  return (
    <>
      <Cabecera
        titulo="Desconexión digital"
        descripcion="Política interna, audiencia a la representación de las personas trabajadoras, acuse de lectura y formación. Cada registro queda con fecha y autor."
      />
      {!editaPlan ? (
        <p className="rounded-xl border border-linea bg-superficie p-4 text-sm text-tinta-suave">
          Esta sección la editan la empresa y su técnico de prevención. Usted puede consultarla.
        </p>
      ) : null}

      <section aria-labelledby="t-politica" className="flex flex-col gap-4">
        <h2 id="t-politica" className="text-xl font-semibold">Política interna</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Tarjeta className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Versiones</h3>
            {versiones.length === 0 ? <p className="text-sm text-tinta-suave">Todavía no hay ninguna versión de la política.</p> : null}
            <ul className="flex flex-col divide-y divide-linea">
              {versiones.map((v) => (
                <li key={v.id}>
                  <Link href={`${base}/desconexion/politica/${v.id}`} className="flex flex-col gap-1 py-3 transition-colors duration-150 hover:text-acento sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex flex-col">
                      <span className="font-medium">Versión {v.version}</span>
                      <span className="text-sm text-tinta-suave">
                        {v.estado === "aprobada" ? `Aprobada el ${fecha(v.aprobada_el)} por ${v.aprobada_nombre}` : `Borrador desde el ${fecha(v.creada_el)}`}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-2">
                      {v.politica_plantillas?.es_demo ? <Etiqueta tono="aviso">Plantilla demo</Etiqueta> : null}
                      <Etiqueta tono={v.estado === "aprobada" ? "acento" : "aviso"}>{v.estado === "aprobada" ? "Aprobada" : "Borrador"}</Etiqueta>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Tarjeta>

          {editaPlan ? (
            <Tarjeta className="flex flex-col gap-4 self-start">
              {borrador ? (
                <>
                  <h3 className="text-lg font-semibold">Borrador en curso</h3>
                  <p className="text-sm text-tinta-suave">Tiene la versión {borrador.version} en borrador. Complétela y apruébela.</p>
                  <EnlaceBoton href={`${base}/desconexion/politica/${borrador.id}`} className="self-start">Seguir editando</EnlaceBoton>
                </>
              ) : (plantillas.data ?? []).length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold">Redactar la política</h3>
                  <p className="text-sm text-tinta-suave">Todavía no hay ninguna plantilla disponible.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{vigente ? "Preparar una nueva versión" : "Redactar la política"}</h3>
                  <p className="text-sm text-tinta-suave">El asistente parte de una plantilla editable. Adáptela a su organización antes de aprobarla.</p>
                  <Formulario accion={iniciarPolitica}>
                    <input type="hidden" name="empresaId" value={empresa.id} />
                    <Selector etiqueta="Plantilla" name="plantillaId" required>
                      {(plantillas.data ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                          {p.es_demo ? " · demo, no válida para uso real" : ""}
                        </option>
                      ))}
                    </Selector>
                    <Enviar>Empezar</Enviar>
                  </Formulario>
                </>
              )}
            </Tarjeta>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="t-acuse" className="flex flex-col gap-4">
        <h2 id="t-acuse" className="text-xl font-semibold">Acuse de lectura</h2>
        {aprobadas.length === 0 ? (
          <EstadoVacio titulo="Todavía no hay política aprobada" texto="El acuse de lectura se pide sobre una versión aprobada." />
        ) : (
          aprobadas.map((v) => (
            <Tarjeta key={v.id} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">Versión {v.version}</h3>
                <Etiqueta tono={v.token_acuse ? "acento" : "neutro"}>{v.token_acuse ? "Acuse abierto" : "Acuse cerrado"}</Etiqueta>
              </div>
              <p className="text-sm text-tinta-suave">
                El acuse es nominal: cada persona escribe su nombre al confirmar la lectura. Se guarda aparte y no tiene ninguna relación con los cuestionarios anónimos.
              </p>
              {v.token_acuse ? (
                <p className="break-all rounded-lg border border-linea bg-papel p-3 font-mono text-sm">{`${urlSitio()}/acuse/${v.token_acuse}`}</p>
              ) : null}
              {editaPlan ? (
                <Formulario accion={cambiarAcuse}>
                  <input type="hidden" name="politicaId" value={v.id} />
                  <input type="hidden" name="accion" value={v.token_acuse ? "cerrar" : "abrir"} />
                  <Enviar variante="secundario">{v.token_acuse ? "Cerrar el acuse" : "Abrir el acuse de lectura"}</Enviar>
                </Formulario>
              ) : null}
              <details className="text-sm">
                <summary className="min-h-11 cursor-pointer py-3 font-medium text-acento">Acuses registrados ({v.acuses.length})</summary>
                {v.acuses.length === 0 ? (
                  <p className="text-tinta-suave">Ninguno todavía.</p>
                ) : (
                  <ul className="flex flex-col divide-y divide-linea">
                    {[...v.acuses].sort((a, b) => a.registrado_el.localeCompare(b.registrado_el)).map((a) => (
                      <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                        <span>{a.nombre}</span>
                        <span className="text-tinta-suave">{fecha(a.registrado_el)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            </Tarjeta>
          ))
        )}
      </section>

      <section aria-labelledby="t-audiencia" className="flex flex-col gap-4">
        <h2 id="t-audiencia" className="text-xl font-semibold">Audiencia a la representación de las personas trabajadoras</h2>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-3">
            {(audiencias.data ?? []).length === 0 ? <EstadoVacio titulo="Sin audiencias registradas" texto="Registre la fecha, quién asistió y adjunte el acta." /> : null}
            {(audiencias.data ?? []).map((a) => (
              <Tarjeta key={a.id} className="flex flex-col gap-2">
                <h3 className="font-semibold">
                  {fecha(a.fecha)}
                  {a.politicas ? <span className="font-normal text-tinta-suave"> · versión {a.politicas.version}</span> : null}
                </h3>
                <p className="whitespace-pre-line text-sm">
                  <span className="text-tinta-suave">Asistentes: </span>
                  {a.asistentes}
                </p>
                {a.notas ? <p className="whitespace-pre-line text-sm text-tinta-suave">{a.notas}</p> : null}
                <EnlaceDocumento ruta={a.acta_ruta} nombre={a.acta_nombre ? `el acta (${a.acta_nombre})` : "el acta"} />
              </Tarjeta>
            ))}
          </div>
          {editaPlan ? (
            <Tarjeta className="flex flex-col gap-4 self-start">
              <h3 className="text-lg font-semibold">Registrar audiencia</h3>
              <Formulario accion={registrarAudiencia}>
                <input type="hidden" name="empresaId" value={empresa.id} />
                <Campo etiqueta="Fecha" name="fecha" type="date" required />
                <AreaTexto etiqueta="Asistentes" name="asistentes" required maxLength={4000} ayuda="Nombre y cargo de cada asistente." />
                <Selector etiqueta="Versión de la política (opcional)" name="politicaId" defaultValue="">
                  <option value="">Ninguna</option>
                  {versiones.map((v) => (
                    <option key={v.id} value={v.id}>
                      Versión {v.version}
                    </option>
                  ))}
                </Selector>
                <AreaTexto etiqueta="Notas (opcional)" name="notas" maxLength={4000} />
                <Campo etiqueta="Acta en PDF (opcional)" name="acta" type="file" accept="application/pdf" ayuda="Máximo 10 MB." className={CLASE_ARCHIVO} />
                <Enviar>Registrar audiencia</Enviar>
              </Formulario>
              <p className="text-sm text-tinta-suave">Una vez registrada no se puede modificar ni borrar.</p>
            </Tarjeta>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="t-formacion" className="flex flex-col gap-4">
        <h2 id="t-formacion" className="text-xl font-semibold">Formación y sensibilización</h2>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-3">
            {(formaciones.data ?? []).length === 0 ? <EstadoVacio titulo="Sin formaciones registradas" texto="Registre las sesiones de formación o sensibilización." /> : null}
            {(formaciones.data ?? []).map((f) => (
              <Tarjeta key={f.id} className="flex flex-col gap-2">
                <h3 className="font-semibold">{f.titulo}</h3>
                <p className="text-sm text-tinta-suave">
                  {fecha(f.fecha)}
                  {f.participantes ? ` · ${f.participantes} participantes` : ""}
                </p>
                {f.descripcion ? <p className="whitespace-pre-line text-sm">{f.descripcion}</p> : null}
                <EnlaceDocumento ruta={f.documento_ruta} nombre={f.documento_nombre} />
              </Tarjeta>
            ))}
          </div>
          {editaPlan ? (
            <Tarjeta className="flex flex-col gap-4 self-start">
              <h3 className="text-lg font-semibold">Registrar formación</h3>
              <Formulario accion={registrarFormacion}>
                <input type="hidden" name="empresaId" value={empresa.id} />
                <Campo etiqueta="Título" name="titulo" required maxLength={200} />
                <Campo etiqueta="Fecha" name="fecha" type="date" required />
                <Campo etiqueta="Participantes (opcional)" name="participantes" type="number" inputMode="numeric" min={1} max={100000} ayuda="Solo el número. No hace falta una lista de nombres." />
                <AreaTexto etiqueta="Descripción (opcional)" name="descripcion" maxLength={4000} />
                <Campo etiqueta="Material o registro en PDF (opcional)" name="documento" type="file" accept="application/pdf" className={CLASE_ARCHIVO} />
                <Enviar>Registrar formación</Enviar>
              </Formulario>
            </Tarjeta>
          ) : null}
        </div>
      </section>
    </>
  );
}
