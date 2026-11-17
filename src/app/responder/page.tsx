import type { Metadata } from "next";
import { NOMBRE } from "@/config/marca";
import { Campo, Enviar, Formulario } from "@/components/ui/formulario";
import { Tarjeta } from "@/components/ui/piezas";
import { irAlCuestionario } from "./acciones";

export const metadata: Metadata = { title: "Responder" };

export default function PaginaResponder() {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <p className="text-sm font-semibold tracking-wide text-acento">{NOMBRE}</p>
      <Tarjeta className="aparecer flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Responder el cuestionario</h1>
          <p className="text-pretty text-tinta-suave">Escribe el código que te ha dado tu empresa. No necesitas cuenta.</p>
        </div>
        <Formulario accion={irAlCuestionario}>
          <Campo etiqueta="Código" name="codigo" autoComplete="off" autoCapitalize="characters" spellCheck={false} required maxLength={80} />
          <Enviar>Continuar</Enviar>
        </Formulario>
      </Tarjeta>
      <p className="text-pretty text-sm text-tinta-suave">
        Es voluntario y anónimo. No se pide tu nombre ni tu correo.
      </p>
    </main>
  );
}
