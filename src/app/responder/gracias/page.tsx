import type { Metadata } from "next";
import { Logotipo } from "@/components/marca/logotipo";

export const metadata: Metadata = { title: "Gracias" };

export default function PaginaGracias() {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-12">
      <Logotipo alto={26} />
      <h1 className="aparecer font-serif text-3xl font-medium leading-tight tracking-tight">Gracias. Su respuesta se ha guardado.</h1>
      <p className="text-pretty text-tinta-suave">
        Se ha guardado sin su nombre ni su correo. Su empresa solo verá resultados agrupados. Ya puede cerrar esta página.
      </p>
    </main>
  );
}
