import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  borrarElementoInstrumento,
  cambiarEstadoInstrumento,
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
  const [instrumento, escalas, factores] = await Promise.all([
    supabase.from("instrumentos").select("*").eq("id", id.data).maybeSingle(),
    supabase.from("escalas").select("id, nombre, escala_opciones(id, etiqueta, valor)").eq("instrumento_id", id.data).order("nombre"),
    supabase
      .from("factores")
      .select("id, nombre, metodo, orden, niveles(id, etiqueta, desde, tono), items(id, enunciado, invertido, orden, escala_id)")
      .eq("instrumento_id", id.data)
      .order("orden"),
  ]);
  const inst = instrumento.data;
  if (!inst) notFound();

  const editable = inst.estado === "borrador";
  const listaEscalas = escalas.data ?? [];
  const listaFactores = factores.data ?? [];
  const nombreEscala = (escalaId: string) => listaEscalas.find((e) => e.id === escalaId)?.nombre ?? "Escala";

  return (
    <>
      <Cabecera
        titulo={inst.nombre}
        descripcion={inst.tipo === "pulso" ? "Pulso breve." : "Evaluación."}
        acciones={<EnlaceBoton variante="secundario" href="/admin/instrumentos">Volver a instrumentos</EnlaceBoton>}
      />
      <PestanasAdmin actual="/admin/instrumentos" />

      <div className="flex flex-wrap items-center gap-2">
        <Etiqueta tono={inst.estado === "publicado" ? "acento" : "neutro"}>
          {inst.estado === "borrador" ? "Borrador" : inst.estado === "publicado" ? "Publicado" : "Retirado"}
        </Etiqueta>
        {inst.es_demo ? <Etiqueta tono="aviso">Instrumento de demostración. Textos ficticios.</Etiqueta> : null}
      </div>
      {!inst.es_demo && !inst.licencia_confirmada ? (
        <Aviso>[PENDIENTE: instrumento y licencia por confirmar]. No se puede publicar hasta confirmarlo.</Aviso>
      ) : null}
      {!editable ? (
        <Aviso>Este instrumento ya no está en borrador. Sus factores, ítems, escalas y niveles no se pueden modificar.</Aviso>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Datos y licencia</h2>
          <Formulario accion={guardarInstrumento}>
            <input type="hidden" name="id" value={inst.id} />
            <Campo etiqueta="Nombre" name="nombre" defaultValue={inst.nombre} required maxLength={160} />
            <AreaTexto etiqueta="Descripción" name="descripcion" defaultValue={inst.descripcion ?? ""} maxLength={1000} />
            <Campo etiqueta="Minutos estimados" name="minutos" type="number" inputMode="numeric" min={1} max={120} defaultValue={inst.minutos_estimados ?? ""} />
            <Casilla
              etiqueta="Instrumento y licencia confirmados"
              name="licenciaConfirmada"
              defaultChecked={inst.licencia_confirmada}
              ayuda="Márcalo solo cuando tengas derecho a usar este instrumento."
            />
            <AreaTexto etiqueta="Nota sobre la licencia" name="licenciaNota" defaultValue={inst.licencia_nota ?? ""} maxLength={1000} ayuda="Fuente, titular y condiciones." />
            <Enviar>Guardar</Enviar>
          </Formulario>
        </Tarjeta>

        <Tarjeta className="flex flex-col gap-4 self-start">
          <h2 className="text-lg font-semibold">Publicación</h2>
          <p className="text-sm text-tinta-suave">
            Para publicar hace falta al menos un factor, y que cada factor tenga un ítem y un nivel. Cada escala usada necesita dos opciones o más.
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
        <h2 id="t-factores" className="text-xl font-semibold">Factores, ítems y niveles</h2>
        {listaFactores.map((factor) => (
          <Tarjeta key={factor.id} className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{factor.nombre}</h3>
                <p className="text-sm text-tinta-suave">Puntuación: {factor.metodo === "suma" ? "suma" : "media"} de sus ítems.</p>
              </div>
              {editable ? <Borrar tabla="factores" id={factor.id} nombre={`el factor ${factor.nombre}`} /> : null}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-tinta-suave">Ítems</h4>
                <ol className="flex flex-col divide-y divide-linea">
                  {[...factor.items].sort((a, b) => a.orden - b.orden).map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-3 py-2">
                      <span className="flex flex-col gap-0.5">
                        <span>{item.enunciado}</span>
                        <span className="text-sm text-tinta-suave">
                          {nombreEscala(item.escala_id)}
                          {item.invertido ? " · puntuación invertida" : ""}
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
                    <AreaTexto etiqueta="Enunciado del ítem" name="enunciado" required maxLength={600} rows={2} />
                    <Selector etiqueta="Escala" name="escalaId" required>
                      {listaEscalas.map((escala) => (
                        <option key={escala.id} value={escala.id}>
                          {escala.nombre}
                        </option>
                      ))}
                    </Selector>
                    <Casilla etiqueta="Puntuación invertida" name="invertido" />
                    <Enviar variante="secundario">Añadir ítem</Enviar>
                  </Formulario>
                ) : null}
                {editable && listaEscalas.length === 0 ? (
                  <p className="text-sm text-tinta-suave">Crea antes una escala de respuesta.</p>
                ) : null}
              </div>

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
            </div>
          </Tarjeta>
        ))}
        {editable ? (
          <Tarjeta className="flex max-w-xl flex-col gap-3">
            <h3 className="font-semibold">Nuevo factor</h3>
            <Formulario accion={crearFactor}>
              <input type="hidden" name="instrumentoId" value={inst.id} />
              <Campo etiqueta="Nombre del factor" name="nombre" required maxLength={160} />
              <Selector etiqueta="Regla de puntuación" name="metodo" defaultValue="media">
                <option value="media">Media de los ítems</option>
                <option value="suma">Suma de los ítems</option>
              </Selector>
              <Enviar variante="secundario">Añadir factor</Enviar>
            </Formulario>
          </Tarjeta>
        ) : null}
      </section>
    </>
  );
}
