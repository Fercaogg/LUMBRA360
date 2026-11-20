"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { aplazar } from "@/components/movimiento/aplazar";
import { Check, EyeOff, FileCheck2, FileText, ListChecks } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// «Para qué sirve»: tres escenas, una por beneficio. Son ilustraciones, no datos.
// Se reproducen al entrar en pantalla y se rebobinan al salir. Con «reducir movimiento», quietas.

function Tarjeta({ n, icono: I, titulo, texto, children }: { n: string; icono: typeof EyeOff; titulo: string; texto: string; children: ReactNode }) {
  // Inclinación 3D suave que sigue al puntero.
  const mover = (e: PointerEvent<HTMLLIElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(e.currentTarget, { rotationY: x * 8, rotationX: -y * 8, duration: 0.6, ease: "power3.out", transformPerspective: 1200 });
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const salir = (e: PointerEvent<HTMLLIElement>) => gsap.to(e.currentTarget, { rotationY: 0, rotationX: 0, duration: 0.8, ease: "power3.out" });

  return (
    <li data-beneficio onPointerMove={mover} onPointerLeave={salir} className="beneficio group flex flex-col overflow-hidden rounded-[24px] border border-linea bg-superficie">
      <div aria-hidden className="relative h-56 overflow-hidden border-b border-linea bg-papel">
        <span className="absolute left-5 top-4 font-mono text-xs text-tinta-suave">{n}</span>
        {children}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-7 lg:p-8">
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--lumbre-50)] text-[var(--lumbre-600)]">
          <I size={18} strokeWidth={1.75} aria-hidden />
        </span>
        <h3 className="text-xl font-semibold leading-snug tracking-[-0.01em]">{titulo}</h3>
        <p className="text-pretty text-tinta-suave">{texto}</p>
      </div>
    </li>
  );
}

const GRUPOS = [7, 5, 3];

