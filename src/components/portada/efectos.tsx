"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Movimiento de la portada, ligado al scroll: avanza al bajar y retrocede al subir.
// Se engancha por atributos data-* del marcado de src/app/page.tsx.
// Sin JavaScript o con «reducir movimiento», todo se ve en su estado final y quieto.

const todos = <T extends Element = HTMLElement>(selector: string, raiz: ParentNode = document) => Array.from(raiz.querySelectorAll<T>(selector));

export function EfectosPortada() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      heroe();
      titulares();
      beneficios();
      pasos();
      pelicula();
      perfiles();
      cierre();
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

// 1. El portátil llega cerrado y se abre al bajar; la pantalla se enciende y el móvil sube.
function heroe() {
  const dispositivo = document.querySelector<HTMLElement>("[data-hero-dispositivo]");
  if (!dispositivo) return;
  const tapa = dispositivo.querySelector("[data-tapa]");
  const pantalla = dispositivo.querySelector("[data-encender]");
  const movil = dispositivo.querySelector("[data-movil]");
  // Cerrado, el portátil ocupa poco: se sube para que se vea bajo los botones y baja a su sitio al abrirse.
  const alturaTapa = () => (tapa instanceof HTMLElement ? tapa.offsetHeight : 0);
  const tl = gsap.timeline({ scrollTrigger: { trigger: dispositivo, start: 0, end: "+=560", scrub: 0.6, invalidateOnRefresh: true } });
  tl.fromTo(dispositivo, { scale: 0.9, y: () => -alturaTapa() * 0.8 }, { scale: 1, y: 0, ease: "power1.inOut", duration: 0.8 }, 0)
    .fromTo(tapa, { rotationX: -86 }, { rotationX: 0, ease: "power1.inOut", duration: 0.8 }, 0)
    .fromTo(pantalla, { opacity: 0, filter: "brightness(2.4) blur(8px)" }, { opacity: 1, filter: "brightness(1) blur(0px)", ease: "power2.out", duration: 0.35 }, 0.55)
    .fromTo(movil, { yPercent: 70, opacity: 0, rotation: 10 }, { yPercent: 0, opacity: 1, rotation: 0, ease: "power2.out", duration: 0.45 }, 0.55);

  const texto = document.querySelector("[data-hero-texto]");
  if (texto) gsap.to(texto, { y: -48, opacity: 0.35, ease: "none", scrollTrigger: { start: 0, end: "+=560", scrub: 0.6 } });
}

// 2. Títulos de sección: se revelan cada vez que entran en pantalla.
function titulares() {
  todos("[data-titular]").forEach((bloque) => {
    gsap.from(bloque.children, {
      y: 32,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: bloque, start: "top 85%", toggleActions: "play none none reverse" },
    });
  });
}

// 3. Para qué sirve: las tarjetas se levantan en 3D y los iconos se dibujan.
function beneficios() {
  todos("[data-tarjetas]").forEach((lista) => {
    gsap.fromTo(
      todos("[data-tarjeta]", lista),
      { y: 100, rotationX: 30, opacity: 0, transformOrigin: "50% 100%" },
      { y: 0, rotationX: 0, opacity: 1, ease: "power2.out", stagger: 0.18, scrollTrigger: { trigger: lista, start: "top 92%", end: "top 40%", scrub: 0.6 } },
    );
  });
  todos("[data-trazar]").forEach((icono) => {
    todos<SVGGeometryElement>("path, line, circle, rect, polyline, polygon", icono).forEach((forma) => {
      const largo = forma.getTotalLength?.() ?? 0;
      if (!largo) return;
      gsap.fromTo(
        forma,
        { strokeDasharray: largo, strokeDashoffset: largo },
        { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: icono, start: "top 88%", end: "top 50%", scrub: 0.5 } },
      );
    });
  });
}

