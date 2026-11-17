"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Movimiento de marca (brand/brand-guidelines.md, sección 8).
// Solo se anima con «sin preferencia» de movimiento: con reducir movimiento, se ve el estado final.
const SIN_PREFERENCIA = "(prefers-reduced-motion: no-preference)";

// 1. Transición entre secciones: el contenido entra con un fundido y sube 8 px. 320 ms, sin rebote.
export function TransicionSeccion({ children }: { children: ReactNode }) {
  const caja = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(SIN_PREFERENCIA, () => {
        gsap.fromTo(caja.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.32, ease: "expo.out", clearProps: "transform,opacity" });
      });
      return () => mm.revert();
    },
    { scope: caja },
  );
  return (
    <div ref={caja} className="flex flex-col gap-8">
      {children}
    </div>
  );
}

// 2. Carga de indicadores: la cifra cuenta hasta su valor. 640 ms.
export function CifraAnimada({ valor, sufijo = "" }: { valor: number; sufijo?: string }) {
  const nodo = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(SIN_PREFERENCIA, () => {
        const estado = { v: 0 };
        gsap.to(estado, {
          v: valor,
          duration: 0.64,
          ease: "power3.out",
          onUpdate: () => {
            if (nodo.current) nodo.current.textContent = `${Math.round(estado.v)}${sufijo}`;
          },
        });
      });
      return () => mm.revert();
    },
    { dependencies: [valor, sufijo] },
  );
  // El texto final está en el HTML desde el principio: sin JavaScript o sin animación, se ve igual.
  return (
    <span ref={nodo} className="tabular-nums">
      {valor}
      {sufijo}
    </span>
  );
}

// 3. Confirmación: el mensaje aparece y un halo de lumbre se disipa a su alrededor. 640 ms.
export function useConfirmacion(activa: boolean, clave: unknown) {
  const nodo = useRef<HTMLParagraphElement>(null);
  useGSAP(
    () => {
      if (!activa || !nodo.current) return;
      const mm = gsap.matchMedia();
      mm.add(SIN_PREFERENCIA, () => {
        gsap
          .timeline()
          .fromTo(nodo.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.32, ease: "expo.out" })
          .fromTo(
            nodo.current,
            { boxShadow: "0 0 0 0px color-mix(in srgb, var(--lumbre) 55%, transparent)" },
            { boxShadow: "0 0 0 10px color-mix(in srgb, var(--lumbre) 0%, transparent)", duration: 0.64, ease: "power2.out", clearProps: "boxShadow" },
            "<",
          );
      });
      return () => mm.revert();
    },
    { dependencies: [activa, clave] },
  );
  return nodo;
}
