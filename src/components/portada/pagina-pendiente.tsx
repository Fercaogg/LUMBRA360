import Link from "next/link";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo } from "@/components/marca/logotipo";

// Página pública sencilla para contenidos que aún no están confirmados.
export function PaginaPendiente({ titulo, texto, nota }: { titulo: string; texto?: string; nota: string }) {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-[44rem] flex-1 flex-col gap-8 px-6 py-16 sm:px-8 lg:py-24">
      <EnlaceInicio className="self-start rounded-md">
        <Logotipo alto={22} decorativo />
      </EnlaceInicio>
      <div className="flex flex-col gap-4">
        <h1 className="text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] lg:text-[2.5rem]">{titulo}</h1>
        {texto ? <p className="text-pretty text-lg text-tinta-suave">{texto}</p> : null}
        <p className="rounded-[12px] border border-dashed border-linea-fuerte bg-papel p-4 text-sm text-tinta-suave">{nota}</p>
      </div>
      <Link href="/" className="self-start text-sm font-medium underline underline-offset-4">
        Volver al inicio
      </Link>
    </main>
  );
}
