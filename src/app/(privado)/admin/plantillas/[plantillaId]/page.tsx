import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { borrarSeccionPlantilla, cambiarEstadoPlantilla, crearSeccionPlantilla, guardarPlantilla } from "@/app/(privado)/acciones-desconexion";
import { PestanasAdmin } from "@/components/panel/admin";
import { Boton, EnlaceBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, Casilla, Enviar, Formulario } from "@/components/ui/formulario";
import { Aviso, Cabecera, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { exigirAdmin } from "@/lib/acceso";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { esquemaUuid } from "@/lib/validacion";

export const metadata: Metadata = { title: "Plantilla" };

export default async function PaginaPlantilla({ params }: { params: Promise<{ plantillaId: string }> }) {
  const { plantillaId } = await params;
  await exigirAdmin();
  const id = esquemaUuid.safeParse(plantillaId);
  if (!id.success) notFound();

  const supabase = await crearClienteServidor();
  const [plantilla, secciones] = await Promise.all([
    supabase.from("politica_plantillas").select("*").eq("id", id.data).maybeSingle(),
    supabase.from("politica_plantilla_secciones").select("id, titulo, cuerpo, ayuda, orden").eq("plantilla_id", id.data).order("orden"),
  ]);
  const p = plantilla.data;
  if (!p) notFound();
  const editable = p.estado === "borrador";

  return (
    <>
      <Cabecera
        titulo={p.nombre}
        descripcion="Plantilla de política de desconexión digital."
        acciones={<EnlaceBoton variante="secundario" href="/admin/plantillas">Volver a plantillas</EnlaceBoton>}
      />
      <PestanasAdmin actual="/admin/plantillas" />
      <div className="flex flex-wrap gap-2">
        <Etiqueta tono={p.estado === "publicado" ? "acento" : "neutro"}>
          {p.estado === "borrador" ? "Borrador" : p.estado === "publicado" ? "Publicada" : "Retirada"}
        </Etiqueta>
        {p.es_demo ? <Etiqueta tono="aviso">Demo. Texto ficticio.</Etiqueta> : null}
      </div>
      {!p.es_demo && !p.revisada_juridicamente ? <Aviso>[PENDIENTE: revisión jurídica]. No se puede publicar hasta que alguien con formación jurídica la revise.</Aviso> : null}
      {!editable ? <Aviso>La plantilla ya no está en borrador. Sus secciones no se pueden modificar.</Aviso> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Datos y revisión</h2>
          <Formulario accion={guardarPlantilla}>
            <input type="hidden" name="id" value={p.id} />
            <Campo etiqueta="Nombre" name="nombre" defaultValue={p.nombre} required maxLength={160} />
            <Casilla etiqueta="Revisión jurídica hecha" name="revisada" defaultChecked={p.revisada_juridicamente} ayuda="Márcalo solo cuando el texto esté revisado." />
            <AreaTexto etiqueta="Nota de la revisión" name="nota" defaultValue={p.revision_nota ?? ""} maxLength={1000} ayuda="Quién la revisó y cuándo." />
            <Enviar>Guardar</Enviar>
          </Formulario>
        </Tarjeta>
        <Tarjeta className="flex flex-col gap-4 self-start">
          <h2 className="text-lg font-semibold">Publicación</h2>
          <p className="text-sm text-tinta-suave">Una plantilla publicada aparece en el asistente de todas las empresas. Hace falta la revisión jurídica y al menos una sección.</p>
          <Formulario accion={cambiarEstadoPlantilla}>
            <input type="hidden" name="id" value={p.id} />
            <div className="flex flex-wrap gap-2">
              {p.estado === "borrador" ? (
                <>
                  <button type="submit" name="accion" value="publicar" className="inline-flex min-h-11 items-center rounded-lg bg-acento px-4 font-medium text-white transition-colors duration-150 hover:bg-acento-fuerte active:scale-[0.98]">
                    Publicar
                  </button>
                  <button type="submit" name="accion" value="borrar" className="inline-flex min-h-11 items-center rounded-lg border border-error/40 bg-superficie px-4 font-medium text-error transition-colors duration-150 hover:bg-error-tenue active:scale-[0.98]">
                    Borrar borrador
                  </button>
                </>
              ) : null}
              {p.estado === "publicado" ? (
                <button type="submit" name="accion" value="retirar" className="inline-flex min-h-11 items-center rounded-lg border border-linea bg-superficie px-4 font-medium transition-colors duration-150 hover:border-tinta-suave active:scale-[0.98]">
                  Retirar
                </button>
              ) : null}
            </div>
          </Formulario>
        </Tarjeta>
      </div>

      <section aria-labelledby="t-secciones" className="flex flex-col gap-4">
        <h2 id="t-secciones" className="text-xl font-semibold">Secciones</h2>
        {(secciones.data ?? []).map((seccion) => (
          <Tarjeta key={seccion.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{seccion.titulo}</h3>
              {editable ? (
                <form action={borrarSeccionPlantilla}>
                  <input type="hidden" name="id" value={seccion.id} />
                  <Boton variante="peligro" type="submit" aria-label={`Borrar la sección ${seccion.titulo}`}>Borrar</Boton>
                </form>
              ) : null}
            </div>
            <p className="whitespace-pre-line text-pretty">{seccion.cuerpo || <span className="text-tinta-suave">Vacía: la empresa la redacta.</span>}</p>
            {seccion.ayuda ? <p className="text-sm text-tinta-suave">Ayuda: {seccion.ayuda}</p> : null}
          </Tarjeta>
        ))}
        {editable ? (
          <Tarjeta className="flex max-w-2xl flex-col gap-4">
            <h3 className="font-semibold">Nueva sección</h3>
            <Formulario accion={crearSeccionPlantilla}>
              <input type="hidden" name="plantillaId" value={p.id} />
              <Campo etiqueta="Título" name="titulo" required maxLength={200} />
              <AreaTexto etiqueta="Texto de partida (puede quedar vacío)" name="cuerpo" rows={6} maxLength={20000} />
              <AreaTexto etiqueta="Ayuda para quien la redacta (opcional)" name="ayuda" rows={2} maxLength={1000} />
              <Enviar variante="secundario">Añadir sección</Enviar>
            </Formulario>
          </Tarjeta>
        ) : null}
      </section>
    </>
  );
}
