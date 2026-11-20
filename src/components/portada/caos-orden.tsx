"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { aplazar } from "@/components/movimiento/aplazar";
import { Check, ClipboardList, FileSpreadsheet, FileText, Folder, Mail, ScrollText } from "lucide-react";
import { Simbolo } from "@/components/marca/logotipo";
import { NOMBRE } from "@/config/marca";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// «Por qué nace», en imagen: papeles sueltos que flotan desordenados en 3D
// y, al bajar, se colocan en orden con su fecha. Es una ilustración, no datos.
// Sin JavaScript o con «reducir movimiento» se ve ya ordenado.

const PAPELES = [
  { icono: Mail, titulo: "Correo con la encuesta" },
  { icono: FileSpreadsheet, titulo: "Excel de respuestas" },
  { icono: FileText, titulo: "Acta de la reunión" },
  { icono: ScrollText, titulo: "Política en borrador" },
  { icono: ClipboardList, titulo: "Lista de firmas" },
  { icono: Folder, titulo: "Carpeta de prevención" },
];

// Desorden de partida de cada papel (px y grados), siempre el mismo.
const DESORDEN = [
  { x: -150, y: 70, z: -140, rotation: -18, rotationX: 24, rotationY: -30 },
  { x: 160, y: -40, z: 90, rotation: 15, rotationX: -20, rotationY: 26 },
  { x: -70, y: -130, z: 170, rotation: -9, rotationX: 32, rotationY: 12 },
  { x: 130, y: 30, z: -190, rotation: 23, rotationX: -14, rotationY: -32 },
  { x: -170, y: -90, z: 70, rotation: 10, rotationX: -28, rotationY: 20 },
  { x: 80, y: -190, z: -70, rotation: -25, rotationX: 18, rotationY: -16 },
];

const SEPARACION = 68; // px entre papeles ya ordenados

export function CaosOrden() {
  const escena = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      aplazar(() => {
      const raiz = escena.current;
      if (!raiz) return;
      const q = gsap.utils.selector(raiz);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // En móvil el desorden es más contenido: los papeles no se salen de la pantalla
        // y se ordenan antes, mientras la escena aún está entera a la vista.
        const estrecho = raiz.clientWidth < 480;
        const factor = Math.min(1, raiz.clientWidth / 520) * (estrecho ? 0.45 : 1);
        const giro = estrecho ? 0.45 : 1;
        const fondo = estrecho ? 0.25 : 1;
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: raiz, start: estrecho ? "top 90%" : "top 85%", end: estrecho ? "top 25%" : "center 40%", scrub: estrecho ? 0.6 : 1 },
        });
        tl.fromTo(
          q("[data-papel]"),
          {
            x: (i: number) => DESORDEN[i].x * factor,
            y: (i: number) => DESORDEN[i].y * factor,
            z: (i: number) => DESORDEN[i].z * fondo,
            rotation: (i: number) => DESORDEN[i].rotation * giro,
            rotationX: (i: number) => DESORDEN[i].rotationX * giro,
            rotationY: (i: number) => DESORDEN[i].rotationY * giro,
          },
          { x: 0, y: 0, z: 0, rotation: 0, rotationX: 0, rotationY: 0, duration: 1, stagger: 0.07 },
        )
          .fromTo(q("[data-antes]"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2 }, 0.75)
          .fromTo(q("[data-despues]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.85)
          .fromTo(q("[data-check]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.25, stagger: 0.05, ease: "back.out(2.5)" }, 0.9)
          .fromTo(q("[data-fecha]"), { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.05 }, 0.95)
          .fromTo(q("[data-nota-antes]"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2 }, 0.9);
      });
      return () => mm.revert();
    }),
    { scope: escena },
  );

  return (
    <div
      ref={escena}
      role="img"
      aria-label={`Ilustración: papeles sueltos (correos, hojas de cálculo, actas, firmas) que ${NOMBRE} pone en orden y con fecha.`}
      className="relative mx-auto w-full max-w-[32rem] [perspective:1600px]"
      style={{ height: 72 + PAPELES.length * SEPARACION + 24 }}
    >
      {/* Estado: antes / después */}
      <div className="absolute inset-x-0 top-0 flex h-10 justify-center">
        <span data-antes className="invisible absolute inline-flex h-10 items-center gap-2 rounded-full border border-dashed border-linea-fuerte bg-superficie px-4 text-sm font-medium text-tinta-suave opacity-0">
          Antes · papeles sueltos
        </span>
        <span data-despues className="absolute inline-flex h-10 items-center gap-2.5 rounded-full bg-tinta px-4 text-sm font-medium text-[var(--texto-sobre-marca)]">
          <Simbolo tamano={22} color="var(--lumbre)" />
          Con {NOMBRE} · todo en orden
        </span>
      </div>

      <div className="absolute inset-0 [transform-style:preserve-3d]">
        {PAPELES.map((p, i) => {
          const I = p.icono;
          return (
            <div
              key={p.titulo}
              data-papel
              className="absolute inset-x-[3%] flex h-14 items-center gap-3.5 rounded-[14px] border border-linea bg-superficie px-4 shadow-[0_18px_30px_-20px_rgb(17_17_17/0.35)]"
              style={{ top: 72 + i * SEPARACION }}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-papel text-tinta-suave">
                <I size={18} strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.95rem] font-medium">{p.titulo}</span>
              <span className="relative hidden h-4 w-[5.5rem] shrink-0 sm:block">
                <span data-nota-antes className="invisible absolute right-0 top-0 font-mono text-xs text-tinta-suave opacity-0">¿dónde está?</span>
                <span data-fecha className="absolute right-0 top-0 font-mono text-xs text-tinta-suave">fechado</span>
              </span>
              <span data-check className="grid size-7 shrink-0 place-items-center rounded-full bg-lumbre text-[var(--tinta-950)]">
                <Check size={15} strokeWidth={3} aria-hidden />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
