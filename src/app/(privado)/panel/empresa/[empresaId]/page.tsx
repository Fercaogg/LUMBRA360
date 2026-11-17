import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { invitar, quitarCuentaEmpresa } from "@/app/(privado)/acciones";
import { ListaInvitaciones, Pestanas } from "@/components/panel/listas";
import { Boton, EnlaceBoton } from "@/components/ui/boton";
import { Campo, Enviar, Formulario } from "@/components/ui/formulario";
import { Cabecera, EstadoVacio, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { exigirAcceso } from "@/lib/acceso";
import Link from "next/link";
import { ESTADOS_CAMPANA, pestanasEmpresa } from "@/lib/empresa";
import { urlSupabase } from "@/lib/entorno";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { esquemaUuid } from "@/lib/validacion";

export const metadata: Metadata = { title: "Empresa" };

function ListaCuentas({
  titulo,
  vacio,
  cuentas,
  empresaId,
  tipo,
}: {
  titulo: string;
  vacio: string;
  cuentas: { usuario_id: string; perfiles: { correo: string } | null }[];
  empresaId: string;
  tipo: "empresa" | "tecnico";
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-tinta-suave">{titulo}</h3>
      {cuentas.length === 0 ? (
        <p className="text-sm text-tinta-suave">{vacio}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-linea rounded-lg border border-linea">
          {cuentas.map((cuenta) => (
            <li key={cuenta.usuario_id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="break-all font-medium">{cuenta.perfiles?.correo ?? "Cuenta"}</span>
              <form action={quitarCuentaEmpresa}>
                <input type="hidden" name="empresaId" value={empresaId} />
                <input type="hidden" name="usuarioId" value={cuenta.usuario_id} />
                <input type="hidden" name="tipo" value={tipo} />
                <Boton variante="peligro" type="submit" aria-label={`Quitar el acceso de ${cuenta.perfiles?.correo ?? "esta cuenta"}`}>
                  Quitar acceso
                </Boton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function PaginaEmpresa({ params }: { params: Promise<{ empresaId: string }> }) {
  const { empresaId } = await params;
  const acceso = await exigirAcceso();
  const id = esquemaUuid.safeParse(empresaId);
  if (!id.success) notFound();

  const supabase = await crearClienteServidor();
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nombre, plantilla_declarada, es_demo, partner_id")
    .eq("id", id.data)
    .maybeSingle();
  if (!empresa) notFound();

  const gestiona =
    acceso.esAdmin ||
    acceso.partners.some((p) => p.id === empresa.partner_id && p.rol === "gestor");

  const [marca, ultimas, cuentas, tecnicos, invitaciones] = await Promise.all([
    supabase.rpc("marca_de_empresa", { p_empresa: empresa.id }),
    supabase.from("campanas").select("id, nombre, tipo, estado").eq("empresa_id", empresa.id).order("creada_el", { ascending: false }).limit(5),
    gestiona
      ? supabase.from("empresa_miembros").select("usuario_id, perfiles(correo)").eq("empresa_id", empresa.id)
      : null,
    gestiona
      ? supabase.from("tecnico_empresas").select("usuario_id, perfiles(correo)").eq("empresa_id", empresa.id)
      : null,
    gestiona
      ? supabase
          .from("invitaciones")
          .select("id, correo, rol")
          .eq("empresa_id", empresa.id)
          .is("aceptada_el", null)
          .order("creada_el")
      : null,
  ]);

  const marcaPartner = marca.data?.[0] ?? null;
  const logo = marcaPartner?.logo_ruta
    ? `${urlSupabase()}/storage/v1/object/public/marcas/${marcaPartner.logo_ruta}`
    : null;

  return (
    <>
      {marcaPartner ? (
        <p className="flex items-center gap-3 text-sm text-tinta-suave">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-8 w-auto rounded border border-linea bg-white p-0.5" />
          ) : null}
          <span>
            Servicio ofrecido por <strong className="font-semibold text-tinta">{marcaPartner.nombre}</strong>
          </span>
        </p>
      ) : null}

      <Cabecera
        titulo={empresa.nombre}
        descripcion={
          empresa.plantilla_declarada
            ? `${empresa.plantilla_declarada} personas en plantilla.`
            : "Plantilla sin indicar."
        }
        acciones={
          empresa.partner_id && gestiona ? (
            <EnlaceBoton variante="secundario" href={`/panel/partner/${empresa.partner_id}`}>
              Volver a empresas
            </EnlaceBoton>
          ) : undefined
        }
      />
      {empresa.es_demo ? (
        <p>
          <Etiqueta tono="aviso">Empresa de demostración. Sus datos son ficticios.</Etiqueta>
        </p>
      ) : null}
      <Pestanas enlaces={pestanasEmpresa(empresa.id)} actual={`/panel/empresa/${empresa.id}`} />

      {ultimas.data && ultimas.data.length > 0 ? (
        <ul className="flex flex-col divide-y divide-linea overflow-hidden rounded-xl border border-linea bg-superficie">
          {ultimas.data.map((campana) => (
            <li key={campana.id}>
              <Link href={`/panel/empresa/${empresa.id}/campanas/${campana.id}`} className="flex flex-col gap-2 p-4 transition-colors duration-150 hover:bg-papel sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium">{campana.nombre}</span>
                <span className="flex flex-wrap gap-2">
                  <Etiqueta>{campana.tipo === "pulso" ? "Seguimiento" : "Evaluación"}</Etiqueta>
                  <Etiqueta tono={campana.estado === "abierta" ? "acento" : "neutro"}>{ESTADOS_CAMPANA[campana.estado]}</Etiqueta>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EstadoVacio
          titulo="Todavía no hay campañas"
          texto="Cuando se lance la primera evaluación, aquí verás la participación y los resultados agregados. Nunca respuestas individuales."
          accion={<EnlaceBoton href={`/panel/empresa/${empresa.id}/campanas/nueva`}>Preparar una campaña</EnlaceBoton>}
        />
      )}

      {gestiona ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Tarjeta className="flex flex-col gap-5 self-start">
            <h2 className="text-lg font-semibold">Quién tiene acceso</h2>
            <ListaCuentas
              titulo="Dirección o RR. HH."
              vacio="Nadie de la empresa tiene acceso todavía."
              cuentas={cuentas?.data ?? []}
              empresaId={empresa.id}
              tipo="empresa"
            />
            <ListaCuentas
              titulo="Técnico de prevención"
              vacio="No hay técnico asignado."
              cuentas={tecnicos?.data ?? []}
              empresaId={empresa.id}
              tipo="tecnico"
            />
            <ListaInvitaciones invitaciones={invitaciones?.data ?? []} />
          </Tarjeta>
          <div className="flex flex-col gap-6">
            <Tarjeta className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Dar acceso a la empresa</h2>
              <p className="text-sm text-tinta-suave">Para dirección o RR. HH. Verán solo datos agregados de su empresa.</p>
              <Formulario accion={invitar}>
                <input type="hidden" name="rol" value="empresa" />
                <input type="hidden" name="empresaId" value={empresa.id} />
                <Campo etiqueta="Correo" name="correo" type="email" autoComplete="off" inputMode="email" required />
                <Enviar>Dar acceso</Enviar>
              </Formulario>
            </Tarjeta>
            <Tarjeta className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Asignar técnico de prevención</h2>
              <p className="text-sm text-tinta-suave">Verá esta empresa y podrá firmar sus informes.</p>
              <Formulario accion={invitar}>
                <input type="hidden" name="rol" value="tecnico" />
                <input type="hidden" name="empresaId" value={empresa.id} />
                <input type="hidden" name="partnerId" value={empresa.partner_id ?? ""} />
                <Campo etiqueta="Correo" name="correo" type="email" autoComplete="off" inputMode="email" required />
                <Enviar>Asignar</Enviar>
              </Formulario>
            </Tarjeta>
          </div>
        </div>
      ) : null}
    </>
  );
}
