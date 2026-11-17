"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Simbolo } from "@/components/marca/logotipo";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Órbita de evidencias: ocho láminas giran alrededor de la onda de la marca.
// Decorativa: el contenido real está en el texto de la portada.
const LAMINAS = [
  "Campaña cerrada",
  "Informe registrado",
  "Plan de acción",
  "Política aprobada",
  "Audiencia",
  "Acuses de lectura",
  "Formación",
  "Dossier",
];

export function Orbita() {
  const caja = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const escena = caja.current?.querySelector<HTMLElement>("[data-escena]");
      const anillo = caja.current?.querySelector<HTMLElement>("[data-anillo]");
      const laminas = gsap.utils.toArray<HTMLElement>("[data-lamina]", caja.current);
      if (!escena || !anillo) return;

      const pintar = (giro: number) => {
        laminas.forEach((lamina, i) => {
          const angulo = ((i * 360) / laminas.length + giro) * (Math.PI / 180);
          const frente = (Math.cos(angulo) + 1) / 2; // 1 delante, 0 detrás
          lamina.style.opacity = String(0.28 + frente * 0.72);
          lamina.style.filter = `blur(${(1 - frente) * 1.2}px)`;
        });
      };

      gsap.set(escena, { rotationX: -14 });
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const estado = { giro: 0, velocidad: 1 };
        const tick = () => {
          estado.giro = (estado.giro + 0.09 * estado.velocidad) % 360;
          gsap.set(anillo, { rotationY: estado.giro });
          pintar(estado.giro);
        };
        gsap.ticker.add(tick);

        // Entrada: las láminas se abren desde la lumbre.
        gsap.from(anillo, { scale: 0.35, duration: 1.8, ease: "expo.out", delay: 0.1 });
        gsap.from(gsap.utils.toArray("[data-cara]", caja.current), { opacity: 0, y: 30, duration: 1.2, ease: "expo.out", stagger: 0.06, delay: 0.2 });

        // Puntero: la escena se inclina un poco hacia quien mira.
        const inclinarX = gsap.quickTo(escena, "rotationX", { duration: 0.9, ease: "power3.out" });
        const inclinarZ = gsap.quickTo(escena, "rotationZ", { duration: 0.9, ease: "power3.out" });
        const mover = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          inclinarX(-14 + ny * 10);
          inclinarZ(nx * -6);
        };
        window.addEventListener("pointermove", mover, { passive: true });

        // Scroll: al salir de la portada, la órbita se tumba y acelera.
        const salida = gsap.to(escena, {
          rotationX: -48,
          scale: 0.86,
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: caja.current,
            start: "top top+=80",
            end: "bottom top",
            scrub: true,
            onUpdate: (st) => (estado.velocidad = 1 + st.progress * 6),
          },
        });

        return () => {
          gsap.ticker.remove(tick);
          window.removeEventListener("pointermove", mover);
          salida.scrollTrigger?.kill();
        };
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(anillo, { rotationY: 18 });
        pintar(18);
      });
      return () => mm.revert();
    },
    { scope: caja },
  );

  return (
    <div ref={caja} aria-hidden className="orbita relative mx-auto aspect-square w-full max-w-[36rem] select-none">
      <div data-escena className="orbita-escena absolute inset-0">
        {/* Suelo: la órbita dibujada, tumbada */}
        <div className="orbita-suelo" />
        <div className="orbita-suelo orbita-suelo--interior" />

        {/* Lumbre */}
        <div className="orbita-lumbre">
          <Simbolo tamano={84} color="var(--lumbre)" />
        </div>

        <div data-anillo className="orbita-anillo">
          {LAMINAS.map((titulo, i) => (
            <div key={titulo} data-lamina className="orbita-lamina" style={{ "--i": i } as React.CSSProperties}>
              <div data-cara className="orbita-cara">
              <span className="font-mono text-[0.6rem] tracking-[0.14em] text-tinta-suave">EV · {String(i + 1).padStart(2, "0")}</span>
              <span className="font-serif text-[0.95rem] leading-tight text-tinta sm:text-lg">{titulo}</span>
              <span className="mt-auto flex flex-col gap-1.5">
                <span className="h-1 w-full rounded-full bg-[var(--piedra-200)]" />
                <span className="h-1 w-3/4 rounded-full bg-[var(--piedra-200)]" />
                <span className="mt-1 flex items-center gap-1.5 font-mono text-[0.55rem] text-tinta-suave">
                  <span className="size-1.5 rounded-full bg-lumbre" />
                  fechada
                </span>
              </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