export function BeneficiosVivos() {
  const raiz = useRef<HTMLUListElement>(null);

  useGSAP(
    () =>
      aplazar(() => {
      const q = gsap.utils.selector(raiz);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(q("[data-beneficio]"), {
          y: 60,
          autoAlpha: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: raiz.current, start: "top 85%", toggleActions: "play none none reverse" },
        });

        const escena = (sel: string) => ({ trigger: q(sel)[0], start: "top 95%", toggleActions: "play none none reverse" as const });

        // 1. Puntos sueltos que se agrupan; el grupo pequeño queda velado.
        gsap
          .timeline({ scrollTrigger: escena("[data-e1]") })
          .from(q("[data-punto]"), {
            x: () => gsap.utils.random(-60, 60),
            y: () => gsap.utils.random(-40, 40),
            scale: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: { each: 0.02, from: "random" },
          })
          .from(q("[data-grupo-marco]"), { autoAlpha: 0, scale: 0.9, duration: 0.4, stagger: 0.12 }, "-=0.2")
          .to(q("[data-grupo-oculto] [data-punto]"), { filter: "blur(3px)", opacity: 0.35, duration: 0.4 }, "-=0.1")
          .from(q("[data-grupo-etiqueta]"), { y: 8, autoAlpha: 0, duration: 0.35, stagger: 0.1 }, "<");

        // 2. Barras que se convierten en medidas.
        gsap
          .timeline({ scrollTrigger: escena("[data-e2]") })
          .fromTo(q("[data-barra]"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out", stagger: 0.1 })
          .to(q("[data-barras]"), { autoAlpha: 0, y: -14, duration: 0.35 }, "+=0.35")
          .from(q("[data-medida-e2]"), { x: 30, autoAlpha: 0, duration: 0.45, ease: "power3.out", stagger: 0.12 }, "-=0.1")
          .from(q("[data-check-e2]"), { scale: 0, duration: 0.3, ease: "back.out(3)", stagger: 0.15 }, "-=0.2");

        // 3. Documentos que caen en la pila y reciben su sello.
        gsap
          .timeline({ scrollTrigger: escena("[data-e3]") })
          .from(q("[data-doc]"), { y: -140, rotation: (i: number) => [-14, 10, -6][i], autoAlpha: 0, duration: 0.7, ease: "bounce.out", stagger: 0.18 })
          .from(q("[data-sello-e3]"), { scale: 2.2, rotation: -20, autoAlpha: 0, duration: 0.45, ease: "back.out(2)" }, "-=0.1");
      });
      return () => mm.revert();
    }),
    { scope: raiz },
  );

  return (
    <ul ref={raiz} className="grid gap-6 md:grid-cols-3 lg:gap-8">
      <Tarjeta n="01" icono={EyeOff} titulo="Escuchar sin exponer a nadie" texto="Cuestionarios anónimos. Los resultados solo se ven en grupos de 5 personas o más.">
        <div data-e1 className="absolute inset-x-5 bottom-5 top-12 flex items-end justify-center gap-3">
          {GRUPOS.map((n) => {
            const visible = n >= 5;
            return (
              <div key={n} className="flex flex-col items-center gap-2" {...(visible ? {} : { "data-grupo-oculto": true })}>
                <div
                  data-grupo-marco
                  className={`grid grid-cols-3 gap-1.5 rounded-xl border p-2 ${visible ? "border-[var(--tinta-300)] bg-superficie" : "border-dashed border-[var(--piedra-400)]"}`}
                >
                  {Array.from({ length: 9 }, (_, i) =>
                    i < n ? <span key={i} data-punto className={`size-4 rounded-full ${visible ? "bg-lumbre" : "bg-[var(--piedra-400)]"}`} /> : <span key={i} className="size-4" />,
                  )}
                </div>
                <span data-grupo-etiqueta className={`rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${visible ? "bg-tinta text-[var(--texto-sobre-marca)]" : "border border-[var(--piedra-400)] text-tinta-suave"}`}>
                  {visible ? `${n} · se ve` : `${n} · oculto`}
                </span>
              </div>
            );
          })}
        </div>
      </Tarjeta>

      <Tarjeta n="02" icono={ListChecks} titulo="Pasar de los datos a las medidas" texto="Cada medida del plan tiene responsable, fecha prevista y estado.">
        <div data-e2 className="absolute inset-x-6 bottom-6 top-12">
          <div data-barras className="absolute inset-0 flex flex-col justify-center gap-3">
            {[
              ["78%", "var(--dato-desfavorable)"],
              ["52%", "var(--dato-intermedio)"],
              ["64%", "var(--dato-favorable)"],
            ].map(([ancho, color]) => (
              <span key={color} className="h-3 w-full overflow-hidden rounded-full bg-[var(--piedra-200)]">
                <span data-barra className="block h-full origin-left rounded-full" style={{ width: ancho, background: color }} />
              </span>
            ))}
          </div>
          <ul className="absolute inset-0 flex flex-col justify-center gap-2.5">
            {["Redistribuir picos de trabajo", "Formación en desconexión", "Revisar avisos fuera de horario"].map((m, i) => (
              <li key={m} data-medida-e2 className="flex items-center gap-3 rounded-xl border border-linea bg-superficie px-3 py-2 text-[0.8rem] shadow-[var(--sombra-1)]">
                <span data-check-e2 className={`grid size-5 shrink-0 place-items-center rounded-full ${i < 2 ? "bg-[var(--correcto-solido)] text-white" : "border border-[var(--piedra-400)]"}`}>
                  {i < 2 ? <Check size={12} strokeWidth={3} /> : null}
                </span>
                <span className="truncate font-medium">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </Tarjeta>

      <Tarjeta n="03" icono={FileCheck2} titulo="Tenerlo todo documentado" texto="Evaluación, política de desconexión, acuses y formación quedan fechados.">
        <div data-e3 className="absolute inset-0 grid place-items-center">
          <div className="relative mt-6 h-36 w-52">
            {["Política aprobada", "Acuses de lectura", "Informe firmado"].map((d, i) => (
              <div
                key={d}
                data-doc
                className="absolute flex h-20 w-44 flex-col gap-2 rounded-xl border border-linea bg-superficie p-3 shadow-[0_14px_24px_-16px_rgb(17_17_17/0.35)]"
                style={{ top: i * 30, left: i * 12, transform: `rotate(${[-3, 2, -1][i]}deg)` }}
              >
                <span className="flex items-center gap-1.5 text-[0.72rem] font-semibold">
                  <FileText size={13} className="text-tinta-suave" /> {d}
                </span>
                <span className="h-1.5 w-full rounded-full bg-[var(--piedra-200)]" />
                <span className="h-1.5 w-2/3 rounded-full bg-[var(--piedra-200)]" />
              </div>
            ))}
            <span data-sello-e3 className="absolute -bottom-3 -right-6 rotate-[-8deg] rounded-lg border-2 border-lumbre bg-superficie px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--lumbre-600)]">
              Fechado
            </span>
          </div>
        </div>
      </Tarjeta>
    </ul>
  );
}
