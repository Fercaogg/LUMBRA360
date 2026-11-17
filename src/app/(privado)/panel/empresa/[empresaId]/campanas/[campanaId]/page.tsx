import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  anadirObservacion,
  borrarObservacion,
  cambiarEstadoCampana,
  firmarInforme,
  generarCodigos,
  prepararInforme,
  subirInforme,
} from "@/app/(privado)/acciones-evaluacion";
import { ORIGEN_INSST } from "@/config/atribucion";
import { CifraAnimada } from "@/components/movimiento/movimiento";
import { AvisoSuprimido, ResultadosPorFactor, type BloqueResultados } from "@/components/panel/resultados";
import { Boton, clasesBoton, EnlaceBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, Casilla, Enviar, Formulario, ListaDevuelta } from "@/components/ui/formulario";
import { Cabecera, EstadoVacio, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { cargarEmpresa, ESTADOS_CAMPANA, fecha } from "@/lib/empresa";
import { urlSitio } from "@/lib/entorno";
import { esquemaUuid } from "@/lib/validacion";

export const metadata: Metadata = { title: "Campaña" };

type Participacion = { respuestas: number; plantilla: number | null; porcentaje: number | null; codigos_generados: number };
type Resultados = {
  disponible: boolean;
  actual?: BloqueResultados;
  anterior?: (BloqueResultados & { campana: string }) | null;
};
type Grupo = { dimension_id: string; dimension: string; grupo_id: string; grupo: string; visible: boolean };

export default async function PaginaCampana({
  params,
  searchParams,
}: {
  params: Promise<{ empresaId: string; campanaId: string }>;
  searchParams: Promise<{ g?: string | string[] }>;
}) {
  const { empresaId, campanaId } = await params;
  const { supabase, empresa, esTecnico } = await cargarEmpresa(empresaId);
  const id = esquemaUuid.safeParse(campanaId);
  if (!id.success) notFound();

  const { data: campana } = await supabase
    .from("campanas")
    .select("*, instrumentos(nombre, es_demo, origen, export_confirmado)")
    .eq("id", id.data)
    .eq("empresa_id", empresa.id)
    .maybeSingle();
  if (!campana) notFound();

  const base = `/panel/empresa/${empresa.id}`;
  const ruta = `${base}/campanas/${campana.id}`;
  const cerrada = campana.estado === "cerrada";
  // Una evaluación (FPSICO) no se puntúa aquí: se exporta y se registra el informe que llega de fuera.
  const esEvaluacion = campana.tipo === "evaluacion";
  const esFpsico = campana.instrumentos?.origen === "insst_fpsico";

  const pedido = (await searchParams).g;
  const filtroBruto = (Array.isArray(pedido) ? pedido : pedido ? [pedido] : []).filter((v) => esquemaUuid.safeParse(v).success);

  const [participacionRpc, gruposRpc, informeFila] = await Promise.all([
    supabase.rpc("participacion_campana", { p_campana: campana.id }),
    supabase.rpc("grupos_de_campana", { p_campana: campana.id }),
    supabase
      .from("informes")
      .select("id, estado, firmante_nombre, firmado_el, documento_ruta, documento_nombre, documento_sha256, documento_subido_el")
      .eq("campana_id", campana.id)
      .maybeSingle(),
  ]);
  const participacion = participacionRpc.data as Participacion | null;
  const grupos = (gruposRpc.data ?? []) as Grupo[];
  const filtro = filtroBruto.filter((g) => grupos.some((x) => x.grupo_id === g));
  const informe = informeFila.data;

  let resultados: Resultados | null = null;
  if (cerrada && !esEvaluacion) {
    const { data } = await supabase.rpc("resultados_campana", { p_campana: campana.id, p_grupos: filtro });
    resultados = data as Resultados | null;
  }

  const observaciones = informe
    ? await supabase.from("informe_observaciones").select("id, texto, creado_el").eq("informe_id", informe.id).order("creado_el")
    : null;
  const suficientes = (participacion?.respuestas ?? 0) >= campana.minimo_grupo;

  const dimensiones = [...new Map(grupos.map((g) => [g.dimension_id, g.dimension])).entries()];
  const enlaceGeneral = campana.token_enlace ? `${urlSitio()}/responder/${campana.token_enlace}` : null;
  const recordatorio =
    `Recordatorio: el cuestionario «${campana.nombre}» sigue abierto. Responder es voluntario y anónimo: no se pide nombre ni correo. ` +
    (enlaceGeneral ? `Puede responder aquí: ${enlaceGeneral}` : `Entre en ${urlSitio()}/responder y escriba su código.`);

  return (
    <>
      <Cabecera
        titulo={campana.nombre}
        descripcion={`${empresa.nombre} · ${campana.instrumentos?.nombre ?? "Cuestionario"}`}
        acciones={<EnlaceBoton variante="secundario" href={`${base}/campanas`}>Volver a campañas</EnlaceBoton>}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Etiqueta>{campana.tipo === "pulso" ? "Seguimiento" : "Evaluación"}</Etiqueta>
        <Etiqueta tono={campana.estado === "abierta" ? "acento" : "neutro"}>{ESTADOS_CAMPANA[campana.estado]}</Etiqueta>
        {campana.instrumentos?.es_demo ? <Etiqueta tono="aviso">Cuestionario de demostración</Etiqueta> : null}
        {esFpsico ? <span className="text-sm text-tinta-suave">{ORIGEN_INSST}</span> : null}
        <span className="text-sm text-tinta-suave">
          {cerrada ? `Cerrada el ${fecha(campana.cerrada_el)}` : campana.abierta_el ? `Abierta el ${fecha(campana.abierta_el)}` : `Creada el ${fecha(campana.creada_el)}`}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Participación</h2>
          <p className="flex items-baseline gap-2">
            <span className="whitespace-nowrap font-serif text-5xl font-medium leading-none tabular-nums">
              {participacion?.porcentaje !== null && participacion?.porcentaje !== undefined ? (
                <CifraAnimada valor={participacion.porcentaje} sufijo=" %" />
              ) : (
                <CifraAnimada valor={participacion?.respuestas ?? 0} />
              )}
            </span>
            <span className="text-tinta-suave">
              {participacion?.plantilla
                ? `${participacion.respuestas} respuestas de ${participacion.plantilla} personas invitadas`
                : "respuestas recibidas"}
            </span>
          </p>
          <p className="text-sm text-tinta-suave">
            Es un recuento total. No se sabe quién ha respondido ni quién falta. Mínimo por grupo: {campana.minimo_grupo} respuestas.
          </p>
        </Tarjeta>

        {!cerrada ? (
          <Tarjeta className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{campana.estado === "borrador" ? "Abrir la campaña" : "Cerrar la campaña"}</h2>
            <p className="text-sm text-tinta-suave">
              {campana.estado === "borrador"
                ? "Al abrirla, la plantilla podrá responder. Queda registrada la fecha de apertura."
                : esEvaluacion
                  ? "Al cerrarla no admite más respuestas. Después, el técnico de prevención exporta las respuestas para tratarlas en la aplicación FPSICO."
                  : "Los resultados solo se ven con la campaña cerrada. Así nadie puede seguir cómo cambian con cada respuesta. Al cerrarla no admite más respuestas."}
            </p>
            <Formulario accion={cambiarEstadoCampana}>
              <input type="hidden" name="id" value={campana.id} />
              <input type="hidden" name="accion" value={campana.estado === "borrador" ? "abrir" : "cerrar"} />
              <Enviar variante={campana.estado === "borrador" ? "principal" : "secundario"}>
                {campana.estado === "borrador" ? "Abrir campaña" : "Cerrar campaña"}
              </Enviar>
            </Formulario>
          </Tarjeta>
        ) : null}
      </div>

      {!cerrada ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {campana.modo_acceso === "codigos" ? (
            <Tarjeta className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Códigos de un solo uso</h2>
              <p className="text-sm text-tinta-suave">
                Generados hasta ahora: {participacion?.codigos_generados ?? 0}. Repártalos al azar, impresos o en mano, sin anotar a quién da cada uno. Solo se muestran al generarlos.
              </p>
              <Formulario accion={generarCodigos}>
                <input type="hidden" name="campanaId" value={campana.id} />
                <Campo etiqueta="Cuántos códigos" name="cantidad" type="number" inputMode="numeric" min={1} max={500} defaultValue={campana.plantilla_invitada ?? 10} required />
                <Enviar variante="secundario">Generar códigos</Enviar>
                <ListaDevuelta nombreArchivo="codigos.txt" />
              </Formulario>
            </Tarjeta>
          ) : (
            <Tarjeta className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Enlace general</h2>
              {enlaceGeneral ? (
                <>
                  <p className="text-sm text-tinta-suave">Comparta este enlace con toda la plantilla por un canal común. Es el mismo para todas las personas.</p>
                  <p className="break-all rounded-lg border border-linea bg-papel p-3 font-mono text-sm">{enlaceGeneral}</p>
                </>
              ) : (
                <p className="text-sm text-tinta-suave">El enlace se crea al abrir la campaña.</p>
              )}
            </Tarjeta>
          )}
          {campana.estado === "abierta" ? (
            <Tarjeta className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Recordatorio general</h2>
              <p className="text-sm text-tinta-suave">Envíelo a toda la plantilla por su canal habitual. Nunca a personas concretas: no sabemos quién ha respondido.</p>
              <label htmlFor="recordatorio" className="sr-only">Texto del recordatorio</label>
              <textarea id="recordatorio" readOnly rows={4} defaultValue={recordatorio} className="w-full rounded-lg border border-linea bg-papel p-3 text-sm" />
            </Tarjeta>
          ) : null}
        </div>
      ) : null}

      {cerrada && !esEvaluacion ? (
        <section aria-labelledby="t-resultados" className="flex flex-col gap-4">
          <h2 id="t-resultados" className="text-xl font-semibold">Resultados por factores</h2>
          {dimensiones.length > 0 ? (
            <form method="get" action={ruta} className="flex flex-col gap-3 rounded-xl border border-linea bg-superficie p-4 sm:flex-row sm:flex-wrap sm:items-end">
              {dimensiones.map(([dimensionId, nombre]) => {
                const opciones = grupos.filter((g) => g.dimension_id === dimensionId);
                const elegido = opciones.find((g) => filtro.includes(g.grupo_id))?.grupo_id ?? "";
                return (
                  <div key={dimensionId} className="flex flex-col gap-1.5">
                    <label htmlFor={`f-${dimensionId}`} className="text-sm font-medium">{nombre}</label>
                    <select id={`f-${dimensionId}`} name="g" defaultValue={elegido} className="min-h-11 rounded-lg border border-linea bg-superficie px-3">
                      <option value="">Todos</option>
                      {opciones.map((g) => (
                        <option key={g.grupo_id} value={g.grupo_id} disabled={!g.visible}>
                          {g.grupo}
                          {g.visible ? "" : " (protegido)"}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
              <Boton variante="secundario" type="submit">Aplicar filtro</Boton>
              {filtro.length > 0 ? <EnlaceBoton variante="discreto" href={ruta}>Quitar filtro</EnlaceBoton> : null}
            </form>
          ) : null}

          {resultados?.actual?.suprimido ? <AvisoSuprimido minimo={resultados.actual.minimo ?? campana.minimo_grupo} /> : null}
          {resultados?.actual && !resultados.actual.suprimido ? (
            <>
              <p className="text-sm text-tinta-suave">
                Calculado con {resultados.actual.n} respuestas{filtro.length > 0 ? " del filtro elegido" : ""}.
                {resultados.anterior && resultados.anterior.suprimido ? ` La campaña anterior («${resultados.anterior.campana}») no tiene respuestas suficientes para comparar.` : ""}
              </p>
              <ResultadosPorFactor
                actual={resultados.actual.factores ?? []}
                anterior={resultados.anterior && !resultados.anterior.suprimido ? resultados.anterior.factores : null}
                nombreAnterior={resultados.anterior?.campana}
              />
            </>
          ) : null}
        </section>
      ) : null}

      {cerrada && esEvaluacion ? (
        <section aria-labelledby="t-puntuacion" className="flex flex-col gap-4">
          <h2 id="t-puntuacion" className="text-xl font-semibold">Resultados</h2>
          <Tarjeta className="flex flex-col gap-3">
            <p className="max-w-prose text-pretty">
              Esta plataforma no puntúa la evaluación. El técnico de prevención exporta las respuestas, las trata en la aplicación FPSICO y sube aquí el informe que genera.
            </p>
            {esTecnico ? (
              campana.instrumentos?.export_confirmado && suficientes ? (
                <div className="flex flex-col gap-2">
                  <a href={`/api/exportar/${campana.id}`} className={clasesBoton("principal", "self-start")}>
                    Exportar respuestas (.txt)
                  </a>
                  <p className="text-sm text-tinta-suave">
                    Una línea por respuesta, en orden aleatorio, sin identificador, fecha ni grupo. Cada exportación queda registrada como evidencia.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-tinta-suave">
                  {suficientes
                    ? "La exportación de este cuestionario todavía no está disponible."
                    : `Hacen falta al menos ${campana.minimo_grupo} respuestas para exportar.`}
                </p>
              )
            ) : (
              <p className="text-sm text-tinta-suave">Solo el técnico de prevención asignado puede exportar las respuestas.</p>
            )}
          </Tarjeta>
        </section>
      ) : null}

      {cerrada && esEvaluacion ? (
        <section aria-labelledby="t-informe" className="flex flex-col gap-4">
          <h2 id="t-informe" className="text-xl font-semibold">Informe</h2>
          {!informe ? (
            <EstadoVacio
              titulo="Todavía no hay informe"
              texto="Prepare el registro del informe. El técnico de prevención subirá el documento generado en la aplicación FPSICO, añadirá sus observaciones y lo firmará."
              accion={
                <Formulario accion={prepararInforme}>
                  <input type="hidden" name="campanaId" value={campana.id} />
                  <Enviar>Preparar informe</Enviar>
                </Formulario>
              }
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Tarjeta className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">Documento</h3>
                  <Etiqueta tono={informe.estado === "firmado" ? "acento" : "aviso"}>{informe.estado === "firmado" ? "Firmado" : "Pendiente de firma"}</Etiqueta>
                </div>
                {informe.documento_ruta ? (
                  <div className="flex flex-col gap-2">
                    <p className="break-all font-medium">{informe.documento_nombre}</p>
                    <p className="text-sm text-tinta-suave">Subido el {fecha(informe.documento_subido_el)}.</p>
                    <p className="break-all font-mono text-xs text-tinta-suave">SHA-256: {informe.documento_sha256}</p>
                    <a href={`/api/documentos?ruta=${encodeURIComponent(informe.documento_ruta)}`} className={clasesBoton("secundario", "self-start")}>
                      Descargar el informe
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-tinta-suave">Todavía no se ha subido el informe.</p>
                )}
                {esFpsico ? <p className="text-sm text-tinta-suave">{ORIGEN_INSST}</p> : null}
                {esTecnico && informe.estado === "borrador" ? (
                  <Formulario accion={subirInforme}>
                    <input type="hidden" name="informeId" value={informe.id} />
                    <input type="hidden" name="empresaId" value={empresa.id} />
                    <Campo
                      etiqueta={informe.documento_ruta ? "Sustituir por otro PDF" : "Informe en PDF"}
                      name="documento"
                      type="file"
                      accept="application/pdf"
                      required
                      ayuda="El informe generado en la aplicación FPSICO. Máximo 10 MB."
                      className="min-h-11 w-full rounded-lg border border-linea bg-superficie p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-acento-tenue file:px-3 file:py-1.5 file:text-acento-fuerte"
                    />
                    <Enviar variante="secundario">Subir informe</Enviar>
                  </Formulario>
                ) : null}
              </Tarjeta>

              <div className="flex flex-col gap-6">
                <Tarjeta className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold">Observaciones del técnico</h3>
                  {(observaciones?.data ?? []).length === 0 ? <p className="text-sm text-tinta-suave">Sin observaciones todavía.</p> : null}
                  <ul className="flex flex-col divide-y divide-linea">
                    {(observaciones?.data ?? []).map((o) => (
                      <li key={o.id} className="flex flex-col gap-2 py-3">
                        <p className="whitespace-pre-line text-pretty">{o.texto}</p>
                        {esTecnico && informe.estado === "borrador" ? (
                          <form action={borrarObservacion}>
                            <input type="hidden" name="id" value={o.id} />
                            <Boton variante="peligro" type="submit">Borrar observación</Boton>
                          </form>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  {esTecnico && informe.estado === "borrador" ? (
                    <Formulario accion={anadirObservacion}>
                      <input type="hidden" name="informeId" value={informe.id} />
                      <AreaTexto etiqueta="Observación" name="texto" required maxLength={4000} rows={4} />
                      <Enviar variante="secundario">Añadir observación</Enviar>
                    </Formulario>
                  ) : null}
                </Tarjeta>

                <Tarjeta className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold">Firma</h3>
                  {informe.estado === "firmado" ? (
                    <>
                      <p>
                        Registrado y firmado por <strong className="font-semibold">{informe.firmante_nombre}</strong>, técnico de prevención, el {fecha(informe.firmado_el)}.
                      </p>
                      <p className="text-sm text-tinta-suave">El documento y sus observaciones ya no se pueden modificar.</p>
                    </>
                  ) : esTecnico ? (
                    informe.documento_ruta ? (
                      <Formulario accion={firmarInforme}>
                        <input type="hidden" name="informeId" value={informe.id} />
                        <Campo etiqueta="Su nombre completo" name="nombre" autoComplete="name" required maxLength={160} />
                        <Casilla etiqueta="He revisado el informe y las observaciones" name="conforme" ayuda="Al firmar, el registro queda cerrado con fecha y ya no se puede modificar." />
                        <Enviar>Firmar informe</Enviar>
                      </Formulario>
                    ) : (
                      <p className="text-sm text-tinta-suave">Suba antes el informe en PDF.</p>
                    )
                  ) : (
                    <p className="text-tinta-suave">Pendiente de la firma del técnico de prevención asignado a esta empresa.</p>
                  )}
                </Tarjeta>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}
