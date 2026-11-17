import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardarMarca } from "@/app/(privado)/acciones";
import { Pestanas } from "@/components/panel/listas";
import { Campo, Casilla, Enviar, Formulario } from "@/components/ui/formulario";
import { Cabecera, Tarjeta } from "@/components/ui/piezas";
import { urlSupabase } from "@/lib/entorno";
import { cargarPartner, pestanasPartner } from "@/lib/partner";

export const metadata: Metadata = { title: "Marca" };

export default async function PaginaMarca({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params;
  const { partner, esGestor } = await cargarPartner(partnerId);
  const base = `/panel/partner/${partner.id}`;
  if (!esGestor) redirect(base);

  const logo = partner.marca_logo_ruta
    ? `${urlSupabase()}/storage/v1/object/public/marcas/${partner.marca_logo_ruta}`
    : null;

  return (
    <>
      <Cabecera
        titulo="Marca"
        descripcion="Si activa la marca blanca, sus empresas verán su nombre y su logo en el panel."
      />
      <Pestanas enlaces={pestanasPartner(partner.id, esGestor)} actual={`${base}/marca`} />
      <Tarjeta className="max-w-xl">
        <Formulario accion={guardarMarca}>
          <input type="hidden" name="partnerId" value={partner.id} />
          <Casilla
            etiqueta="Activar marca blanca"
            name="marcaBlanca"
            defaultChecked={partner.marca_blanca}
            ayuda="Puede desactivarla cuando quiera."
          />
          <Campo
            etiqueta="Nombre que verán sus empresas"
            name="marcaNombre"
            defaultValue={partner.marca_nombre ?? ""}
            maxLength={80}
            ayuda={`Si lo deja vacío se usa "${partner.nombre}".`}
          />
          {logo ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Logo actual</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={`Logo de ${partner.marca_nombre ?? partner.nombre}`} className="h-12 w-auto self-start rounded border border-linea bg-white p-1" />
            </div>
          ) : null}
          <Campo
            etiqueta={logo ? "Cambiar logo" : "Logo"}
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            ayuda="PNG, JPG o WebP. Máximo 512 KB."
            className="min-h-11 w-full rounded-lg border border-linea bg-superficie p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-acento-tenue file:px-3 file:py-1.5 file:text-acento-fuerte"
          />
          <Enviar>Guardar marca</Enviar>
        </Formulario>
      </Tarjeta>
    </>
  );
}
