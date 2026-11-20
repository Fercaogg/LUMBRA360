import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, EyeOff, Lock, Sparkles } from "lucide-react";
import { NOMBRE } from "@/config/marca";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo } from "@/components/marca/logotipo";

export const metadata: Metadata = {
  title: "Demostración",
  description: `Recorra ${NOMBRE} con datos ficticios: el panel de la empresa o el cuestionario que responde la plantilla.`,
};

// Maqueta del panel: dibujada con el estilo actual, sin datos reales.
function MiniPanel() {
  const barras = [
    { ancho: "22%", color: "bg-[#c0392b]" },
    { ancho: "39%", color: "bg-[#d4911f]" },
    { ancho: "39%", color: "bg-[#2e8b57]" },
  ];
  return (
    <div aria-hidden className="demo-vista overflow-hidden rounded-[14px] bg-superficie shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/10">
      <div className="flex items-center gap-1.5 border-b border-linea bg-papel px-3 py-2">
        <span className="size-2 rounded-full bg-[var(--piedra-300)]" />
        <span className="size-2 rounded-full bg-[var(--piedra-300)]" />
        <span className="size-2 rounded-full bg-[var(--piedra-300)]" />
        <span className="ml-3 h-2 w-24 rounded-full bg-linea" />
      </div>
      <div className="grid grid-cols-[4.5rem_1fr] gap-3 p-3 sm:grid-cols-[5.5rem_1fr]">
        <div className="flex flex-col gap-2 pt-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`relative h-2 rounded-full ${i === 1 ? "w-full bg-tinta" : "w-4/5 bg-linea"}`}>
              {i === 1 ? <span className="absolute -left-2 top-0 h-2 w-0.5 rounded-full bg-lumbre" /> : null}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="h-2.5 w-2/3 rounded-full bg-tinta" />
          <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-[10px] border border-linea p-2.5">
            <svg viewBox="0 0 36 36" className="size-11 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--linea)" strokeWidth="4" />
              <circle className="demo-anillo" cx="18" cy="18" r="15" fill="none" stroke="var(--lumbre)" strokeWidth="4" strokeLinecap="round" pathLength={100} strokeDasharray="75 100" />
            </svg>
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.7rem] font-semibold tabular-nums text-tinta">75 % de participación</span>
              <span className="h-1.5 w-4/5 rounded-full bg-linea" />
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-[10px] border border-linea p-2.5">
            <span className="h-1.5 w-1/2 rounded-full bg-tinta/80" />
            <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
              {barras.map((b, i) => (
                <span key={i} className={`demo-barra ${b.color}`} style={{ width: b.ancho, animationDelay: `${i * 120}ms` }} />
              ))}
            </div>
            <div className="flex gap-1.5">
              <span className="rounded-full bg-papel px-2 py-0.5 text-[0.6rem] text-tinta-suave ring-1 ring-linea">Área 1</span>
              <span className="rounded-full bg-papel px-2 py-0.5 text-[0.6rem] text-tinta-suave ring-1 ring-linea">Área 2</span>
              <span className="rounded-full bg-[var(--lumbre-50)] px-2 py-0.5 text-[0.6rem] text-[var(--lumbre-700)] ring-1 ring-[var(--lumbre-200)]">Protegido</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-[10px] border border-linea p-2.5">
            <span className="text-[0.62rem] font-semibold text-tinta">Plan de acción</span>
            {[true, false].map((hecha, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className={`grid size-3.5 shrink-0 place-items-center rounded-full ${hecha ? "bg-lumbre" : "border border-[var(--piedra-400)]"}`}>
                  {hecha ? <Check size={9} strokeWidth={3.5} className="text-[var(--tinta-950)]" /> : null}
                </span>
                <span className={`h-1.5 rounded-full ${hecha ? "w-3/5 bg-tinta/70" : "w-2/5 bg-linea"}`} />
                <span className="ml-auto h-1.5 w-8 rounded-full bg-linea" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Maqueta del móvil con el cuestionario.
function MiniMovil() {
  return (
    <div aria-hidden className="demo-vista w-[11.5rem] rounded-[1.9rem] bg-[var(--tinta-900)] p-1.5 shadow-[0_30px_60px_-30px_rgb(17_17_17/0.55)] sm:w-[12.5rem]">
      <div className="flex flex-col gap-2.5 rounded-[1.5rem] bg-superficie px-3.5 pb-4 pt-3">
        <span className="mx-auto h-1 w-10 rounded-full bg-linea" />
        <span className="text-[0.62rem] font-semibold tracking-[0.02em] text-tinta-suave">Pregunta 1 de 4</span>
        <span className="flex flex-col gap-1">
          <span className="h-2 w-full rounded-full bg-tinta/85" />
          <span className="h-2 w-3/5 rounded-full bg-tinta/85" />
        </span>
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${i === 2 ? "demo-elegida border-[var(--lumbre-200)] bg-[var(--lumbre-50)]" : "border-linea"}`}>
              <span className={`grid size-3 place-items-center rounded-full border ${i === 2 ? "border-lumbre" : "border-[var(--piedra-400)]"}`}>
                {i === 2 ? <span className="size-1.5 rounded-full bg-lumbre" /> : null}
              </span>
              <span className={`h-1.5 rounded-full ${i === 2 ? "w-14 bg-tinta/70" : "w-12 bg-linea"}`} />
            </span>
          ))}
        </div>
        <span className="mt-1 flex h-7 items-center justify-center rounded-full bg-tinta text-[0.62rem] font-medium text-white">Enviar respuestas</span>
        <span className="flex items-center justify-center gap-1 text-[0.55rem] text-tinta-suave">
          <EyeOff size={9} strokeWidth={2} /> Sin nombre ni correo
        </span>
      </div>
    </div>
  );
}

export default function PaginaDemo() {
  return (
    <main id="contenido" className="relative flex flex-1 flex-col overflow-hidden bg-papel">
      <div className="relative mx-auto flex w-full max-w-[68rem] flex-1 flex-col gap-10 px-4 py-10 sm:px-8 lg:gap-14 lg:py-16">
        <div className="flex items-center justify-between gap-4">
          <EnlaceInicio className="rounded-md">
            <Logotipo alto={22} decorativo />
          </EnlaceInicio>
          <Link href="/" className="text-sm font-medium text-tinta-suave transition-colors hover:text-tinta">
            Volver al inicio
          </Link>
        </div>

        <header className="aparecer flex max-w-[44rem] flex-col gap-4">
          <p className="inline-flex items-center gap-2 self-start rounded-full bg-superficie px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-tinta-suave ring-1 ring-linea">
            <Sparkles aria-hidden size={12} className="text-[var(--lumbre-600)]" />
            Demostración
          </p>
          <h1 className="text-balance text-[2.25rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3rem] lg:text-[3.5rem]">
            Elija desde qué lado quiere verlo
          </h1>
          <p className="max-w-[38rem] text-pretty text-lg text-tinta-suave">
            {NOMBRE} tiene dos caras: el panel de la empresa y su técnico de prevención, y el cuestionario anónimo que responde la plantilla.
          </p>
        </header>

        <ul className="grid gap-4 lg:grid-cols-[1.25fr_1fr] lg:gap-5">
          <li className="aparecer [animation-delay:80ms]">
            {/* Enlace normal, sin precarga: /demo/panel abre una sesión al visitarlo. */}
            <a
              href="/demo/panel"
              className="demo-opcion group relative flex h-full flex-col gap-8 overflow-hidden rounded-[28px] bg-[var(--tinta-950)] p-6 text-white sm:p-8"
            >
              <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--lumbre)_35%,transparent),transparent)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex flex-col gap-2">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-white/60">Empresa y técnico de prevención</span>
                <span className="text-[1.75rem] font-medium leading-tight tracking-[-0.025em]">El panel</span>
                <span className="max-w-[30rem] text-pretty text-white/70">
                  Campañas, resultados por grupos, plan de acción, desconexión digital y evidencias fechadas.
                </span>
              </div>
              <div className="relative flex flex-1 items-center">
                <div className="w-full">
                  <MiniPanel />
                </div>
              </div>
              <span className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-white/10 pt-5">
                <span className="flex items-center gap-2 whitespace-nowrap text-sm text-white/60">
                  <Lock aria-hidden size={14} /> Solo lectura
                </span>
                <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full sm:w-auto bg-white px-5 text-sm font-medium text-tinta transition-colors group-hover:bg-lumbre group-hover:text-[var(--tinta-950)]">
                  Entrar al panel
                  <ArrowRight aria-hidden size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </span>
            </a>
          </li>

          <li className="aparecer [animation-delay:160ms]">
            <Link
              href="/demo/cuestionario"
              className="demo-opcion group relative flex h-full flex-col gap-8 overflow-hidden rounded-[28px] bg-superficie p-6 ring-1 ring-linea sm:p-8"
            >
              <div className="relative flex flex-col gap-2">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-tinta-suave">Persona trabajadora</span>
                <span className="text-[1.75rem] font-medium leading-tight tracking-[-0.025em]">El cuestionario</span>
                <span className="max-w-[26rem] text-pretty text-tinta-suave">Lo que ve la plantilla al responder desde el móvil, con un código y sin cuenta.</span>
              </div>
              <div className="relative flex flex-1 items-center justify-center rounded-[20px] bg-papel py-6">
                <MiniMovil />
              </div>
              <span className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-linea pt-5">
                <span className="flex items-center gap-2 whitespace-nowrap text-sm text-tinta-suave">
                  <EyeOff aria-hidden size={14} /> No se guarda nada
                </span>
                <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full sm:w-auto bg-tinta px-5 text-sm font-medium text-white transition-colors group-hover:bg-lumbre group-hover:text-[var(--tinta-950)]">
                  Ver el cuestionario
                  <ArrowRight aria-hidden size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </li>
        </ul>

        <footer className="flex flex-col gap-3 border-t border-linea pt-6 text-sm text-tinta-suave sm:flex-row sm:items-center sm:justify-between">
          <p>Todos los datos son ficticios y están marcados como tales.</p>
          <p>
            ¿Prefiere que se lo enseñemos?{" "}
            <Link href="/contacto" className="font-medium text-tinta underline underline-offset-4">
              Solicite una demostración guiada
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