// 4. Cómo se utiliza: la línea de progreso recorre los pasos y enciende cada número.
function pasos() {
  todos("[data-pasos]").forEach((lista) => {
    const items = todos("[data-paso]", lista);
    const rellenos = todos("[data-relleno]", lista);
    gsap.set(rellenos, { scaleX: 0 });
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: lista,
        start: "top 80%",
        end: "bottom 50%",
        scrub: 0.6,
        onUpdate: (st) => {
          const n = Math.floor(st.progress * items.length + 0.2);
          items.forEach((item, i) => (item.dataset.activo = String(i < n)));
        },
      },
    });
    items.forEach((item, i) => {
      tl.fromTo(item, { opacity: 0.25, y: 48 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      if (rellenos[i]) tl.to(rellenos[i], { scaleX: 1, duration: 0.5 });
    });
    todos("[data-miniatura]", lista).forEach((img) => {
      gsap.fromTo(img, { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom 45%", scrub: true } });
    });
  });
}

// 5. La aplicación por dentro: la sección se fija y el portátil «reproduce» las pantallas.
function pelicula() {
  const peli = document.querySelector<HTMLElement>("[data-pelicula]");
  if (!peli) return;
  const fotogramas = todos("[data-fotograma]", peli);
  const capitulos = todos("[data-capitulo]", peli);
  const capitulosMovil = todos("[data-capitulo-movil]", peli);
  const barras = todos("[data-barra]", peli);
  const cursor = peli.querySelector("[data-cursor]");
  const posiciones: [number, number][] = JSON.parse(peli.dataset.cursores ?? "[]");
  const n = fotogramas.length;
  gsap.set(barras, { scaleX: 0 });

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: peli,
      start: "center center",
      end: `+=${n * 75}%`,
      pin: true,
      scrub: 0.6,
      onUpdate: (st) => {
        const activo = Math.min(n - 1, Math.floor(st.progress * n));
        capitulos.forEach((c, i) => (c.dataset.activo = String(i === activo)));
      },
    },
  });
  if (cursor) tl.fromTo(cursor, { opacity: 0, left: "70%", top: "80%" }, { opacity: 1, duration: 0.15 }, 0);
  for (let i = 0; i < n; i++) {
    if (barras[i]) tl.to(barras[i], { scaleX: 1, duration: 1, ease: "none" }, i);
    if (cursor && posiciones[i]) {
      tl.to(cursor, { left: `${posiciones[i][0]}%`, top: `${posiciones[i][1]}%`, duration: 0.35 }, i + 0.05);
      tl.to(cursor, { scale: 0.75, duration: 0.06, yoyo: true, repeat: 1 }, i + 0.42);
      tl.fromTo(cursor, { "--pulso": 1, "--pulso-escala": 0 }, { "--pulso": 0, "--pulso-escala": 1, duration: 0.25, ease: "power1.out" }, i + 0.44);
    }
    if (i < n - 1) {
      tl.to(fotogramas[i], { opacity: 0, yPercent: -5, duration: 0.3 }, i + 0.7);
      tl.fromTo(fotogramas[i + 1], { opacity: 0, yPercent: 6, scale: 1.03 }, { opacity: 1, yPercent: 0, scale: 1, duration: 0.3 }, i + 0.7);
      if (capitulosMovil[i + 1]) {
        tl.to(capitulosMovil[i], { opacity: 0, y: -10, duration: 0.2 }, i + 0.7);
        tl.fromTo(capitulosMovil[i + 1], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2 }, i + 0.8);
      }
    }
  }
}

// 6. Para quién: las tarjetas entran desde los lados.
function perfiles() {
  todos("[data-perfiles]").forEach((lista) => {
    todos("[data-perfil]", lista).forEach((tarjeta, i) => {
      const lado = i % 2 === 0 ? -1 : 1;
      gsap.fromTo(
        tarjeta,
        { x: 80 * lado, rotationY: -18 * lado, opacity: 0, transformPerspective: 1200 },
        { x: 0, rotationY: 0, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: lista, start: `top ${95 - i * 4}%`, end: "top 50%", scrub: 0.6 } },
      );
    });
  });
}

// 7. Cierre: la onda de la marca se dibuja detrás y el texto se revela.
function cierre() {
  const bloque = document.querySelector<HTMLElement>("[data-cierre]");
  if (!bloque) return;
  const onda = bloque.querySelector("[data-onda]");
  if (onda) {
    gsap.fromTo(onda, { strokeDasharray: "0 100" }, { strokeDasharray: "100 0", ease: "none", scrollTrigger: { trigger: bloque, start: "top 90%", end: "bottom 60%", scrub: 0.6 } });
  }
  gsap.from(todos("[data-revelar]", bloque), {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.12,
    scrollTrigger: { trigger: bloque, start: "top 80%", toggleActions: "play none none reverse" },
  });
}
