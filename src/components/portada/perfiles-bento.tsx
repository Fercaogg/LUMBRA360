"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Building2, Check, ClipboardCheck, FileText, HardHat, Stamp, Users } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// «Para quién»: un bento oscuro con una escena viva por perfil.
// Las cifras y los nombres de las escenas son de ejemplo y lo dicen.
// Sin JavaScript o con «reducir movimiento», todo se ve en su estado final.

function Panel({ icono: I, titulo, texto, className = "", children }: { icono: typeof Users; titulo: string; texto: string; className?: string; children: ReactNode }) {
  // El foco de luz sigue al puntero.
  const mover = (e: PointerEvent<HTMLLIElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <li data-bento onPointerMove={mover} className={`bento-panel flex flex-col gap-8 p-7 lg:p-9 ${className}`}>
      <div className="relative z-10 flex flex-col gap-3">
        <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-[var(--lumbre-300)]">
          <I size={20} strokeWidth={1.75} aria-hidden />
        </span>
        <h3 className="text-xl font-semibold text-white">{titulo}</h3>
        <p className="max-w-[34ch] text-pretty text-[var(--tinta-200)]">{texto}</p>
      </div>
      <div aria-hidden className="relative z-10 mt-auto">
        {children}
      </div>
    </li>
  );
}

const ejemplo = <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--tinta-200)]">Ejemplo</span>;

