import type { Metadata } from "next";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo } from "@/components/marca/logotipo";

export const metadata: Metadata = { title: "Lectura confirmada" };

export default function PaginaAcuseGracias() {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-12">
      <EnlaceInicio className="self-start rounded-md">
        <Logotipo alto={26} decorativo />
      </EnlaceInicio>
      <h1 className="aparecer font-serif text-3xl font-medium leading-tight tracking-tight">Lectura confirmada</h1>
      <p className="text-pretty text-tinta-suave">Hemos guardado su acuse con la fecha de hoy. Ya puede cerrar esta página.</p>
    </main>
  );
}
