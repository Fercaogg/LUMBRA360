import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { aprobarPolitica, descartarBorrador, guardarPolitica } from "@/app/(privado)/acciones-desconexion";
import { Boton, EnlaceBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, Casilla, Enviar, Formulario } from "@/components/ui/formulario";
import { Aviso, Cabecera, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { cargarEmpresa, fecha } from "@/lib/empresa";
import { esquemaUuid } from "@/lib/validacion";

export const metadata: Metadata = { title: "Política de desconexión digital" };

type Seccion = { titulo: string; cuerpo: string; ayuda?: string | null };

export default async function PaginaPolitica({ params }: { params: Promise<{ empresaId: string; politicaId: string }> }) {
  const { empresaId, politicaId } = await params;
  const { supabase, empresa, editaPlan } = await cargarEmpresa(empresaId);
  const id = esquemaUuid.safeParse(politicaId);
  if (!id.success) notFound();

  const { data: politica } = await supabase
    .from("politicas")
    .select("id, version, estado, secciones, aprobada_nombre, aprobada_el, politica_plantillas(nombre, es_demo)")
    .eq("id", id.data)
    .eq("empresa_id", empresa.id)
    .maybeSingle();
  if (!politica) notFound();

  const secciones = (politica.secciones ?? []) as Seccion[];
  const enBorrador = politica.estado === "borrador";
  const volver = `/panel/empresa/${empresa.id}/desconexion`;

  return (
    <>
      <Cabecera
        titulo={`Política de desconexión digital · versión ${politica.version}`}
        descripcion={empresa.nombre}
        acciones={<EnlaceBoton variante="secundario" href={volver}>Volver</EnlaceBoton>}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Etiqueta tono={enBorrador ? "aviso" : "acento"}>{enBorrador ? "Borrador" : "Aprobada"}</Etiqueta>
        {politica.politica_plantillas ? <span className="text-sm text-tinta-suave">Plantilla: {politica.politica_plantillas.nombre}</span> : null}
      </div>
      {politica.politica_plantillas?.es_demo ? (
        <Aviso>Esta versión parte de una plantilla de demostración. Su texto es ficticio y no sirve para uso real.</Aviso>
      ) : null}

      {enBorrador && editaPlan ? (
        <>
          <Formulario accion={guardarPolitica} className="gap-6">
            <input type="hidden" name="politicaId" value={politica.id} />
            <input type="hidden" name="total" value={secciones.length} />
            {secciones.map((seccion, i) => (
              <Tarjeta key={i} className="flex flex-col gap-4">
                <Campo etiqueta={`Título de la sección ${i + 1}`} name={`titulo_${i}`} defaultValue={seccion.titulo} required maxLength={200} />
                {seccion.ayuda ? <input type="hidden" name={`ayuda_${i}`} value={seccion.ayuda} /> : null}
                <AreaTexto
                  etiqueta="Texto"
                  name={`cuerpo_${i}`}
                  defaultValue={seccion.cuerpo}
                  rows={8}
                  maxLength={20000}
                  ayuda={seccion.ayuda ?? undefined}
                />
              </Tarjeta>
            ))}
            <Enviar>Guardar borrador</Enviar>
          </Formulario>

          <div className="grid gap-6 lg:grid-cols-2">
            <Tarjeta className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Aprobar esta versión</h2>
              <p className="text-sm text-tinta-suave">
                Guarda antes los cambios. Al aprobarla queda cerrada con fecha y ya no se puede modificar. Para cambiarla después, se prepara una nueva versión.
              </p>
              <Formulario accion={aprobarPolitica}>
                <input type="hidden" name="politicaId" value={politica.id} />
                <Campo etiqueta="Nombre y cargo de quien aprueba" name="nombre" required maxLength={160} />
                <Casilla etiqueta="He revisado el texto completo" name="conforme" />
                <Enviar>Aprobar</Enviar>
              </Formulario>
            </Tarjeta>
            <Tarjeta className="flex flex-col gap-4 self-start">
              <h2 className="text-lg font-semibold">Descartar el borrador</h2>
              <p className="text-sm text-tinta-suave">Se borra esta versión en borrador. Las versiones aprobadas no cambian.</p>
              <form action={descartarBorrador}>
                <input type="hidden" name="politicaId" value={politica.id} />
                <input type="hidden" name="empresaId" value={empresa.id} />
                <Boton variante="peligro" type="submit">Descartar borrador</Boton>
              </form>
            </Tarjeta>
          </div>
        </>
      ) : (
        <article className="flex flex-col gap-6 rounded-xl border border-linea bg-superficie p-5 sm:p-8">
          {!enBorrador ? (
            <p className="text-sm text-tinta-suave">
              Aprobada el {fecha(politica.aprobada_el)} por {politica.aprobada_nombre}.
            </p>
          ) : null}
          {secciones.map((seccion, i) => (
            <section key={i} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{seccion.titulo}</h2>
              <p className="whitespace-pre-line text-pretty">{seccion.cuerpo || "Sin texto todavía."}</p>
            </section>
          ))}
        </article>
      )}
    </>
  );
}
