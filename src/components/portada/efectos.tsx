"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Movimiento de la portada: solo entradas suaves y los pasos de «Cómo se utiliza».
// - data-entrar: el bloque aparece con un ligero desplazamiento.
// - data-entrar="grupo": sus hijos aparecen uno tras otro.
// - data-pasos: los pasos entran en orden y la línea que los une se dibuja.
// Sin JavaScript o con «reducir movimiento», todo se ve quieto desde el principio.
export function EfectosPortada() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-entrar]").forEach((bloque) => {
        const objetivos = bloque.dataset.entrar === "grupo" ? Array.from(bloque.children) : bloque;
        gsap.from(objetivos, {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: bloque, start: "top 85%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-pasos]").forEach((lista) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: lista, start: "top 80%", once: true } });
        tl.from(lista.querySelectorAll("[data-paso]"), { opacity: 0, y: 24, duration: 0.6, ease: "power3.out", stagger: 0.12 });
        tl.from(lista.querySelectorAll("[data-linea]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.5, ease: "power2.out", stagger: 0.12 }, 0.2);
      });
    });

    const cabecera = document.querySelector<HTMLElement>("[data-cabecera]");
    const plegar = cabecera
      ? ScrollTrigger.create({ start: 8, end: "+=1000000", onToggle: (st) => (cabecera.dataset.plegada = String(st.isActive)) })
      : null;
    return () => {
      mm.revert();
      plegar?.kill();
    };
  });
  return null;
}
