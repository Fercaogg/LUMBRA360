"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Efectos de la portada ligados al scroll. Se enganchan por atributos data-*:
// - data-palabras: las palabras se encienden al leerlas.
// - data-inclinar: el bloque llega inclinado en 3D y se endereza.
// - data-trazo: el anillo de marca se dibuja; data-chispa: la lumbre se enciende al final.
// - data-subir: entrada suave del bloque.
// Sin JavaScript o con «reducir movimiento», todo se ve en su estado final.
export function EfectosPortada() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-palabras]").forEach((bloque) => {
        gsap.fromTo(
          bloque.querySelectorAll("[data-palabra]"),
          { opacity: 0.14 },
          { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: bloque, start: "top 78%", end: "bottom 45%", scrub: true } },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-inclinar]").forEach((bloque) => {
        gsap.fromTo(
          bloque,
          { rotationX: 24, scale: 0.9, y: 60, transformPerspective: 1400, transformOrigin: "50% 0%" },
          { rotationX: 0, scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: bloque, start: "top 95%", end: "top 25%", scrub: true } },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-subir]").forEach((bloque) => {
        gsap.from(bloque, { opacity: 0, y: 40, duration: 1, ease: "expo.out", scrollTrigger: { trigger: bloque, start: "top 85%", once: true } });
      });

      gsap.utils.toArray<SVGCircleElement>("[data-trazo]").forEach((trazo) => {
        const chispa = trazo.ownerSVGElement?.querySelector("[data-chispa]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: trazo.ownerSVGElement, start: "top 85%", end: "bottom 60%", scrub: true } });
        // El círculo usa pathLength="100": el trazo final deja la apertura del símbolo (88 de 100).
        tl.fromTo(trazo, { strokeDasharray: "0 100" }, { strokeDasharray: "88 12", ease: "none" });
        if (chispa) tl.fromTo(chispa, { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, ease: "back.out(3)", duration: 0.3 });
      });
    });
    const cabecera = document.querySelector<HTMLElement>("[data-cabecera]");
    const plegar = cabecera ? ScrollTrigger.create({ start: 40, end: "+=1000000", onToggle: (st) => (cabecera.dataset.plegada = String(st.isActive)) }) : null;
    return () => {
      mm.revert();
      plegar?.kill();
    };
  });
  return null;
}
