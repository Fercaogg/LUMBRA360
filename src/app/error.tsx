"use client";

import { Boton } from "@/components/ui/boton";

export default function ErrorGeneral({ retry }: { error: Error; retry: () => void }) {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16">
      <h1 className="font-serif text-3xl font-medium leading-tight tracking-tight">Algo ha fallado</h1>
      <p className="text-pretty text-tinta-suave">No hemos podido cargar esta pantalla. Sus datos no se han modificado.</p>
      <Boton onClick={() => retry()}>Volver a intentarlo</Boton>
    </main>
  );
}
