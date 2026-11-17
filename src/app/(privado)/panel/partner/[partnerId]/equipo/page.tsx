import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { invitar } from "@/app/(privado)/acciones";
import { ListaInvitaciones, Pestanas } from "@/components/panel/listas";
import { Campo, Enviar, Formulario, Selector } from "@/components/ui/formulario";
import { Cabecera, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { cargarPartner, pestanasPartner } from "@/lib/partner";

export const metadata: Metadata = { title: "Equipo" };

export default async function PaginaEquipo({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params;
  const { supabase, partner, esGestor } = await cargarPartner(partnerId);
  const base = `/panel/partner/${partner.id}`;
  if (!esGestor) redirect(base);

  const [miembros, invitaciones] = await Promise.all([
    supabase.from("partner_miembros").select("usuario_id, rol, perfiles(correo)").eq("partner_id", partner.id),
    supabase
      .from("invitaciones")
      .select("id, correo, rol")
      .eq("partner_id", partner.id)
      .is("empresa_id", null)
      .is("aceptada_el", null)
      .order("creada_el"),
  ]);

  return (
    <>
      <Cabecera titulo="Equipo" descripcion="Personas de su organización con acceso al panel." />
      <Pestanas enlaces={pestanasPartner(partner.id, esGestor)} actual={`${base}/equipo`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Con acceso</h2>
          <ul className="flex flex-col divide-y divide-linea">
            {(miembros.data ?? []).map((m) => (
              <li key={m.usuario_id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="break-all">{m.perfiles?.correo ?? "Cuenta"}</span>
                <Etiqueta tono={m.rol === "gestor" ? "acento" : "neutro"}>
                  {m.rol === "gestor" ? "Gestor" : "Técnico de prevención"}
                </Etiqueta>
              </li>
            ))}
          </ul>
          <ListaInvitaciones invitaciones={invitaciones.data ?? []} />
        </Tarjeta>
        <Tarjeta className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Dar acceso</h2>
          <p className="text-sm text-tinta-suave">
            Un gestor ve todas las empresas del partner. Un técnico solo ve las que se le asignan desde cada empresa.
          </p>
          <Formulario accion={invitar}>
            <input type="hidden" name="partnerId" value={partner.id} />
            <Campo etiqueta="Correo" name="correo" type="email" autoComplete="off" inputMode="email" required />
            <Selector etiqueta="Función" name="rol" defaultValue="partner">
              <option value="partner">Gestor</option>
              <option value="tecnico">Técnico de prevención</option>
            </Selector>
            <Enviar>Dar acceso</Enviar>
          </Formulario>
        </Tarjeta>
      </div>
    </>
  );
}
