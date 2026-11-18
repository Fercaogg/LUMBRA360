import Link from "next/link";
import { Suspense } from "react";
import { LogOut, Sparkles } from "lucide-react";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo } from "@/components/marca/logotipo";
import { Cargando } from "@/components/ui/piezas";
import { obtenerAcceso } from "@/lib/acceso";
import { salir } from "@/app/acceso/acciones";

export const metadata = { robots: { index: false, follow: false } };

const ENLACE = "inline-flex min-h-10 items-center rounded-full px-3.5 text-sm font-medium text-tinta-suave transition-colors hover:bg-papel hover:text-tinta";

async function Sesion() {
  const acceso = await obtenerAcceso();
  if (!acceso) return null;
  const inicial = acceso.esVisor ? "D" : acceso.usuario.correo.charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link href="/panel" className={ENLACE}>
        Panel
      </Link>
      {acceso.esAdmin ? (
        <Link href="/admin" className={`${ENLACE} hidden sm:inline-flex`}>
          Administración
        </Link>
      ) : null}
      <span className="mx-1 hidden h-6 w-px bg-linea sm:block" aria-hidden />
      {acceso.esVisor ? (
        <span className="hidden items-center gap-1.5 rounded-full bg-[var(--lumbre-50)] px-3 py-1 text-xs font-semibold text-[var(--lumbre-700)] ring-1 ring-inset ring-[var(--lumbre-200)] sm:inline-flex">
          <Sparkles size={12} aria-hidden /> Demostración
        </span>
      ) : (
        <span
          title={acceso.usuario.correo}
          className="hidden size-9 place-items-center rounded-full bg-tinta text-sm font-semibold text-[var(--texto-sobre-marca)] sm:grid"
        >
          {inicial}
          <span className="sr-only">Sesión de {acceso.usuario.correo}</span>
        </span>
      )}
      <form action={salir}>
        <button type="submit" className={`${ENLACE} gap-1.5`}>
          <LogOut size={16} aria-hidden />
          Salir
        </button>
      </form>
    </div>
  );
}

async function AvisoDemo() {
  const acceso = await obtenerAcceso();
  if (!acceso?.esVisor) return null;
  return (
    <div className="border-b border-[var(--lumbre-200)] bg-[var(--lumbre-50)]">
      <p className="mx-auto w-full max-w-[1264px] px-4 py-2.5 text-sm text-[var(--lumbre-800)] sm:px-8">
        Está viendo una demostración con datos ficticios. Puede recorrer todo, pero no guardar cambios.{" "}
        <Link href="/contacto" className="font-semibold underline underline-offset-4">
          Pedir una demostración guiada
        </Link>
      </p>
    </div>
  );
}

export default function DisposicionPrivada({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-papel">
      <header className="sticky top-0 z-30 border-b border-linea bg-superficie/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 w-full max-w-[1264px] items-center justify-between gap-4 px-4 sm:px-8">
          <EnlaceInicio className="rounded-md py-2">
            <Logotipo alto={22} decorativo />
          </EnlaceInicio>
          <Suspense fallback={null}>
            <Sesion />
          </Suspense>
        </div>
      </header>
      <Suspense fallback={null}>
        <AvisoDemo />
      </Suspense>
      <main id="contenido" className="mx-auto flex w-full max-w-[1264px] flex-1 flex-col px-4 py-8 sm:px-8 sm:py-12">
        <Suspense fallback={<Cargando />}>{children}</Suspense>
      </main>
    </div>
  );
}
