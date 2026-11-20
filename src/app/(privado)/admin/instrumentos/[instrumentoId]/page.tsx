import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  borrarElementoInstrumento,
  cambiarEstadoInstrumento,
  guardarExportacion,
  crearEscala,
  crearFactor,
  crearItem,
  crearNivel,
  crearOpcion,
  guardarInstrumento,
} from "@/app/(privado)/acciones-evaluacion";
import { PestanasAdmin } from "@/components/panel/admin";
import { Boton, EnlaceBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, Casilla, Enviar, Formulario, Selector } from "@/components/ui/formulario";
import { Aviso, Cabecera, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { ORIGEN_INSST } from "@/config/atribucion";
import { exigirAdmin } from "@/lib/acceso";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { esquemaUuid, TABLAS_INSTRUMENTO } from "@/lib/validacion";

export const metadata: Metadata = { title: "Instrumento" };

const TONOS = { favorable: "Favorable", intermedio: "Intermedio", desfavorable: "Desfavorable" } as const;

function Borrar({ tabla, id, nombre }: { tabla: (typeof TABLAS_INSTRUMENTO)[number]; id: string; nombre: string }) {
  return (
    <form action={borrarElementoInstrumento}>
      <input type="hidden" name="tabla" value={tabla} />
      <input type="hidden" name="id" value={id} />
      <Boton variante="peligro" type="submit" aria-label={`Borrar ${nombre}`}>
        Borrar
      </Boton>
    </form>
  );
}

export default async function PaginaInstrumento({ params }: { params: Promise<{ instrumentoId: string }> }) {
  const { instrumentoId } = await params;
  await exigirAdmin();
  const id = esquemaUuid.safeParse(instrumentoId);
  if (!id.success) notFound();

  const supabase = await crearClienteServidor();
  const [instrumento, escalas, factores, referencia] = await Promise.all([
    supabase.from("instrumentos").select("*").eq("id", id.data).maybeSingle(),
    supabase.from("escalas").select("id, nombre, escala_opciones(id, etiqueta, valor, codigo_export)").eq("instrumento_id", id.data).order("nombre"),
    supabase
      .from("factores")
      .select("id, nombre, metodo, orden, niveles(id, etiqueta, desde, tono), items(id, enunciado, invertido, orden, escala_id, codigo_fpsico)")
      .eq("instrumento_id", id.data)
      .order("orden"),
    supabase.from("fpsico_estructura").select("posicion, codigo, pregunta, valor_max").order("posicion"),
  ]);
  const inst = instrumento.data;
  if (!inst) notFound();

  const editable = inst.estado === "borrador";
  // Una evaluación (FPSICO) no se puntúa en la plataforma: no lleva niveles ni reglas de puntuación.
  const esFpsico = inst.origen === "insst_fpsico";
  const puntua = inst.tipo === "pulso";
  const listaEscalas = escalas.data ?? [];
  const listaFactores = factores.data ?? [];
  const nombreEscala = (escalaId: string) => listaEscalas.find((e) => e.id === escalaId)?.nombre ?? "Escala";

  // Estructura FPSICO: 89 ítems numerados, cada uno con la escala de su rango (Anexo II del manual).
  const estructuraFpsico = esFpsico || inst.export_formato === "fpsico31";
  const tablaFpsico = referencia.data ?? [];
  const posicionDe = new Map(tablaFpsico.map((e) => [e.codigo, e.posicion]));
  const todosLosItems = listaFactores.flatMap((f) => f.items);
  const usados = new Set(todosLosItems.map((i) => i.codigo_fpsico).filter(Boolean));
  const libres = tablaFpsico.filter((e) => !usados.has(e.codigo));
  const valoresDeEscala = (escalaId: string) =>
    (listaEscalas.find((e) => e.id === escalaId)?.escala_opciones ?? []).map((o) => o.codigo_export ?? String(o.valor)).sort().join(",");
  const escalaMal = todosLosItems.filter((i) => {
    const ref = tablaFpsico.find((e) => e.codigo === i.codigo_fpsico);
    return ref && valoresDeEscala(i.escala_id) !== Array.from({ length: ref.valor_max }, (_, n) => String(n + 1)).join(",");
  });
  const rango = (max: number) => `1 a ${max}`;

  return (
    <>
      <Cabecera
        titulo={inst.nombre}
        descripcion={inst.tipo === "pulso" ? "Seguimiento con ítems propios. Se puntúa en la plataforma." : "Evaluación con FPSICO. No se puntúa en la plataforma."}
        acciones={<EnlaceBoton variante="secundario" href="/admin/instrumentos">Volver a instrumentos</EnlaceBoton>}
      />
      <PestanasAdmin actual="/admin/instrumentos" />

      <div className="flex flex-wrap items-center gap-2">
        <Etiqueta tono={inst.estado === "publicado" ? "acento" : "neutro"}>
          {inst.estado === "borrador" ? "Borrador" : inst.estado === "publicado" ? "Publicado" : "Retirado"}
        </Etiqueta>
        {inst.es_demo ? <Etiqueta tono="aviso">Instrumento de demostración. Textos ficticios.</Etiqueta> : null}
      </div>
      {esFpsico ? <p className="text-sm text-tinta-suave">{ORIGEN_INSST}</p> : null}
      {esFpsico && !inst.licencia_confirmada ? (
        <Aviso>[PENDIENTE: autorización escrita del INSST]. No se puede publicar ni copiar ningún ítem hasta tenerla.</Aviso>
      ) : null}
      {esFpsico && !inst.export_confirmado ? (
        <Aviso>
          Formato FPSICO 3.1 disponible según el Anexo II del manual técnico y de uso de FPSICO 4.1 (págs. 77-80). [PENDIENTE: probar una importación real en FPSICO 4.1, sobre todo sin preguntas variables]. La exportación sigue bloqueada hasta marcarlo como comprobado.
        </Aviso>
      ) : null}
      {!editable ? (
        <Aviso>Este instrumento ya no está en borrador. Sus factores, ítems, escalas y niveles no se pueden modificar.</Aviso>
      ) : null}

      {estructuraFpsico ? (
        <Tarjeta className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Estructura FPSICO</h2>
            <Etiqueta tono={todosLosItems.length === 89 && libres.length === 0 && escalaMal.length === 0 ? "acento" : "aviso"}>
              {usados.size} de 89 ítems numerados
            </Etiqueta>
          </div>
          <p className="max-w-prose text-pretty text-sm text-tinta-suave">
            FPSICO 4.1 tiene 44 preguntas y 89 ítems (manual del INSST, apartado B.3). Cada ítem lleva su número y solo admite sus valores: de 1 a 4,
            de 1 a 5 en 10h, 16a-d, 22, 26, 34a-d y 40a-d, y de 1 a 3 en 13a-d (Anexo II). La base de datos no deja publicar el cuestionario, ni
            exportar en formato FPSICO, si algo no cuadra.
          </p>
          {todosLosItems.length !== 89 ? <Aviso>Hay {todosLosItems.length} ítems. Tienen que ser exactamente 89.</Aviso> : null}
          {todosLosItems.length - usados.size > 0 ? <Aviso>{todosLosItems.length - usados.size} ítems sin número FPSICO.</Aviso> : null}
          {libres.length > 0 && libres.length < 89 ? (
            <Aviso>Faltan por cargar: {libres.map((e) => e.codigo).join(", ")}.</Aviso>
          ) : null}
          {escalaMal.length > 0 ? (
            <Aviso tono="error">La escala no cuadra con el rango de FPSICO en: {escalaMal.map((i) => i.codigo_fpsico).join(", ")}.</Aviso>
          ) : null}
        </Tarjeta>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{esFpsico ? "Datos y autorización" : "Datos"}</h2>
          <Formulario accion={guardarInstrumento}>
            <input type="hidden" name="id" value={inst.id} />
            <Campo etiqueta="Nombre" name="nombre" defaultValue={inst.nombre} required maxLength={160} />
            <AreaTexto etiqueta="Descripción" name="descripcion" defaultValue={inst.descripcion ?? ""} maxLength={1000} />
            <Campo etiqueta="Minutos estimados" name="minutos" type="number" inputMode="numeric" min={1} max={120} defaultValue={inst.minutos_estimados ?? ""} />
            {esFpsico ? (
              <>
                <Casilla
                  etiqueta="Autorización escrita del INSST recibida"
                  name="licenciaConfirmada"
                  defaultChecked={inst.licencia_confirmada}
                  ayuda="Márquelo solo cuando tenga la autorización por escrito."
                />
                <AreaTexto etiqueta="Referencia de la autorización" name="licenciaNota" defaultValue={inst.licencia_nota ?? ""} maxLength={1000} ayuda="Fecha, referencia y condiciones de uso." />
              </>
            ) : (
              <AreaTexto etiqueta="Notas internas" name="licenciaNota" defaultValue={inst.licencia_nota ?? ""} maxLength={1000} ayuda="Origen de los ítems propios y quién los ha revisado." />
            )}
            <Enviar>Guardar</Enviar>
          </Formulario>
        </Tarjeta>

        <Tarjeta className="flex flex-col gap-4 self-start">
          <h2 className="text-lg font-semibold">Publicación</h2>
          <p className="text-sm text-tinta-suave">
            {esFpsico
              ? "Para publicar hace falta la autorización escrita del INSST y la estructura FPSICO completa: 89 ítems numerados, cada uno con la escala de su rango."
              : puntua
                ? "Para publicar hace falta al menos un factor, y que cada factor tenga un ítem y un nivel. Cada escala usada necesita dos opciones o más."
                : "Para publicar hace falta al menos un ítem y escalas con dos opciones o más."}
          </p>
          <Formulario accion={cambiarEstadoInstrumento}>
            <input type="hidden" name="id" value={inst.id} />
            <div className="flex flex-wrap gap-2">
              {inst.estado === "borrador" ? (
                <>
                  <button type="submit" name="accion" value="publicar" className="inline-flex min-h-11 items-center rounded-lg bg-acento px-4 font-medium text-white transition-colors duration-150 hover:bg-acento-fuerte active:scale-[0.98]">
                    Publicar
                  </button>
                  <button type="submit" name="accion" value="borrar" className="inline-flex min-h-11 items-center rounded-lg border border-error/40 bg-superficie px-4 font-medium text-error transition-colors duration-150 hover:bg-error-tenue active:scale-[0.98]">
                    Borrar borrador
                  </button>
                </>
              ) : null}
              {inst.estado === "publicado" ? (
                <button type="submit" name="accion" value="retirar" className="inline-flex min-h-11 items-center rounded-lg border border-linea bg-superficie px-4 font-medium transition-colors duration-150 hover:border-tinta-suave active:scale-[0.98]">
                  Retirar (no admite campañas nuevas)
                </button>
              ) : null}
            </div>
          </Formulario>
        </Tarjeta>
      </div>

      {inst.tipo === "evaluacion" ? (
        <Tarjeta className="flex max-w-2xl flex-col gap-4">
          <h2 className="text-lg font-semibold">Formato de exportación (.txt)</h2>
          <p className="text-sm text-tinta-suave">
            Una línea por respuesta, en orden aleatorio, sin identificador, fecha ni grupo. Cada columna es un ítem, en el orden de abajo.
            La exportación solo se activa cuando confirmes el formato con el manual de la aplicación.
          </p>
          <Formulario accion={guardarExportacion}>
            <input type="hidden" name="id" value={inst.id} />
            <Selector etiqueta="Formato" name="formato" defaultValue={inst.export_formato}>
              <option value="fpsico31">FPSICO 3.1, importable en FPSICO 4.1 (Anexo II del manual)</option>
              <option value="personalizado">Personalizado</option>
            </Selector>
            <p className="text-sm text-tinta-suave">
              Con el formato FPSICO se ignoran separador, primera línea y fin de línea: se escriben 40 asteriscos y una línea por cuestionario con
              <code className="font-mono">{'"","","'}</code> seguido de las 89 respuestas, en CRLF. Exige exactamente 89 ítems y cuestionarios completos.
            </p>
            <Campo etiqueta="Separador entre columnas" name="separador" defaultValue={inst.export_separador} maxLength={3} ayuda="Vacío si las respuestas van seguidas, sin separador." />
            <AreaTexto etiqueta="Primera línea (opcional)" name="cabecera" defaultValue={inst.export_cabecera ?? ""} maxLength={500} rows={2} />
            <Selector etiqueta="Fin de línea" name="finLinea" defaultValue={inst.export_fin_linea}>
              <option value="crlf">Windows (CRLF)</option>
              <option value="lf">Unix (LF)</option>
            </Selector>
            <Casilla etiqueta="Formato comprobado con el manual técnico y de uso" name="confirmado" defaultChecked={inst.export_confirmado} />
            <Enviar variante="secundario">Guardar formato</Enviar>
          </Formulario>
        </Tarjeta>
      ) : null}

      <section aria-labelledby="t-escalas" className="flex flex-col gap-4">
        <h2 id="t-escalas" className="text-xl font-semibold">Escalas de respuesta</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {listaEscalas.map((escala) => (
            <Tarjeta key={escala.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{escala.nombre}</h3>
                {editable ? <Borrar tabla="escalas" id={escala.id} nombre={`la escala ${escala.nombre}`} /> : null}
              </div>
              <ul className="flex flex-col divide-y divide-linea">
                {[...escala.escala_opciones].sort((a, b) => a.valor - b.valor).map((opcion) => (
                  <li key={opcion.id} className="flex items-center justify-between gap-3 py-2">
                    <span>
                      <span className="font-mono text-sm text-tinta-suave">{opcion.valor}</span> · {opcion.etiqueta}
                      {opcion.codigo_export ? <span className="font-mono text-sm text-tinta-suave"> · exporta «{opcion.codigo_export}»</span> : null}
                    </span>
                    {editable ? <Borrar tabla="escala_opciones" id={opcion.id} nombre={`la opción ${opcion.etiqueta}`} /> : null}
                  </li>
                ))}
              </ul>
              {editable ? (
                <Formulario accion={crearOpcion}>
                  <input type="hidden" name="escalaId" value={escala.id} />
                  <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
                    <Campo etiqueta="Etiqueta de la opción" name="etiqueta" required maxLength={120} />
                    <Campo etiqueta="Valor" name="valor" type="number" step="any" required />
                  </div>
                  {inst.tipo === "evaluacion" ? (
                    <Campo etiqueta="Código en la exportación (opcional)" name="codigo" maxLength={10} ayuda="Lo que se escribe en el .txt para esta opción. Si lo deja vacío, se escribe el valor." />
                  ) : null}
                  <Enviar variante="secundario">Añadir opción</Enviar>
                </Formulario>
              ) : null}
            </Tarjeta>
          ))}
          {editable ? (
            <Tarjeta className="flex flex-col gap-3 self-start">
              <h3 className="font-semibold">Nueva escala</h3>
              <Formulario accion={crearEscala}>
                <input type="hidden" name="instrumentoId" value={inst.id} />
                <Campo etiqueta="Nombre de la escala" name="nombre" required maxLength={120} />
                <Enviar variante="secundario">Añadir escala</Enviar>
              </Formulario>
            </Tarjeta>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="t-factores" className="flex flex-col gap-4">
        <h2 id="t-factores" className="text-xl font-semibold">{puntua ? "Factores, ítems y niveles" : "Factores e ítems"}</h2>
        {!puntua ? (
          <p className="max-w-prose text-sm text-tinta-suave">
            {estructuraFpsico
              ? "El número FPSICO fija el orden del cuestionario y de las columnas en la exportación, sea cual sea el factor. Aquí no se puntúa nada."
              : "El orden de factores e ítems es el orden de las columnas en la exportación. Aquí no se puntúa nada."}
          </p>
        ) : null}
        {listaFactores.map((factor) => (
          <Tarjeta key={factor.id} className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{factor.nombre}</h3>
                {puntua ? <p className="text-sm text-tinta-suave">Puntuación: {factor.metodo === "suma" ? "suma" : "media"} de sus ítems.</p> : null}
              </div>
              {editable ? <Borrar tabla="factores" id={factor.id} nombre={`el factor ${factor.nombre}`} /> : null}
            </div>

            <div className={puntua ? "grid gap-6 lg:grid-cols-2" : "grid gap-6"}>
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-tinta-suave">Ítems</h4>
                <ol className="flex flex-col divide-y divide-linea">
                  {[...factor.items]
                    .sort((a, b) => (posicionDe.get(a.codigo_fpsico ?? "") ?? 1000 + a.orden) - (posicionDe.get(b.codigo_fpsico ?? "") ?? 1000 + b.orden))
                    .map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-3 py-2">
                      <span className="flex flex-col gap-0.5">
                        <span>
                          {item.codigo_fpsico ? <span className="font-mono text-sm text-tinta-suave">{item.codigo_fpsico} · </span> : null}
                          {item.enunciado}
                        </span>
                        <span className="text-sm text-tinta-suave">
                          {nombreEscala(item.escala_id)}
                          {puntua && item.invertido ? " · puntuación invertida" : ""}
                        </span>
                      </span>
                      {editable ? <Borrar tabla="items" id={item.id} nombre="el ítem" /> : null}
                    </li>
                  ))}
                </ol>
                {editable && listaEscalas.length > 0 ? (
                  <Formulario accion={crearItem}>
                    <input type="hidden" name="instrumentoId" value={inst.id} />
                    <input type="hidden" name="factorId" value={factor.id} />
                    {estructuraFpsico ? (
                      <Selector etiqueta="Número en FPSICO" name="codigoFpsico" required>
                        {libres.map((e) => (
                          <option key={e.codigo} value={e.codigo}>
                            {e.codigo} (pregunta {e.pregunta}, respuestas de {rango(e.valor_max)})
                          </option>
                        ))}
                      </Selector>
                    ) : null}
                    <AreaTexto etiqueta="Enunciado del ítem" name="enunciado" required maxLength={600} rows={2} />
                    <Selector etiqueta="Escala" name="escalaId" required>
                      {listaEscalas.map((escala) => (
                        <option key={escala.id} value={escala.id}>
                          {escala.nombre}
                        </option>
                      ))}
                    </Selector>
                    {puntua ? <Casilla etiqueta="Puntuación invertida" name="invertido" /> : null}
                    <Enviar variante="secundario">Añadir ítem</Enviar>
                  </Formulario>
                ) : null}
                {editable && listaEscalas.length === 0 ? (
                  <p className="text-sm text-tinta-suave">Cree antes una escala de respuesta.</p>
                ) : null}
              </div>

              {puntua ? (
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-tinta-suave">Niveles</h4>
                <ul className="flex flex-col divide-y divide-linea">
                  {[...factor.niveles].sort((a, b) => a.desde - b.desde).map((nivel) => (
                    <li key={nivel.id} className="flex items-center justify-between gap-3 py-2">
                      <span>
                        {nivel.etiqueta} <span className="text-sm text-tinta-suave">· desde {nivel.desde} · {TONOS[nivel.tono]}</span>
                      </span>
                      {editable ? <Borrar tabla="niveles" id={nivel.id} nombre={`el nivel ${nivel.etiqueta}`} /> : null}
                    </li>
                  ))}
                </ul>
                {editable ? (
                  <Formulario accion={crearNivel}>
                    <input type="hidden" name="factorId" value={factor.id} />
                    <Campo etiqueta="Etiqueta del nivel" name="etiqueta" required maxLength={80} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Campo etiqueta="Desde la puntuación" name="desde" type="number" step="any" required ayuda="Se aplica desde este valor hasta el siguiente nivel." />
                      <Selector etiqueta="Color" name="tono" defaultValue="intermedio">
                        <option value="favorable">Favorable</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="desfavorable">Desfavorable</option>
                      </Selector>
                    </div>
                    <Enviar variante="secundario">Añadir nivel</Enviar>
                  </Formulario>
                ) : null}
              </div>
              ) : null}
            </div>
          </Tarjeta>
        ))}
        {editable ? (
          <Tarjeta className="flex max-w-xl flex-col gap-3">
            <h3 className="font-semibold">Nuevo factor</h3>
            <Formulario accion={crearFactor}>
              <input type="hidden" name="instrumentoId" value={inst.id} />
              <Campo etiqueta="Nombre del factor" name="nombre" required maxLength={160} />
              {puntua ? (
                <Selector etiqueta="Regla de puntuación" name="metodo" defaultValue="media">
                  <option value="media">Media de los ítems</option>
                  <option value="suma">Suma de los ítems</option>
                </Selector>
              ) : (
                <input type="hidden" name="metodo" value="media" />
              )}
              <Enviar variante="secundario">Añadir factor</Enviar>
            </Formulario>
          </Tarjeta>
        ) : null}
      </section>
    </>
  );
}
