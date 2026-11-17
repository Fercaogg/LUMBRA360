import type { Metadata } from "next";
import { NOMBRE } from "@/config/marca";

export const metadata: Metadata = { title: "Lectura confirmada" };

export default function PaginaAcuseGracias() {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-12">
      <p className="text-sm font-semibold tracking-wide text-acento">{NOMBRE}</p>
      <h1 className="aparecer text-3xl font-semibold tracking-tight">Lectura confirmada</h1>
      <p className="text-pretty text-tinta-suave">Hemos guardado tu acuse con la fecha de hoy. Ya puedes cerrar esta página.</p>
    </main>
  );
}
