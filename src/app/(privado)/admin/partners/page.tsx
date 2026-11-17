import type { Metadata } from "next";
import Link from "next/link";
import { crearPartner, invitar } from "@/app/(privado)/acciones";
import { PestanasAdmin } from "@/components/panel/admin";
import { ListaInvitaciones } from "@/components/panel/listas";
import { Campo, Enviar, Formulario, Selector } from "@/components/ui/formulario";
import { Cabecera, EstadoVacio, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { exigirAdmin } from "@/lib/acceso";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Partners" };

export default async function PaginaAdminPartners() {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const [partners, invitaciones] = await Promise.all([
    supabase.from("partners").select("id, nombre, es_demo, marca_blanca, empresas(count)").order("nombre"),
    supabase
      .from("invitaciones")
      .select("id, correo, rol")
      .eq("rol", "partner")
      .is("aceptada_el", null)
      .order("creada_el"),
  ]);
  const lista = partners.data ?? [];

  return (
    <>
      <Cabecera titulo="Partners" descripcion="Servicios de prevención ajenos y gestorías que gestionan varias empresas." />
      <PestanasAdmin actual="/admin/partners" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          {lista.length === 0 ? (
            <EstadoVacio titulo="Todavía no hay partners" texto="Crea el primero con el formulario." />
          ) : (
            <ul className="flex flex-col divide-y divide-linea overflow-hidden rounded-xl border border-linea bg-superficie">
              {lista.map((partner) => (
                <li key={partner.id}>
                  <Link href={`/panel/partner/${partner.id}`} className="flex flex-col gap-2 p-4 transition-colors duration-150 hover:bg-papel sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">{partner.nombre}</span>
                      <span className="text-sm text-tinta-suave">{partner.empresas[0]?.count ?? 0} empresas</span>
                    </span>
                    <span className="flex flex-wrap gap-2">
                      {partner.es_demo ? <Etiqueta tono="aviso">Demo</Etiqueta> : null}
                      {partner.marca_blanca ? <Etiqueta tono="acento">Marca blanca</Etiqueta> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <ListaInvitaciones invitaciones={invitaciones.data ?? []} />
        </div>
        <div className="flex flex-col gap-6">
          <Tarjeta className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Nuevo partner</h2>
            <Formulario accion={crearPartner}>
              <Campo etiqueta="Nombre" name="nombre" autoComplete="off" required maxLength={120} />
              <Enviar>Crear partner</Enviar>
            </Formulario>
          </Tarjeta>
          {lista.length > 0 ? (
            <Tarjeta className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Dar acceso a un gestor</h2>
              <Formulario accion={invitar}>
                <input type="hidden" name="rol" value="partner" />
                <Selector etiqueta="Partner" name="partnerId" required>
                  {lista.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.nombre}
                    </option>
                  ))}
                </Selector>
                <Campo etiqueta="Correo del gestor" name="correo" type="email" autoComplete="off" inputMode="email" required />
                <Enviar>Dar acceso</Enviar>
              </Formulario>
            </Tarjeta>
          ) : null}
        </div>
      </div>
    </>
  );
}
