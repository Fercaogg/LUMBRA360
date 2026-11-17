"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import { ONDA_CAJA, ONDA_TRANSFORMACION, ONDA_TRAZADO } from "@/components/marca/onda";
import { LEMA } from "@/config/marca";

gsap.registerPlugin(useGSAP);

// «Vídeo» de la portada: una animación en bucle que muestra qué es LUMBRA360 sin explicarlo.
// Se dibuja en un lienzo virtual de 1600 × 1013 px que se escala a la pantalla del portátil.
// Todos los datos son de ejemplo (los mismos de la empresa de demostración).
// Con «reducir movimiento» se ve quieto el panel de resultados.

const ANCHO = 1600;
const ALTO = 1013;
const PERSONAS = 24;
const RESPONDEN = 18;
const GRUPOS = [9, 6, 3];

const MEDIDAS = ["Redistribuir picos de trabajo", "Formación en desconexión digital", "Revisar avisos fuera de horario"];
const EVIDENCIAS = [
  ["Campaña cerrada", "19 oct"],
  ["Informe del técnico firmado", "7 nov"],
  ["Plan de acción aprobado", "10 nov"],
  ["Política de desconexión", "17 nov"],
  ["Acuses de lectura", "18 nov"],
];

function Onda({ className = "", trazo = false }: { className?: string; trazo?: boolean }) {
  return (
    <svg viewBox={ONDA_CAJA} className={className} aria-hidden>
      <path
        data-onda-trazo={trazo || undefined}
        d={ONDA_TRAZADO}
        transform={ONDA_TRANSFORMACION}
        pathLength={100}
        fill="var(--lumbre)"
        stroke="var(--lumbre)"
        strokeWidth="2"
      />
    </svg>
  );
}

function Etiqueta({ n, texto }: { n: string; texto: string }) {
  return (
    <p className="absolute left-[72px] top-[64px] flex items-center gap-4 font-mono text-[22px] uppercase tracking-[0.14em] text-tinta-suave">
      <span>{n}</span>
      <span className="h-px w-12 bg-linea-fuerte" />
      <span>{texto}</span>
    </p>
  );
}

