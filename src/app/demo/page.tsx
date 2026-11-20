import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, Smartphone } from "lucide-react";
import { NOMBRE } from "@/config/marca";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo } from "@/components/marca/logotipo";

export const metadata: Metadata = {
  title: "Demostración",
  description: `Recorra ${NOMBRE} con datos ficticios: el panel de la empresa o el cuestionario que responde la plantilla.`,
};

const OPCIONES = [
  {
    // Enlace normal, sin precarga: /demo/panel abre una sesión al visitarlo.
    href: "/demo/panel",
    precargar: false,
    icono: LayoutDashboard,
    etiqueta: "Empresa y técnico",
    titulo: "El panel",
    texto: "Campañas, resultados por grupos, plan de acción, desconexión digital y evidencias. Puede recorrerlo todo; no se guarda ningún cambio.",
    accion: "Entrar al panel",
  },
  {
    href: "/demo/cuestionario",
    precargar: true,
    icono: Smartphone,
    etiqueta: "Persona trabajadora",
    titulo: "El cuestionario",
    texto: "Lo que ve la plantilla al responder desde el móvil: código, aviso de anonimato y preguntas. Sus respuestas no se guardan.",
    accion: "Ver el cuestionario",
  },
];

export default function PaginaDemo() {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-[56rem] flex-1 flex-col gap-10 px-4 py-12 sm:px-8 lg:py-20">
      <EnlaceInicio className="self-start rounded-md">
        <Logotipo alto={22} decorativo />
      </EnlaceInicio>
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-tinta-suave">Demostración</p>
        <h1 className="text-balance text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] lg:text-[2.5rem]">¿Qué quiere ver?</h1>
        <p className="max-w-[40rem] text-pretty text-lg text-tinta-suave">
          {NOMBRE} tiene dos caras: el panel que usan la empresa y su técnico de prevención, y el cuestionario anónimo que responde la plantilla. Todos los datos son
          ficticios.
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2">
        {OPCIONES.map(({ href, precargar, icono: I, etiqueta, titulo, texto, accion }) => {
          const contenido = (
            <>
              <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-papel text-tinta transition-colors group-hover:bg-lumbre group-hover:text-[var(--tinta-950)]">
                <I size={22} strokeWidth={1.75} />
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-tinta-suave">{etiqueta}</span>
                <span className="text-2xl font-medium tracking-[-0.02em]">{titulo}</span>
                <span className="text-pretty text-tinta-suave">{texto}</span>
              </span>
              <span className="mt-auto inline-flex items-center gap-2 font-medium">
                {accion}
                <ArrowRight aria-hidden size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
            </>
          );
          const clases =
            "group flex h-full flex-col gap-6 rounded-[24px] border border-linea bg-superficie p-6 transition-[border-color,box-shadow] duration-200 hover:border-tinta hover:shadow-[var(--sombra-1)] sm:p-8";
          return (
            <li key={href}>
              {precargar ? (
                <Link href={href} className={clases}>
                  {contenido}
                </Link>
              ) : (
                <a href={href} className={clases}>
                  {contenido}
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-tinta-suave">
        ¿Prefiere que se lo enseñemos?{" "}
        <Link href="/contacto" className="font-medium text-tinta underline underline-offset-4">
          Solicite una demostración guiada
        </Link>
      </p>
    </main>
  );
}
