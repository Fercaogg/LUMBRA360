import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NOMBRE } from "@/config/marca";
import { Campo, Enviar, Formulario } from "@/components/ui/formulario";
import { Aviso, Tarjeta } from "@/components/ui/piezas";
import { solicitarEnlace } from "./acciones";

export const metadata: Metadata = { title: "Acceso" };

async function AvisoEnlace({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (error !== "enlace") return null;
  return <Aviso tono="error">El enlace no es válido o ha caducado. Pide uno nuevo.</Aviso>;
}

export default function PaginaAcceso({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <Link href="/" className="self-start text-sm font-semibold tracking-wide text-acento">
        {NOMBRE}
      </Link>
      <Tarjeta className="aparecer flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Entra en tu panel</h1>
          <p className="text-pretty text-tinta-suave">
            Escribe tu correo y te enviamos un enlace de acceso. No hay contraseñas.
          </p>
        </div>
        <Suspense fallback={null}>
          <AvisoEnlace searchParams={searchParams} />
        </Suspense>
        <Formulario accion={solicitarEnlace}>
          <Campo etiqueta="Correo" name="correo" type="email" autoComplete="email" inputMode="email" required />
          <Enviar>Enviar enlace</Enviar>
        </Formulario>
      </Tarjeta>
      <p className="text-pretty text-sm text-tinta-suave">
        ¿Vienes a responder un cuestionario? No necesitas cuenta. Usa el enlace o el código que te ha dado tu empresa.
      </p>
    </main>
  );
}
