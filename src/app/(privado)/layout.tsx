import Link from "next/link";
import { Suspense } from "react";
import { NOMBRE } from "@/config/marca";
import { Boton } from "@/components/ui/boton";
import { Cargando } from "@/components/ui/piezas";
import { obtenerAcceso } from "@/lib/acceso";
import { salir } from "@/app/acceso/acciones";

export const metadata = { robots: { index: false, follow: false } };

async function Sesion() {
  const acceso = await obtenerAcceso();
  if (!acceso) return null;
  return (
    <div className="flex items-center gap-3">
      {acceso.esAdmin ? (
        <Link href="/admin" className="rounded-md px-2 py-2 text-sm font-medium text-acento underline-offset-4 hover:underline">
          Administración
        </Link>
      ) : null}
      <span className="hidden max-w-56 truncate text-sm text-tinta-suave sm:inline" title={acceso.usuario.correo}>
        {acceso.usuario.correo}
      </span>
      <form action={salir}>
        <Boton variante="secundario" type="submit">
          Salir
        </Boton>
      </form>
    </div>
  );
}

export default function DisposicionPrivada({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-linea bg-superficie">
        <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/panel" className="rounded-md py-2 text-sm font-semibold tracking-wide text-acento">
            {NOMBRE}
          </Link>
          <Suspense fallback={null}>
            <Sesion />
          </Suspense>
        </div>
      </header>
      <main id="contenido" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:py-10">
        <Suspense fallback={<Cargando />}>{children}</Suspense>
      </main>
    </>
  );
}