export function PerfilesBento() {
  const raiz = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(raiz);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrada de los paneles, ligada al scroll.
        gsap.fromTo(
          q("[data-bento]"),
          { y: 70, scale: 0.96, autoAlpha: 0 },
          { y: 0, scale: 1, autoAlpha: 1, ease: "power3.out", stagger: 0.12, scrollTrigger: { trigger: raiz.current, start: "top 90%", end: "top 35%", scrub: 1 } },
        );

        // Escenas: se reproducen al entrar y se rebobinan al salir.
        const escena = (selector: string) => ({ trigger: q(selector)[0], start: "top 85%", toggleActions: "play none none reverse" as const });

        // Gerencia: anillo de progreso y estados.
        gsap
          .timeline({ scrollTrigger: escena("[data-escena-gerencia]") })
          .fromTo(q("[data-anillo]"), { strokeDashoffset: 100 }, { strokeDashoffset: 100 - 67, duration: 1.2, ease: "power3.out" })
          .fromTo(q("[data-anillo-cifra]"), { textContent: 0 }, { textContent: 6, snap: { textContent: 1 }, duration: 1.2, ease: "power3.out" }, 0)
          .from(q("[data-estado-g]"), { x: 30, autoAlpha: 0, duration: 0.5, stagger: 0.12, ease: "power3.out" }, 0.2);

        // RR. HH.: acuses que se van confirmando.
        gsap
          .timeline({ scrollTrigger: escena("[data-escena-rrhh]") })
          .from(q("[data-acuse]"), { scale: 0, duration: 0.25, stagger: { each: 0.03, from: "random" }, ease: "back.out(2)" })
          .fromTo(q("[data-acuses-barra]"), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power2.out" }, 0)
          .fromTo(q("[data-acuses-cifra]"), { textContent: 0 }, { textContent: 31, snap: { textContent: 1 }, duration: 1, ease: "power2.out" }, 0);

        // Técnico: el archivo viaja hacia FPSICO y llega el sello.
        gsap
          .timeline({ scrollTrigger: escena("[data-escena-tecnico]") })
          .from(q("[data-archivo]"), { x: -30, autoAlpha: 0, duration: 0.5, ease: "power3.out" })
          .fromTo(q("[data-flecha-viaje]"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" })
          .from(q("[data-destino]"), { x: 20, autoAlpha: 0, duration: 0.4 })
          .from(q("[data-sello-firmado]"), { scale: 2, rotation: -14, autoAlpha: 0, duration: 0.45, ease: "back.out(2)" }, "+=0.1");

        // Asesorías: las empresas entran con su estado.
        gsap
          .timeline({ scrollTrigger: escena("[data-escena-asesoria]") })
          .from(q("[data-empresa]"), { y: 24, autoAlpha: 0, duration: 0.45, stagger: 0.12, ease: "power3.out" })
          .from(q("[data-empresa-estado]"), { scale: 0.6, autoAlpha: 0, duration: 0.3, stagger: 0.12, ease: "back.out(2)" }, 0.3);
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  const acuses = Array.from({ length: 40 }, (_, i) => i);

  return (
    <ul ref={raiz} className="grid gap-5 md:grid-cols-6 lg:gap-6">
      {/* Gerencia */}
      <Panel icono={Building2} titulo="Gerencia de pymes" texto="Una visión clara de lo hecho y de lo pendiente, sin perseguir a nadie." className="md:col-span-4">
        <div data-escena-gerencia className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center">
          <div className="relative grid size-28 shrink-0 place-items-center">
            <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="10" />
              <circle data-anillo cx="60" cy="60" r="50" fill="none" stroke="var(--lumbre)" strokeWidth="10" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset={33} />
            </svg>
            <span className="text-center leading-tight text-white">
              <span className="text-3xl font-medium tabular-nums">
                <span data-anillo-cifra>6</span>/9
              </span>
              <span className="block text-[0.7rem] text-[var(--tinta-200)]">medidas</span>
            </span>
          </div>
          <ul className="flex flex-1 flex-col gap-2.5">
            {[
              ["Evaluación", "Informe firmado", true],
              ["Desconexión digital", "Política aprobada", true],
              ["Próximo plazo", "Revisión del plan", false],
            ].map(([a, b, ok]) => (
              <li key={a as string} data-estado-g className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-xl bg-white/[0.06] px-3.5 py-2.5 text-sm">
                <span className="text-[var(--tinta-200)]">{a}</span>
                <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${ok ? "bg-[var(--lumbre)] text-[var(--tinta-950)]" : "bg-white/10 text-white"}`}>
                  {ok ? <Check size={12} strokeWidth={3} /> : null}
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 flex justify-end">{ejemplo}</div>
      </Panel>

      {/* RR. HH. */}
      <Panel icono={Users} titulo="Recursos humanos" texto="Campañas, política de desconexión y acuses de lectura, en un solo sitio." className="md:col-span-2">
        <div data-escena-rrhh className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="grid grid-cols-10 gap-1.5">
            {acuses.map((i) => (
              <span key={i} {...(i < 31 ? { "data-acuse": true } : {})} className={`aspect-square rounded-full ${i < 31 ? "bg-[var(--lumbre)]" : "bg-white/10"}`} />
            ))}
          </div>
          <div className="flex items-baseline justify-between text-sm text-[var(--tinta-200)]">
            <span>Acuses de lectura</span>
            <span className="text-white">
              <span data-acuses-cifra className="text-lg font-medium tabular-nums">31</span> / 40
            </span>
          </div>
          <span className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
            <span data-acuses-barra className="absolute inset-y-0 left-0 w-[77.5%] origin-left rounded-full bg-[var(--lumbre)]" />
          </span>
        </div>
        <div className="mt-3 flex justify-end">{ejemplo}</div>
      </Panel>

      {/* Técnicos */}
      <Panel icono={HardHat} titulo="Técnicos de PRL" texto="Respuestas listas para FPSICO, informe firmado y plan de acción." className="md:col-span-2">
        <div data-escena-tecnico className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <span data-archivo className="inline-flex items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 font-mono text-xs text-white">
              <FileText size={14} aria-hidden /> respuestas.txt
            </span>
            <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <span data-flecha-viaje className="absolute inset-0 origin-left bg-[var(--lumbre)]" />
            </span>
            <span data-destino className="inline-flex items-center gap-1 rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-semibold text-white">
              FPSICO <ArrowRight size={12} aria-hidden />
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-3">
            <span className="flex items-center gap-2 text-sm text-[var(--tinta-200)]">
              <ClipboardCheck size={16} aria-hidden /> Informe
            </span>
            <span data-sello-firmado className="inline-flex items-center gap-1.5 rounded-md border-2 border-[var(--lumbre)] px-2 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--lumbre-300)]">
              <Stamp size={12} aria-hidden /> Firmado
            </span>
          </div>
        </div>
        <div className="mt-3 flex justify-end">{ejemplo}</div>
      </Panel>

      {/* Asesorías */}
      <Panel icono={ClipboardCheck} titulo="Asesorías y gestorías" texto="Todas sus empresas desde un panel, con su marca si lo desea." className="md:col-span-4">
        <div data-escena-asesoria className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-white/25 px-3 py-1.5 text-xs text-[var(--tinta-200)]">Su marca aquí</span>
            <span className="font-mono text-xs text-[var(--tinta-200)]">4 empresas</span>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {[
              ["Empresa A", "Al día", true],
              ["Empresa B", "Plan en curso", false],
              ["Empresa C", "Al día", true],
              ["Empresa D", "Campaña abierta", false],
            ].map(([n, e, ok]) => (
              <li key={n as string} data-empresa className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.06] px-3.5 py-3 text-sm">
                <span className="flex items-center gap-2.5 whitespace-nowrap text-white">
                  <span className="grid size-7 place-items-center rounded-md bg-white/10 text-[0.7rem] font-semibold">{(n as string).slice(-1)}</span>
                  {n}
                </span>
                <span data-empresa-estado className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${ok ? "bg-[var(--lumbre)] text-[var(--tinta-950)]" : "bg-white/10 text-white"}`}>
                  {e}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 flex justify-end">{ejemplo}</div>
      </Panel>
    </ul>
  );
}
