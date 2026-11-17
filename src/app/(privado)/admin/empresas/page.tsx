import type { Metadata } from "next";
import { crearEmpresa } from "@/app/(privado)/acciones";
import { PestanasAdmin } from "@/components/panel/admin";
import { ListaEmpresas } from "@/components/panel/listas";
import { Campo, Enviar, Formulario, Selector } from "@/components/ui/formulario";
import { Cabecera, EstadoVacio, Tarjeta } from "@/components/ui/piezas";
import { exigirAdmin } from "@/lib/acceso";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Empresas" };

export default async function PaginaAdminEmpresas() {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const [empresas, partners] = await Promise.all([
    supabase.from("empresas").select("id, nombre, plantilla_declarada, es_demo, partners(nombre)").order("nombre"),
    supabase.from("partners").select("id, nombre").order("nombre"),
  ]);
  const lista = (empresas.data ?? []).map((e) => ({ ...e, partner: e.partners?.nombre ?? "Venta directa" }));

  return (
    <>
      <Cabecera titulo="Empresas" descripcion="Todas las empresas, con partner o en venta directa." />
      <PestanasAdmin actual="/admin/empresas" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {lista.length === 0 ? (
          <EstadoVacio titulo="Todavía no hay empresas" texto="Dé de alta la primera con el formulario." />
        ) : (
          <ListaEmpresas empresas={lista} />
        )}
        <Tarjeta className="flex flex-col gap-4 self-start">
          <h2 className="text-lg font-semibold">Nueva empresa</h2>
          <Formulario accion={crearEmpresa}>
            <Campo etiqueta="Nombre de la empresa" name="nombre" autoComplete="off" required maxLength={160} />
            <Campo etiqueta="Personas en plantilla (opcional)" name="plantilla" type="number" inputMode="numeric" min={1} max={100000} />
            <Selector etiqueta="Partner" name="partnerId" defaultValue="">
              <option value="">Sin partner (venta directa)</option>
              {(partners.data ?? []).map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.nombre}
                </option>
              ))}
            </Selector>
            <Enviar>Dar de alta</Enviar>
          </Formulario>
        </Tarjeta>
      </div>
    </>
  );
}
