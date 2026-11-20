import Link from "next/link";
import type { ReactNode } from "react";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo } from "@/components/marca/logotipo";

// Página pública de texto: contacto y textos legales.
export function PaginaTexto({ antetitulo, titulo, entradilla, children }: { antetitulo?: string; titulo: string; entradilla?: string; children: ReactNode }) {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-[46rem] flex-1 flex-col gap-10 px-4 py-12 sm:px-8 lg:py-20">
      <EnlaceInicio className="self-start rounded-md">
        <Logotipo alto={22} decorativo />
      </EnlaceInicio>
      <header className="flex flex-col gap-3">
        {antetitulo ? <p className="font-mono text-xs uppercase tracking-[0.14em] text-tinta-suave">{antetitulo}</p> : null}
        <h1 className="text-balance text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] lg:text-[2.5rem]">{titulo}</h1>
        {entradilla ? <p className="text-pretty text-lg text-tinta-suave">{entradilla}</p> : null}
      </header>
      {children}
      <nav aria-label="Textos legales" className="flex flex-wrap gap-x-6 gap-y-2 border-t border-linea pt-6 text-sm">
        <Link href="/" className="font-medium underline underline-offset-4">Volver al inicio</Link>
        <Link href="/aviso-legal" className="text-tinta-suave hover:text-tinta">Aviso legal</Link>
        <Link href="/privacidad" className="text-tinta-suave hover:text-tinta">Privacidad</Link>
        <Link href="/cookies" className="text-tinta-suave hover:text-tinta">Cookies</Link>
      </nav>
    </main>
  );
}

// Bloque de texto legal con estilos de lectura.
export function Prosa({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 text-pretty leading-relaxed text-tinta [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_li]:pl-1 [&_strong]:font-semibold [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-linea [&_td]:py-3 [&_td]:pr-4 [&_td]:align-top [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold">
      {children}
    </div>
  );
}
