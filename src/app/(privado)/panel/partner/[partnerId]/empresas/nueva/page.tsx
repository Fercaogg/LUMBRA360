import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { crearEmpresa } from "@/app/(privado)/acciones";
import { EnlaceBoton } from "@/components/ui/boton";
import { Campo, Enviar, Formulario } from "@/components/ui/formulario";
import { Cabecera, Tarjeta } from "@/components/ui/piezas";
import { cargarPartner } from "@/lib/partner";

export const metadata: Metadata = { title: "Nueva empresa" };

export default async function PaginaNuevaEmpresa({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params;
  const { partner, esGestor } = await cargarPartner(partnerId);
  if (!esGestor) redirect(`/panel/partner/${partner.id}`);

  return (
    <>
      <Cabecera titulo="Dar de alta una empresa" descripcion={`Quedará gestionada por ${partner.nombre}.`} />
      <Tarjeta className="max-w-xl">
        <Formulario accion={crearEmpresa}>
          <input type="hidden" name="partnerId" value={partner.id} />
          <Campo etiqueta="Nombre de la empresa" name="nombre" autoComplete="off" required maxLength={160} />
          <Campo
            etiqueta="Personas en plantilla (opcional)"
            name="plantilla"
            type="number"
            inputMode="numeric"
            min={1}
            max={100000}
            ayuda="Sirve para calcular la participación en porcentaje. No se piden nombres ni correos de la plantilla."
          />
          <div className="flex flex-wrap gap-2">
            <Enviar>Dar de alta</Enviar>
            <EnlaceBoton variante="secundario" href={`/panel/partner/${partner.id}`}>
              Cancelar
            </EnlaceBoton>
          </div>
        </Formulario>
      </Tarjeta>
    </>
  );
}
