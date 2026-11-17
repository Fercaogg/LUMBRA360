import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LEMA, NOMBRE } from "@/config/marca";
import { Logotipo, Simbolo } from "@/components/marca/logotipo";
import { Campo, Enviar, Formulario } from "@/components/ui/formulario";
import { Aviso } from "@/components/ui/piezas";
import { solicitarEnlace } from "./acciones";

export const metadata: Metadata = { title: "Acceso" };

async function AvisoEnlace({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (error !== "enlace") return null;
  return <Aviso tono="error">El enlace no es válido o ha caducado. Pida uno nuevo.</Aviso>;
}

export default function PaginaAcceso({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <main id="contenido" className="grid flex-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Lado de marca: solo en pantallas anchas */}
      <section aria-hidden className="relative hidden flex-col justify-between overflow-hidden bg-marca p-12 text-sobre-marca lg:flex">
        <Logotipo variante="negativo" alto={28} decorativo className="self-start" />
        <div className="relative z-10 flex flex-col gap-4">
          <p className="max-w-[12ch] text-balance font-serif text-5xl leading-[1.05] tracking-tight text-white">{LEMA}</p>
          <p className="max-w-[40ch] text-pretty text-sobre-marca/75">
            Evaluación psicosocial, desconexión digital y evidencias fechadas, en un solo lugar.
          </p>
        </div>
        <p className="relative z-10 text-xs text-sobre-marca/60">Herramienta independiente de apoyo al técnico de prevención.</p>
        <Simbolo tamano={560} color="rgb(255 255 255 / 0.05)" className="pointer-events-none absolute -bottom-24 -right-40" />
      </section>

      <section className="flex items-center justify-center px-4 py-12">
        <div className="aparecer flex w-full max-w-sm flex-col gap-6">
          <Link href="/" aria-label={`${NOMBRE}, inicio`} className="self-start rounded-md">
            <Simbolo tamano={44} color="var(--lumbre)" />
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-4xl leading-tight tracking-tight">Acceda a su panel</h1>
            <p className="text-pretty text-tinta-suave">Escriba su correo y le enviaremos un enlace de acceso. No necesita contraseña.</p>
          </div>
          <Suspense fallback={null}>
            <AvisoEnlace searchParams={searchParams} />
          </Suspense>
          <Formulario accion={solicitarEnlace}>
            <Campo etiqueta="Correo electrónico" name="correo" type="email" autoComplete="email" inputMode="email" placeholder="nombre@empresa.es" required />
            <Enviar ancho>Enviar enlace</Enviar>
          </Formulario>
          <p className="text-pretty text-sm text-tinta-suave">
            ¿Viene a responder un cuestionario? No necesita cuenta: use el enlace o el código que le ha dado su empresa.
          </p>
        </div>
      </section>
    </main>
  );
}
