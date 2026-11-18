import type { Metadata } from "next";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo } from "@/components/marca/logotipo";
import { Campo, Enviar, Formulario } from "@/components/ui/formulario";
import { Tarjeta } from "@/components/ui/piezas";
import { irAlCuestionario } from "./acciones";

export const metadata: Metadata = { title: "Responder" };

export default function PaginaResponder() {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <EnlaceInicio className="self-start rounded-md">
        <Logotipo alto={26} decorativo />
      </EnlaceInicio>
      <Tarjeta className="aparecer flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-medium leading-tight tracking-tight">Responder el cuestionario</h1>
          <p className="text-pretty text-tinta-suave">Escriba el código que le ha dado su empresa. No necesita cuenta.</p>
        </div>
        <Formulario accion={irAlCuestionario}>
          <Campo etiqueta="Código" name="codigo" autoComplete="off" autoCapitalize="characters" spellCheck={false} required maxLength={80} />
          <Enviar>Continuar</Enviar>
        </Formulario>
      </Tarjeta>
      <p className="text-pretty text-sm text-tinta-suave">
        Es voluntario y anónimo. No se pide su nombre ni su correo.
      </p>
    </main>
  );
}
