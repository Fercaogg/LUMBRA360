"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Movimiento de la portada, ligado al scroll: avanza al bajar y retrocede al subir.
// Se engancha por atributos data-* del marcado de src/app/page.tsx.
// Sin JavaScript o con «reducir movimiento», todo se ve en su estado final y quieto.

const todos = <T extends Element = HTMLElement>(selector: string, raiz: ParentNode = document) => Array.from(raiz.querySelectorAll<T>(selector));

export function EfectosPortada() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Desplazamiento suave con inercia, sincronizado con GSAP para que nada vaya a saltos.
      const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: -72 } });
      lenis.on("scroll", ScrollTrigger.update);
      const latido = (tiempo: number) => lenis.raf(tiempo * 1000);
      gsap.ticker.add(latido);
      gsap.ticker.lagSmoothing(0);

      heroe();

      // El resto de secciones queda por debajo de la primera pantalla. Se preparan de una en una
      // cuando el navegador está libre, para no bloquear la carga con una sola tarea larga.
      const cola = [titulares, beneficios, pasos, pelicula, perfiles, evolucion, cierre];
      const contexto = gsap.context(() => {});
      const conInactividad = typeof window.requestIdleCallback === "function";
      const libre = (fn: () => void): number => (conInactividad ? window.requestIdleCallback(fn, { timeout: 600 }) : window.setTimeout(fn, 60));
      const cancelar = (id: number) => (conInactividad ? window.cancelIdleCallback(id) : window.clearTimeout(id));
      let pendiente = 0;
      const siguiente = () => {
        const tarea = cola.shift();
        if (!tarea) {
          ScrollTrigger.refresh();
          return;
        }
        contexto.add(tarea);
        pendiente = libre(siguiente);
      };
      pendiente = libre(siguiente);

      return () => {
        cancelar(pendiente);
        contexto.revert();
        gsap.ticker.remove(latido);
        lenis.destroy();
      };
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

// 1. Hero: el portátil se abre solo al cargar (sin esperar al scroll) y se enciende el vídeo.
//    Al bajar, la portada se fija: el texto se aparta, el portátil crece hasta el centro
//    y se mantiene un tramo para que el vídeo se siga viendo.
function heroe() {
  const seccion = document.querySelector<HTMLElement>("[data-heroe]");
  const dispositivo = document.querySelector<HTMLElement>("[data-hero-dispositivo]");
  if (!seccion || !dispositivo) return;
  const tapa = dispositivo.querySelector("[data-tapa]");
  const pantalla = dispositivo.querySelector("[data-encender]");
  const movil = dispositivo.querySelector("[data-movil]");
  const texto = seccion.querySelector("[data-hero-texto]");

  gsap
    .timeline({ delay: 0.35 })
    .fromTo(tapa, { rotationX: -86 }, { rotationX: 0, duration: 1.5, ease: "power3.inOut" })
    .fromTo(pantalla, { opacity: 0, filter: "brightness(2.2) blur(8px)" }, { opacity: 1, filter: "brightness(1) blur(0px)", duration: 0.7, ease: "power2.out" }, "-=0.45")
    .fromTo(movil, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.5");

  // En pantallas pequeñas el portátil ya ocupa el ancho: fijar y ampliar solo dejaría
  // un hueco en blanco al bajar. El zoom queda para escritorio.
  if (!window.matchMedia("(min-width: 1024px)").matches) return;

  // Destino del zoom: centrado bajo la cabecera y lo más grande que quepa.
  const cabecera = 72;
  const margen = 20;
  const escala = () => {
    const disponibleAlto = window.innerHeight - cabecera - margen * 2;
    const disponibleAncho = window.innerWidth - margen * 2;
    return Math.max(1, Math.min(disponibleAlto / dispositivo.offsetHeight, disponibleAncho / dispositivo.offsetWidth, 2));
  };
  const desplazamiento = () => {
    const centroDestino = cabecera + (window.innerHeight - cabecera) / 2;
    return centroDestino - (dispositivo.offsetTop + dispositivo.offsetHeight / 2);
  };

  gsap
    .timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: { trigger: seccion, start: "top top", end: "+=140%", pin: true, scrub: 1, invalidateOnRefresh: true },
    })
    .to(texto, { y: -60, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0)
    .to(movil, { x: 40, autoAlpha: 0, duration: 0.25 }, 0)
    .to(dispositivo, { y: desplazamiento, scale: escala, transformOrigin: "50% 50%", duration: 0.5 }, 0.05)
    .to({}, { duration: 0.6 });
}

// 2. Títulos de sección: se revelan cada vez que entran en pantalla.
function titulares() {
  todos("[data-titular]").forEach((bloque) => {
    gsap.from(bloque.children, {
      y: 24,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: { trigger: bloque, start: "top 85%", toggleActions: "play none none reverse" },
    });
  });
}