export function VideoLumbra() {
  const marco = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const raiz = marco.current;
      const tela = lienzo.current;
      if (!raiz || !tela) return;

      // Escala el lienzo virtual al tamaño real de la pantalla.
      const ajustar = () => tela.style.setProperty("--escala", String(raiz.clientWidth / ANCHO));
      ajustar();
      const observador = new ResizeObserver(ajustar);
      observador.observe(raiz);

      const q = gsap.utils.selector(tela);
      const escenas = q("[data-escena]");
      const mostrar = (i: number) => gsap.set(escenas, { autoAlpha: (k: number) => (k === i ? 1 : 0) });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        mostrar(4);
        gsap.set(q("[data-barra-nivel]"), { scaleX: 1 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        mostrar(0);
        const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "power3.out" } });
        const pasar = (de: number, a: number) =>
          tl
            .to(escenas[de], { autoAlpha: 0, scale: 0.98, duration: 0.5, ease: "power2.in" })
            .fromTo(escenas[a], { autoAlpha: 0, scale: 1.02 }, { autoAlpha: 1, scale: 1, duration: 0.6 }, "<0.2");

        // 0. Intro: la onda se dibuja y se rellena; aparece la marca.
        tl.fromTo(q("[data-onda-trazo]"), { strokeDasharray: "0 100", fillOpacity: 0 }, { strokeDasharray: "100 0", duration: 1.1, ease: "power2.inOut" })
          .to(q("[data-onda-trazo]"), { fillOpacity: 1, duration: 0.4 })
          .from(q("[data-intro-texto]"), { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.15 }, "-=0.2")
          .to({}, { duration: 1 });

        // 1. Escuchar: el móvil envía y las respuestas se encienden, sin nombre.
        pasar(0, 1);
        tl.from(q("[data-movil-v]"), { y: 60, autoAlpha: 0, duration: 0.7 }, "<0.2")
          .to(q("[data-opcion]")[2], { backgroundColor: "var(--tinta-900)", borderColor: "var(--tinta-900)", duration: 0.25 }, "+=0.2")
          .to(q("[data-enviar]"), { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1 }, "+=0.15")
          .to(q("[data-persona-activa]"), { backgroundColor: "var(--lumbre)", borderColor: "var(--lumbre)", scale: 1, duration: 0.25, stagger: { each: 0.06, from: "random" } }, "+=0.05")
          .fromTo(q("[data-contador]"), { textContent: 0 }, { textContent: RESPONDEN, snap: { textContent: 1 }, duration: 1.1, ease: "none" }, "<")
          .from(q("[data-sin-identidad]"), { autoAlpha: 0, y: 16, duration: 0.5 }, "-=0.3")
          .to({}, { duration: 0.9 });

        // 2. Agrupar: solo se ven los grupos de 5 o más.
        pasar(1, 2);
        tl.from(q("[data-grupo]"), { y: 50, autoAlpha: 0, duration: 0.6, stagger: 0.15 }, "<0.2")
          .from(q("[data-punto-grupo]"), { scale: 0, duration: 0.3, stagger: 0.03, ease: "back.out(2)" }, "-=0.3")
          .from(q("[data-sello-grupo]"), { scale: 0.6, autoAlpha: 0, duration: 0.4, stagger: 0.2, ease: "back.out(2)" })
          .to({}, { duration: 1 });

        // 3. Resultados: el panel se rellena.
        pasar(2, 3);
        tl.fromTo(q("[data-participacion]"), { textContent: 0 }, { textContent: 75, snap: { textContent: 1 }, duration: 1, ease: "power2.out" }, "<0.3")
          .fromTo(q("[data-barra-nivel]"), { scaleX: 0 }, { scaleX: 1, duration: 0.7, stagger: 0.12, ease: "power2.out" }, "<0.2")
          .from(q("[data-leyenda]"), { autoAlpha: 0, y: 10, duration: 0.4, stagger: 0.1 }, "-=0.3")
          .to({}, { duration: 1.1 });

        // 4. Plan de acción: las medidas avanzan.
        pasar(3, 4);
        tl.from(q("[data-medida]"), { x: -40, autoAlpha: 0, duration: 0.5, stagger: 0.15 }, "<0.2");
        q("[data-estado]").forEach((estado, i) => {
          tl.to(estado, { backgroundColor: "var(--correcto-fondo)", color: "var(--correcto-texto)", duration: 0.25 }, `+=${i === 0 ? 0.3 : 0.15}`).add(() => {
            estado.textContent = "Hecha";
          }, "<");
          tl.from(q("[data-check]")[i], { scale: 0, duration: 0.3, ease: "back.out(3)" }, "<");
        });
        tl.to({}, { duration: 0.9 });

        // 5. Evidencias: cada paso queda sellado con fecha.
        pasar(4, 5);
        tl.from(q("[data-evidencia]"), { y: 30, autoAlpha: 0, duration: 0.45, stagger: 0.22 }, "<0.2")
          .from(q("[data-sello]"), { scale: 1.8, autoAlpha: 0, rotation: -12, duration: 0.35, stagger: 0.22, ease: "back.out(2)" }, "<0.25")
          .to({}, { duration: 1.1 });

        // 6. Cierre: lema y vuelta a empezar.
        pasar(5, 6);
        tl.from(q("[data-cierre-v]"), { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.15 }, "<0.3").to({}, { duration: 1.6 });
        tl.to(escenas[6], { autoAlpha: 0, duration: 0.5 }).set(q("[data-estado]"), { textContent: "Pendiente" });

        // Solo se reproduce cuando se ve: ahorra batería y no distrae fuera de pantalla.
        // (IntersectionObserver y no ScrollTrigger: la portada está fijada y el vídeo debe seguir.)
        const visor = new IntersectionObserver(([entrada]) => (entrada.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.15 });
        visor.observe(raiz);
        return () => visor.disconnect();
      });

      return () => {
        observador.disconnect();
        mm.revert();
      };
    },
    { scope: marco },
  );

  const personas = Array.from({ length: PERSONAS }, (_, i) => i);
  const activas = new Set([0, 1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 17, 18, 20, 21, 23]);

  return (
    <div ref={marco} role="img" aria-label="Animación de ejemplo: la plantilla responde de forma anónima, los resultados se agrupan, se acuerdan medidas y cada paso queda fechado." className="absolute inset-0 overflow-hidden bg-superficie">
      <div ref={lienzo} className="absolute left-0 top-0 origin-top-left text-tinta" style={{ width: ANCHO, height: ALTO, transform: "scale(var(--escala, 0.5))" }}>
        <p className="absolute bottom-[48px] right-[64px] z-10 rounded-full bg-[var(--aviso-fondo)] px-5 py-2 text-[20px] font-medium text-[var(--aviso-texto)]">Datos de ejemplo</p>

        {/* 0. Intro */}
        <section data-escena className="absolute inset-0 flex flex-col items-center justify-center gap-10 bg-papel">
          <Onda trazo className="w-[300px]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-intro-texto src="/marca/lumbra-horizontal-positivo.svg" alt="" className="h-[110px] w-auto" />
          <p data-intro-texto className="text-[36px] text-tinta-suave">{LEMA}</p>
        </section>

        {/* 1. Escuchar */}
        <section data-escena className="absolute inset-0">
          <Etiqueta n="01" texto="Escuchar" />
          <div data-movil-v className="absolute left-[150px] top-[170px] h-[700px] w-[350px] rounded-[48px] bg-[var(--tinta-900)] p-[12px] shadow-[0_40px_80px_-40px_rgb(17_17_17/0.5)]">
            <div className="flex h-full flex-col gap-6 rounded-[38px] bg-superficie p-8">
              <div className="h-4 w-24 rounded-full bg-[var(--piedra-200)]" />
              <div className="flex flex-col gap-3">
                <div className="h-5 w-full rounded-full bg-[var(--piedra-300)]" />
                <div className="h-5 w-3/4 rounded-full bg-[var(--piedra-300)]" />
              </div>
              <div className="mt-2 flex flex-col gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-full border-2 border-linea px-5 py-4">
                    <span data-opcion className="size-6 rounded-full border-2 border-[var(--piedra-400)]" />
                    <span className="h-4 flex-1 rounded-full bg-[var(--piedra-200)]" />
                  </div>
                ))}
              </div>
              <div data-enviar className="mt-auto grid h-16 place-items-center rounded-full bg-[var(--tinta-900)] text-[24px] font-medium text-white">Enviar</div>
            </div>
          </div>
          <div className="absolute left-[640px] top-[220px] flex flex-col gap-12">
            <div className="grid grid-cols-6 gap-7">
              {personas.map((i) => (
                <span
                  key={i}
                  {...(activas.has(i) ? { "data-persona-activa": true } : {})}
                  className="size-[96px] rounded-full border-[3px] border-[var(--piedra-300)] bg-[var(--piedra-100)]"
                />
              ))}
            </div>
            <p className="flex items-baseline gap-4">
              <span data-contador className="text-[88px] font-medium leading-none tracking-[-0.04em] tabular-nums">
                {RESPONDEN}
              </span>
              <span className="text-[34px] text-tinta-suave">de {PERSONAS} respuestas</span>
            </p>
            <p data-sin-identidad className="flex gap-3 text-[28px]">
              {["Sin nombre", "Sin IP", "Sin hora"].map((t) => (
                <span key={t} className="rounded-full border-2 border-linea-fuerte px-5 py-2">
                  {t}
                </span>
              ))}
            </p>
          </div>
        </section>

        {/* 2. Agrupar */}
        <section data-escena className="absolute inset-0">
          <Etiqueta n="02" texto="Agrupar" />
          <div className="absolute inset-x-[120px] top-[200px] grid grid-cols-3 gap-12">
            {GRUPOS.map((n, g) => {
              const visible = n >= 5;
              return (
                <div
                  key={g}
                  data-grupo
                  className={`flex h-[600px] flex-col gap-8 rounded-[32px] border-[3px] p-10 ${visible ? "border-[var(--tinta-900)] bg-superficie" : "border-dashed border-[var(--piedra-400)] bg-[repeating-linear-gradient(45deg,var(--piedra-100)_0_6px,transparent_6px_18px)]"}`}
                >
                  <p className="text-[34px] font-semibold">Grupo {String.fromCharCode(65 + g)}</p>
                  <div className="grid grid-cols-3 gap-5">
                    {Array.from({ length: n }, (_, i) => (
                      <span key={i} data-punto-grupo className={`size-[88px] rounded-full ${visible ? "bg-lumbre" : "bg-[var(--piedra-300)]"}`} />
                    ))}
                  </div>
                  <p
                    data-sello-grupo
                    className={`mt-auto self-start rounded-full px-6 py-3 text-[28px] font-semibold ${visible ? "bg-[var(--tinta-900)] text-white" : "border-2 border-[var(--piedra-400)] text-tinta-suave"}`}
                  >
                    {visible ? `${n} · se muestra` : `${n} · no se muestra`}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Resultados */}
        <section data-escena className="absolute inset-0">
          <Etiqueta n="03" texto="Resultados" />
          <div className="absolute inset-x-[120px] top-[190px] flex flex-col gap-12">
            <div className="flex items-end gap-6">
              <span className="text-[200px] font-medium leading-[0.85] tracking-[-0.05em] tabular-nums">
                <span data-participacion>75</span>
                <span className="text-[110px]"> %</span>
              </span>
              <span className="pb-6 text-[34px] text-tinta-suave">de participación</span>
            </div>
            <div className="flex flex-col gap-8 rounded-[32px] border-2 border-linea p-12">
              <p className="text-[32px] font-semibold">Factor de ejemplo</p>
              <div className="flex h-[56px] overflow-hidden rounded-full">
                {[
                  ["22%", "var(--dato-desfavorable)"],
                  ["39%", "var(--dato-intermedio)"],
                  ["39%", "var(--dato-favorable)"],
                ].map(([ancho, color]) => (
                  <span key={color} data-barra-nivel className="h-full origin-left" style={{ width: ancho, background: color }} />
                ))}
              </div>
              <div className="flex gap-12 text-[28px]">
                {[
                  ["Nivel 1", "22 %", "var(--dato-desfavorable)"],
                  ["Nivel 2", "39 %", "var(--dato-intermedio)"],
                  ["Nivel 3", "39 %", "var(--dato-favorable)"],
                ].map(([n, v, c]) => (
                  <span key={n} data-leyenda className="flex items-center gap-3">
                    <span className="size-5 rounded-full" style={{ background: c }} />
                    {n} <strong className="font-semibold tabular-nums">{v}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Plan de acción */}
        <section data-escena className="absolute inset-0">
          <Etiqueta n="04" texto="Actuar" />
          <ul className="absolute inset-x-[120px] top-[200px] flex flex-col gap-8">
            {MEDIDAS.map((m, i) => (
              <li key={m} data-medida className="flex items-center gap-8 rounded-[28px] border-2 border-linea bg-superficie px-10 py-9">
                <span data-check className="grid size-[64px] place-items-center rounded-full bg-[var(--correcto-solido)] text-white">
                  <Check size={36} strokeWidth={3} />
                </span>
                <span className="flex flex-1 flex-col gap-2">
                  <span className="text-[36px] font-semibold">{m}</span>
                  <span className="text-[26px] text-tinta-suave">Responsable y fecha · ejemplo {i + 1}</span>
                </span>
                <span data-estado className="rounded-full bg-[var(--aviso-fondo)] px-6 py-3 text-[26px] font-semibold text-[var(--aviso-texto)]">
                  Pendiente
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Evidencias */}
        <section data-escena className="absolute inset-0">
          <Etiqueta n="05" texto="Demostrar" />
          <ol className="absolute left-[160px] right-[160px] top-[180px] flex flex-col">
            {EVIDENCIAS.map(([t, f]) => (
              <li key={t} data-evidencia className="relative flex items-center gap-8 border-l-[3px] border-linea-fuerte py-6 pl-12">
                <span className="absolute -left-[14px] size-[25px] rounded-full border-[3px] border-[var(--tinta-900)] bg-superficie" />
                <span className="w-[150px] font-mono text-[28px] text-tinta-suave">{f}</span>
                <span className="flex-1 text-[34px] font-semibold">{t}</span>
                <span data-sello className="rounded-full border-[3px] border-lumbre px-5 py-2 text-[24px] font-semibold uppercase tracking-[0.08em] text-[var(--lumbre-600)]">
                  Fechado
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* 6. Cierre */}
        <section data-escena className="absolute inset-0 flex flex-col items-center justify-center gap-10 bg-[var(--tinta-900)] text-white">
          <span data-cierre-v>
            <Onda className="w-[240px]" />
          </span>
          <p data-cierre-v className="text-[72px] font-medium tracking-[-0.04em]">
            {LEMA}
          </p>
        </section>
      </div>
    </div>
  );
}
