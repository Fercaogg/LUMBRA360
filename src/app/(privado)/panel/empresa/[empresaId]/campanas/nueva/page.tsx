import type { Metadata } from "next";
import { crearCampana } from "@/app/(privado)/acciones-evaluacion";
import { EnlaceBoton } from "@/components/ui/boton";
import { Campo, Casilla, Enviar, ErrorDeCampo, Formulario, Selector } from "@/components/ui/formulario";
import { Cabecera, EstadoVacio, Tarjeta } from "@/components/ui/piezas";
import { cargarEmpresa } from "@/lib/empresa";

export const metadata: Metadata = { title: "Nueva campaña" };

export default async function PaginaNuevaCampana({ params }: { params: Promise<{ empresaId: string }> }) {
  const { empresaId } = await params;
  const { supabase, empresa } = await cargarEmpresa(empresaId);
  const base = `/panel/empresa/${empresa.id}`;
  const [instrumentos, dimensiones] = await Promise.all([
    supabase.from("instrumentos").select("id, nombre, tipo, es_demo").eq("estado", "publicado").order("nombre"),
    supabase.from("dimensiones").select("id, nombre, grupos(count)").eq("empresa_id", empresa.id).order("nombre"),
  ]);
  const lista = instrumentos.data ?? [];

  if (lista.length === 0) {
    return (
      <>
        <Cabecera titulo="Preparar una campaña" descripcion={empresa.nombre} />
        <EstadoVacio
          titulo="No hay ningún cuestionario disponible"
          texto="Todavía no se ha publicado ningún instrumento. Cuando haya uno, podrás preparar la campaña."
          accion={<EnlaceBoton variante="secundario" href={`${base}/campanas`}>Volver</EnlaceBoton>}
        />
      </>
    );
  }

  return (
    <>
      <Cabecera titulo="Preparar una campaña" descripcion={`${empresa.nombre}. Se crea en borrador: nadie puede responder hasta que la abra.`} />
      <Tarjeta className="max-w-2xl">
        <Formulario accion={crearCampana}>
          <input type="hidden" name="empresaId" value={empresa.id} />
          <Campo etiqueta="Nombre de la campaña" name="nombre" autoComplete="off" required maxLength={160} />
          <Selector etiqueta="Cuestionario" name="instrumentoId" required>
            {lista.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre} ({i.tipo === "pulso" ? "seguimiento" : "evaluación"}){i.es_demo ? " · demo" : ""}
              </option>
            ))}
          </Selector>
          <Selector etiqueta="Cómo entra la plantilla" name="modo" defaultValue="codigos">
            <option value="codigos">Códigos de un solo uso (recomendado)</option>
            <option value="enlace">Enlace general</option>
          </Selector>
          <p className="-mt-2 text-sm text-tinta-suave">
            Los códigos se reparten al azar, sin anotar a quién. Con el enlace general una misma persona podría responder dos veces.
          </p>
          <Campo
            etiqueta="Personas invitadas (opcional)"
            name="plantilla"
            type="number"
            inputMode="numeric"
            min={1}
            max={100000}
            defaultValue={empresa.plantilla_declarada ?? ""}
            ayuda="Sirve para calcular la participación en porcentaje."
          />
          <Campo
            etiqueta="Mínimo de respuestas por grupo"
            name="minimo"
            type="number"
            inputMode="numeric"
            min={5}
            max={50}
            defaultValue={5}
            required
            ayuda="Nunca se muestran resultados por debajo de este número. No puede bajar de 5."
          />
          {(dimensiones.data ?? []).length > 0 ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Preguntar el grupo (solo seguimientos)</legend>
              <p className="text-sm text-tinta-suave">En las evaluaciones no se pregunta el grupo: la exportación no lo usa.</p>
              {(dimensiones.data ?? []).map((d) => (
                <Casilla key={d.id} etiqueta={d.nombre} name="dimensiones" value={d.id} ayuda={`${d.grupos[0]?.count ?? 0} grupos`} />
              ))}
              <ErrorDeCampo name="dimensiones" />
            </fieldset>
          ) : (
            <p className="text-sm text-tinta-suave">
              Si quiere resultados por departamento o turno, cree antes los grupos en la pestaña «Grupos».
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Enviar>Crear en borrador</Enviar>
            <EnlaceBoton variante="secundario" href={`${base}/campanas`}>
              Cancelar
            </EnlaceBoton>
          </div>
        </Formulario>
      </Tarjeta>
    </>
  );
}