// 3. Para qué sirve: las tarjetas se levantan en 3D y los iconos se dibujan.
function beneficios() {
  todos("[data-tarjetas]").forEach((lista) => {
    gsap.fromTo(
      todos("[data-tarjeta]", lista),
      { y: 64, rotationX: 10, opacity: 0, transformOrigin: "50% 100%" },
      { y: 0, rotationX: 0, opacity: 1, ease: "power3.out", stagger: 0.15, scrollTrigger: { trigger: lista, start: "top 95%", end: "top 50%", scrub: 1 } },
    );
  });
  todos("[data-trazar]").forEach((icono) => {
    todos<SVGGeometryElement>("path, line, circle, rect, polyline, polygon", icono).forEach((forma) => {
      const largo = forma.getTotalLength?.() ?? 0;
      if (!largo) return;
      gsap.fromTo(
        forma,
        { strokeDasharray: largo, strokeDashoffset: largo },
        { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: icono, start: "top 90%", end: "top 55%", scrub: 1 } },
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
        start: "top 85%",
        end: "bottom 55%",
        scrub: 1,
        onUpdate: (st) => {
          const n = Math.floor(st.progress * items.length + 0.2);
          items.forEach((item, i) => (item.dataset.activo = String(i < n)));
        },
      },
    });
    items.forEach((item, i) => {
      tl.fromTo(item, { opacity: 0.3, y: 32 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
      if (rellenos[i]) tl.to(rellenos[i], { scaleX: 1, duration: 0.5 });
    });
    todos("[data-miniatura]", lista).forEach((img) => {
      gsap.fromTo(img, { scale: 1.08 }, { scale: 1, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom 50%", scrub: 1 } });
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
    defaults: { ease: "power3.inOut" },
    scrollTrigger: {
      trigger: peli,
      start: "center center",
      // En móvil cada capítulo pide menos recorrido para no hacer la sección eterna.
      end: () => `+=${n * (window.innerWidth < 768 ? 55 : 90)}%`,
      invalidateOnRefresh: true,
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
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
      tl.to(fotogramas[i], { opacity: 0, yPercent: -3, duration: 0.35 }, i + 0.65);
      tl.fromTo(fotogramas[i + 1], { opacity: 0, yPercent: 3, scale: 1.015 }, { opacity: 1, yPercent: 0, scale: 1, duration: 0.35 }, i + 0.65);
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
        { x: 40 * lado, y: 24, rotationY: -6 * lado, opacity: 0, transformPerspective: 1400 },
        { x: 0, y: 0, rotationY: 0, opacity: 1, ease: "power3.out", scrollTrigger: { trigger: lista, start: `top ${96 - i * 3}%`, end: "top 55%", scrub: 1 } },
      );
    });
  });
}

// 6b. Respaldo: el bloque «Ya lo hemos hecho» crece y la línea une los hitos.
function evolucion() {
  const bloque = document.querySelector<HTMLElement>("[data-evolucion]");
  if (!bloque) return;
  const linea = bloque.querySelector("[data-evolucion-linea]");
  const hitos = todos("[data-hito]", bloque);
  gsap.fromTo(bloque, { scale: 0.94, y: 40, borderRadius: 48 }, { scale: 1, y: 0, borderRadius: 28, ease: "power3.out", scrollTrigger: { trigger: bloque, start: "top 95%", end: "top 55%", scrub: 1 } });
  gsap.from(bloque.querySelector("[data-evolucion-texto]"), { x: -30, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: bloque, start: "top 75%", toggleActions: "play none none reverse" } });
  const tl = gsap.timeline({ scrollTrigger: { trigger: bloque, start: "top 70%", end: "center 45%", scrub: 1 } });
  if (linea) {
    gsap.set(linea, { scaleX: 0 });
    tl.to(linea, { scaleX: 1, ease: "none", duration: 1 }, 0);
  }
  hitos.forEach((h, i) => {
    tl.fromTo(h, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: "power3.out" }, i * 0.35);
    tl.fromTo(h.firstElementChild, { scale: 0.5 }, { scale: 1, duration: 0.3, ease: "back.out(2.2)" }, i * 0.35);
  });
}

// 7. Cierre: la onda de la marca se dibuja detrás y el texto se revela.
function cierre() {
  const bloque = document.querySelector<HTMLElement>("[data-cierre]");
  if (!bloque) return;
  const onda = bloque.querySelector("[data-onda]");
  if (onda) {
    gsap.fromTo(onda, { strokeDasharray: "0 100" }, { strokeDasharray: "100 0", ease: "none", scrollTrigger: { trigger: bloque, start: "top 90%", end: "bottom 60%", scrub: 1.2 } });
  }
  gsap.from(todos("[data-revelar]", bloque), {
    y: 24,
    opacity: 0,
    duration: 1,
    ease: "expo.out",
    stagger: 0.12,
    scrollTrigger: { trigger: bloque, start: "top 80%", toggleActions: "play none none reverse" },
  });
}
