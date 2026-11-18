import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { NavegacionEmpresa } from "@/components/panel/navegacion-empresa";
import { cargarEmpresa } from "@/lib/empresa";

// Espacio de trabajo de una empresa: barra lateral con la empresa y sus secciones.
export default async function DisposicionEmpresa({ children, params }: LayoutProps<"/panel/empresa/[empresaId]">) {
  const { empresaId } = await params;
  const { empresa, gestiona, acceso } = await cargarEmpresa(empresaId);
  const inicial = empresa.nombre.trim().charAt(0).toUpperCase();

  return (
    <div className="grid gap-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-12">
      <aside className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-tinta text-lg font-semibold text-[var(--texto-sobre-marca)]">
              {inicial}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-semibold leading-snug" title={empresa.nombre}>
                {empresa.nombre}
              </span>
              <span className="text-xs text-tinta-suave">
                {empresa.plantilla_declarada ? `${empresa.plantilla_declarada} personas` : "Plantilla sin indicar"}
                {empresa.es_demo ? " · demo" : ""}
              </span>
            </span>
          </div>
          <Suspense fallback={null}>
            <NavegacionEmpresa empresaId={empresa.id} />
          </Suspense>
          <div className="flex gap-3 rounded-2xl border border-linea bg-superficie p-4 text-sm">
            <ShieldCheck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--correcto-solido)]" aria-hidden />
            <p className="text-pretty text-tinta-suave">
              <span className="font-semibold text-tinta">Anonimato protegido.</span> Ningún resultado se muestra con menos de 5 respuestas.
            </p>
          </div>
          {gestiona && empresa.partner_id && !acceso.esVisor ? (
            <Link href={`/panel/partner/${empresa.partner_id}`} className="inline-flex items-center gap-2 text-sm font-medium text-tinta-suave hover:text-tinta">
              <ArrowLeft size={16} aria-hidden /> Todas las empresas
            </Link>
          ) : null}
        </div>
      </aside>
      <div className="flex min-w-0 flex-col gap-8">
        <Suspense fallback={null}>
          <NavegacionEmpresa empresaId={empresa.id} movil />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
