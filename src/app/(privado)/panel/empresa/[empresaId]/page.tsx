import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { invitar, quitarCuentaEmpresa } from "@/app/(privado)/acciones";
import { ListaInvitaciones } from "@/components/panel/listas";
import { Boton, EnlaceBoton } from "@/components/ui/boton";
import { Campo, Enviar, Formulario } from "@/components/ui/formulario";
import { Cabecera, Etiqueta, Tarjeta } from "@/components/ui/piezas";
import { exigirAcceso } from "@/lib/acceso";
import Link from "next/link";
import { ArrowRight, BellOff, ClipboardList, FileCheck2, ListChecks, type LucideIcon } from "lucide-react";
import { ESTADOS_CAMPANA, fecha } from "@/lib/empresa";
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

function Indicador({
  icono: I,
  etiqueta,
  valor,
  nota,
  progreso,
  href,
}: {
  icono: LucideIcon;
  etiqueta: string;
  valor: string;
  nota: string;
  progreso?: number;
  href?: string;
}) {
  const contenido = (
    <>
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-tinta-suave">{etiqueta}</span>
        <span aria-hidden className="grid size-9 place-items-center rounded-lg bg-papel text-tinta-suave transition-colors group-hover:bg-[var(--lumbre-50)] group-hover:text-[var(--lumbre-600)]">
          <I size={17} strokeWidth={1.75} />
        </span>
      </span>
      <span className="text-[1.75rem] font-medium leading-none tracking-[-0.03em] tabular-nums">{valor}</span>
      {progreso !== undefined ? (
        <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-papel">
          <span className="block h-full rounded-full bg-[var(--correcto-solido)]" style={{ width: `${Math.round(progreso * 100)}%` }} />
        </span>
      ) : null}
      <span className="text-sm text-tinta-suave">{nota}</span>
    </>
  );
  const clases = "group flex h-full flex-col gap-3 rounded-[20px] border border-linea bg-superficie p-4 sm:p-5 transition-[border-color,box-shadow] duration-300";
  return (
    <li>
      {href ? (
        <Link href={href} className={`${clases} hover:border-linea-fuerte hover:shadow-[var(--sombra-2)]`}>
          {contenido}
        </Link>
      ) : (
        <div className={clases}>{contenido}</div>
      )}
    </li>
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

  const soloLectura = acceso.esVisor;
  const [marca, ultimas, cuentas, tecnicos, invitaciones, medidas, politicas, evidencias] = await Promise.all([
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
    supabase.from("medidas").select("estado").eq("empresa_id", empresa.id),
    supabase.from("politicas").select("id, version, estado, aprobada_el, acuses(count)").eq("empresa_id", empresa.id).order("version", { ascending: false }),
    supabase.from("evidencias").select("id, titulo, ocurrido_el", { count: "exact" }).eq("empresa_id", empresa.id).order("ocurrido_el", { ascending: false }).limit(5),
  ]);

  const base = `/panel/empresa/${empresa.id}`;
  const campanas = ultimas.data ?? [];
  const listaMedidas = medidas.data ?? [];
  const hechas = listaMedidas.filter((m) => m.estado === "hecha").length;
  const pendientes = listaMedidas.filter((m) => m.estado === "pendiente" || m.estado === "en_curso").length;
  const aprobada = (politicas.data ?? []).find((p) => p.estado === "aprobada");
  const acuses = (aprobada?.acuses as unknown as { count: number }[] | undefined)?.[0]?.count ?? 0;
  const abierta = campanas.find((c) => c.estado === "abierta");
  const seguimientoCerrado = campanas.find((c) => c.estado === "cerrada" && c.tipo === "pulso");

  const siguiente = soloLectura
    ? seguimientoCerrado
      ? { titulo: "Empiece por los resultados", texto: "Vea cómo se muestran los resultados por grupos sin exponer a nadie.", href: `${base}/campanas/${seguimientoCerrado.id}`, accion: "Ver resultados" }
      : { titulo: "Recorra las secciones", texto: "Use el menú para ver campañas, plan de acción y desconexión digital.", href: `${base}/campanas`, accion: "Ver campañas" }
    : campanas.length === 0
      ? { titulo: "Prepare su primera campaña", texto: "Un seguimiento breve es la forma más rápida de saber cómo está la plantilla.", href: `${base}/campanas/nueva`, accion: "Preparar campaña" }
      : abierta
        ? { titulo: "Hay una campaña abierta", texto: `«${abierta.nombre}» está recogiendo respuestas. Ciérrela para ver los resultados.`, href: `${base}/campanas/${abierta.id}`, accion: "Abrir campaña" }
        : pendientes > 0
          ? { titulo: `${pendientes} ${pendientes === 1 ? "medida pendiente" : "medidas pendientes"}`, texto: "Revise el plan de acción y actualice el estado de cada medida.", href: `${base}/plan`, accion: "Ir al plan" }
          : !aprobada
            ? { titulo: "Apruebe la política de desconexión", texto: "Prepárela desde una plantilla, apruébela y pida el acuse de lectura.", href: `${base}/desconexion`, accion: "Empezar" }
            : { titulo: "Todo al día", texto: "No hay tareas pendientes. Cuando quiera, lance un nuevo seguimiento.", href: `${base}/campanas`, accion: "Ver campañas" };

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
        antetitulo="Resumen"
        titulo={empresa.nombre}
        descripcion={
          empresa.plantilla_declarada
            ? `${empresa.plantilla_declarada} personas en plantilla.${empresa.es_demo ? " Empresa de demostración: sus datos son ficticios." : ""}`
            : "Plantilla sin indicar."
        }
        acciones={
          empresa.partner_id && gestiona && !soloLectura ? (
            <EnlaceBoton variante="secundario" href={`/panel/partner/${empresa.partner_id}`} className="lg:hidden">
              Todas las empresas
            </EnlaceBoton>
          ) : undefined
        }
      />

      <Link
        href={siguiente.href}
        className="group flex flex-col gap-4 rounded-[24px] bg-tinta p-6 text-[var(--texto-sobre-marca)] transition-transform duration-300 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <span className="flex items-start gap-4">
          <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-lumbre text-[var(--tinta-950)]">
            <ArrowRight size={20} />
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--lumbre-300)]">Siguiente paso</span>
            <span className="text-xl font-semibold">{siguiente.titulo}</span>
            <span className="max-w-[60ch] text-pretty text-[var(--tinta-200)]">{siguiente.texto}</span>
          </span>
        </span>
        <span className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full bg-[var(--texto-sobre-marca)] px-5 font-medium text-[var(--tinta-950)] sm:self-auto">
          {siguiente.accion}
          <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Indicador icono={ClipboardList} etiqueta="Campañas" valor={String(campanas.length)} nota={abierta ? "1 abierta ahora" : "Ninguna abierta"} href={`${base}/campanas`} />
        <Indicador
          icono={ListChecks}
          etiqueta="Plan de acción"
          valor={listaMedidas.length ? `${hechas}/${listaMedidas.length}` : "0"}
          nota={listaMedidas.length ? `${pendientes} por hacer` : "Sin medidas"}
          progreso={listaMedidas.length ? hechas / listaMedidas.length : undefined}
          href={`${base}/plan`}
        />
        <Indicador
          icono={BellOff}
          etiqueta="Desconexión"
          valor={aprobada ? `Versión ${aprobada.version}` : "Sin aprobar"}
          nota={aprobada ? `${acuses} ${acuses === 1 ? "acuse" : "acuses"} de lectura` : "Política pendiente"}
          href={`${base}/desconexion`}
        />
        <Indicador icono={FileCheck2} etiqueta="Evidencias" valor={String(evidencias.count ?? 0)} nota="Registradas con fecha" />
      </ul>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Tarjeta className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Campañas recientes</h2>
            <Link href={`${base}/campanas`} className="text-sm font-medium text-tinta-suave hover:text-tinta">
              Ver todas
            </Link>
          </div>
          {campanas.length > 0 ? (
            <ul className="-mx-2 flex flex-col">
              {campanas.map((campana) => (
                <li key={campana.id}>
                  <Link href={`${base}/campanas/${campana.id}`} className="flex flex-col gap-2 rounded-xl px-2 py-3 transition-colors hover:bg-papel sm:flex-row sm:items-center sm:justify-between">
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
            <p className="text-sm text-tinta-suave">Todavía no hay campañas.</p>
          )}
        </Tarjeta>
        <Tarjeta className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Actividad reciente</h2>
          {(evidencias.data ?? []).length > 0 ? (
            <ol className="relative flex flex-col gap-4 border-l border-linea-fuerte pl-5">
              {(evidencias.data ?? []).map((e) => (
                <li key={e.id} className="relative flex flex-col gap-0.5">
                  <span aria-hidden className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full border-2 border-lumbre bg-superficie" />
                  <span className="text-sm font-medium leading-snug">{e.titulo}</span>
                  <span className="font-mono text-xs text-tinta-suave">{fecha(e.ocurrido_el)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-tinta-suave">Cada paso que se registre aparecerá aquí con su fecha.</p>
          )}
        </Tarjeta>
      </div>

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
