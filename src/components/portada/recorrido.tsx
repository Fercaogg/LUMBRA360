"use client";

import { useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ORIGEN_INSST } from "@/config/atribucion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Recorrido del método: un escenario 3D fijo mientras se leen cuatro pasos.
// Todo lo que muestra el escenario es un ejemplo ficticio (18 respuestas en tres grupos).

const PASOS = [
  {
    corto: "Responder",
    titulo: "Responder sin dejar rastro.",
    texto: "Cuestionarios breves y voluntarios. Se entra con un código, sin cuenta. Junto a cada respuesta no se guarda nombre, IP ni hora: solo el día.",
    detalle: ["Sin cuenta ni correo", "Código de un solo uso", "Solo se guarda el día"],
  },
  {
    corto: "Agrupar",
    titulo: "Ningún grupo de menos de 5.",
    texto: "Los resultados solo se muestran por grupos de 5 respuestas o más. También al cruzar filtros y al exportar. Y no se pueden deducir restando un grupo de otro.",
    detalle: ["Mínimo de 5 por grupo", "También con filtros combinados", "Resultados al cerrar la campaña"],
  },
  {
    corto: "Decidir",
    titulo: "El método lo pone el técnico.",
    texto: "En la evaluación, la plataforma no calcula puntuaciones. Exporta las respuestas para tratarlas con FPSICO 4.1, y el técnico de prevención registra y firma su informe.",
    detalle: ["Sin puntuaciones propias", "Exportación para FPSICO", "Informe firmado por el técnico"],
  },
  {
    corto: "Demostrar",
    titulo: "Todo queda fechado.",
    texto: "Campañas, informe, plan de acción, política de desconexión, audiencia, acuses y formación. Cada paso deja una evidencia que no se puede editar después.",
    detalle: ["Evidencias que no se editan", "Línea temporal por empresa", "Dossier para un requerimiento"],
  },
] as const;

const TOTAL = 18;
const CAPAS = ["Campaña", "Informe", "Plan de acción", "Política", "Acuses", "Formación"];
const LADO = 440; // tamaño del plano, en px
const CUBO = 28;

// Posiciones de cada cubo en cada paso (coordenadas del plano).
function posiciones(paso: number): { x: number; y: number; s: number; o: number }[] {
  const ruido = (i: number, k: number) => Math.sin(i * 12.9898 + k * 78.233) * 9;
  return Array.from({ length: TOTAL }, (_, i) => {
    if (paso === 0) {
      const c = i % 6;
      const f = Math.floor(i / 6);
      return { x: 52 + c * 62 + ruido(i, 1), y: 118 + f * 78 + ruido(i, 2), s: 1, o: 1 };
    }
    if (paso === 1) {
      if (i < 9) return { x: 70 + (i % 3) * 38, y: 92 + Math.floor(i / 3) * 38, s: 1, o: 1 };
      if (i < 15) {
        const j = i - 9;
        return { x: 262 + (j % 3) * 38, y: 112 + Math.floor(j / 3) * 38, s: 1, o: 1 };
      }
      const j = i - 15;
      return { x: 170 + j * 38, y: 318, s: 1, o: 0.8 };
    }
    // Pasos 2 y 3: se recogen en el centro y desaparecen dentro del informe.
    return { x: LADO / 2 - CUBO / 2 + ((i % 3) - 1) * 10, y: LADO / 2 - CUBO / 2 + ((Math.floor(i / 3) % 3) - 1) * 10, s: 0.2, o: 0 };
  });
}

function tono(paso: number, i: number): string {
  if (paso === 0) return "respondido";
  if (paso === 1) return i < 15 ? "visible" : "oculto";
  return "visible";
}

export function Recorrido() {
  const caja = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);

  useGSAP(
    () => {
      const raiz = caja.current;
      if (!raiz) return;
      const q = gsap.utils.selector(raiz);
      const cubos = q("[data-cubo]") as HTMLElement[];
      const etiquetas = q("[data-etiqueta]") as HTMLElement[];
      const zonas = q("[data-zona]") as HTMLElement[];
      const hojas = q("[data-hoja]") as HTMLElement[];
      const capas = q("[data-capa]") as HTMLElement[];
      const camara = q("[data-camara]")[0] as HTMLElement;

      // Las etiquetas miran siempre a la cámara: deshacen el giro del plano.
      gsap.set([...etiquetas, ...hojas], { rotationZ: 40, rotationX: -58, transformOrigin: "50% 100%" });

      let llamadas: gsap.core.Tween[] = [];
      let tl: gsap.core.Timeline | null = null;
      const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const irA = (paso: number, instante = reducido) => {
        setActual(paso);
        tl?.kill();
        llamadas.forEach((l) => l.kill());
        llamadas = [];
        const d = instante ? 0 : 1;
        const pos = posiciones(paso);
        tl = gsap.timeline({ defaults: { duration: d, ease: "power3.inOut" } });

        cubos.forEach((cubo, i) => {
          const p = pos[i];
          tl!.to(cubo, { x: p.x, y: p.y, scale: p.s, opacity: p.o, z: paso >= 2 ? 40 : 0 }, instante ? 0 : i * 0.018);
          const aplicar = () => (cubo.dataset.tono = tono(paso, i));
          if (instante) aplicar();
          else llamadas.push(gsap.delayedCall(0.25 + i * 0.04, aplicar));
        });

        etiquetas.forEach((e) => {
          const visible = Number(e.dataset.paso) === paso;
          tl!.to(e, { opacity: visible ? 1 : 0, z: visible ? Number(e.dataset.z ?? 90) : 30, duration: d * 0.7 }, visible ? d * 0.45 : 0);
        });
        zonas.forEach((z) => tl!.to(z, { opacity: paso === 1 ? 1 : 0, duration: d * 0.6 }, paso === 1 ? d * 0.3 : 0));

        hojas.forEach((h, i) => {
          const visible = paso === 2;
          tl!.to(h, { opacity: visible ? 1 : 0, z: visible ? 30 + i * 70 : 0, duration: d * 0.8 }, visible ? d * 0.5 + i * 0.25 * (instante ? 0 : 1) : 0);
        });

        capas.forEach((c, i) => {
          const visible = paso === 3;
          tl!.to(c, { opacity: visible ? 1 : 0, z: visible ? i * 16 : 220 + i * 30, duration: d * 0.8, ease: "expo.out" }, visible ? d * 0.4 + i * 0.12 * (instante ? 0 : 1) : 0);
        });

        if (camara) tl.to(camara, { rotationY: [0, -6, 4, -3][paso], rotationX: [0, 4, 8, 2][paso], scale: [1, 1.04, 1.08, 1][paso], duration: d * 1.2 }, 0);
      };

      // Estado inicial sin animación.
      gsap.set(capas, { opacity: 0, z: 220 });
      gsap.set(hojas, { opacity: 0, z: 0 });
      irA(0, true);

      const disparadores = (q("[data-paso-texto]") as HTMLElement[]).map((articulo, i) =>
        ScrollTrigger.create({
          trigger: articulo,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (st) => st.isActive && irA(i),
        }),
      );

      return () => {
        disparadores.forEach((d) => d.kill());
        llamadas.forEach((l) => l.kill());
        tl?.kill();
      };
    },
    { scope: caja },
  );

  return (
    <div ref={caja} className="relative grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
      {/* Escenario fijo */}
      <div className="sticky top-16 z-0 h-[50svh] lg:top-[10vh] lg:order-2 lg:h-[80vh]">
        <div aria-hidden className="recorrido-escenario relative h-full w-full overflow-hidden rounded-[var(--radio-xl)] bg-[var(--piedra-50)]">
          <div className="recorrido-encaje absolute left-1/2 top-1/2">
            <div data-camara className="recorrido-camara">
              <div className="recorrido-plano" style={{ width: LADO, height: LADO }}>
                {/* Zonas de los grupos (paso 2) */}
                <div data-zona className="recorrido-zona" style={{ left: 54, top: 76, width: 146, height: 146 }} />
                <div data-zona className="recorrido-zona" style={{ left: 246, top: 96, width: 146, height: 108 }} />
                <div data-zona className="recorrido-zona recorrido-zona--oculta" style={{ left: 154, top: 302, width: 146, height: 60 }} />

                {Array.from({ length: TOTAL }, (_, i) => (
                  <div key={i} data-cubo data-tono="neutro" className="cubo" style={{ width: CUBO, height: CUBO, "--h": `${CUBO}px` } as CSSProperties}>
                    <span className="cubo-cara cubo-n" />
                    <span className="cubo-cara cubo-s" />
                    <span className="cubo-cara cubo-e" />
                    <span className="cubo-cara cubo-o" />
                    <span className="cubo-cara cubo-techo" />
                  </div>
                ))}

                {/* Hojas del paso 3 */}
                <div data-hoja className="recorrido-hoja" style={{ left: LADO / 2 - 150, top: LADO / 2 + 10 }}>
                  <span className="font-mono text-[0.6rem] tracking-[0.12em] text-tinta-suave">EXPORTACIÓN</span>
                  <span className="font-mono text-xs text-tinta">respuestas.txt</span>
                  <span className="mt-auto text-[0.65rem] text-tinta-suave">Para tratar en FPSICO 4.1</span>
                </div>
                <div data-hoja className="recorrido-hoja recorrido-hoja--firmada" style={{ left: LADO / 2 - 20, top: LADO / 2 - 60 }}>
                  <span className="font-mono text-[0.6rem] tracking-[0.12em] text-tinta-suave">INFORME DEL TÉCNICO</span>
                  <span className="font-serif text-base leading-tight text-tinta">Evaluación psicosocial</span>
                  <span className="mt-auto flex items-center gap-1.5 text-[0.65rem] font-semibold text-correcto">
                    <span className="size-1.5 rounded-full bg-[var(--correcto-solido)]" />
                    Firmado
                  </span>
                </div>

                {/* Capas del dossier (paso 4) */}
                {CAPAS.map((nombre, i) => (
                  <div key={nombre} data-capa className="recorrido-capa" style={{ left: LADO / 2 - 110, top: LADO / 2 - 78 }}>
                    <span className="font-mono text-[0.6rem] tracking-[0.12em] text-tinta-suave">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-semibold text-tinta">{nombre}</span>
                    <span className="ml-auto size-2 rounded-full bg-lumbre" />
                  </div>
                ))}

                {/* Etiquetas que miran a la cámara */}
                <Etiqueta paso={0} x={LADO / 2 - 110} y={LADO / 2 - 40} z={110}>
                  Sin nombre · sin IP · sin hora
                </Etiqueta>
                <Etiqueta paso={1} x={60} y={80} z={80}>
                  9 respuestas · se muestra
                </Etiqueta>
                <Etiqueta paso={1} x={250} y={100} z={80}>
                  6 respuestas · se muestra
                </Etiqueta>
                <Etiqueta paso={1} x={170} y={372} z={60} oculta>
                  3 respuestas · no se muestra
                </Etiqueta>
                <Etiqueta paso={3} x={LADO / 2 - 40} y={LADO / 2 - 150} z={190}>
                  Cada paso, con fecha
                </Etiqueta>
              </div>
            </div>
          </div>

          {/* Información del escenario */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
            <span className="rounded-full border border-linea bg-superficie/80 px-2.5 py-1 text-[0.7rem] font-medium text-tinta-suave backdrop-blur">Ejemplo ficticio</span>
            <span className="font-mono text-xs text-tinta-suave">
              {String(actual + 1).padStart(2, "0")} / {String(PASOS.length).padStart(2, "0")}
            </span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex gap-1.5 p-4 sm:p-5">
            {PASOS.map((p, i) => (
              <span key={p.corto} className="flex flex-1 flex-col gap-2">
                <span className={`h-0.5 rounded-full transition-colors duration-500 ${i <= actual ? "bg-tinta" : "bg-linea-fuerte"}`} />
                <span className={`hidden text-xs transition-colors duration-500 sm:block ${i === actual ? "text-tinta" : "text-tinta-suave"}`}>{p.corto}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Texto de los pasos */}
      <ol className="relative z-10 lg:order-1">
        {PASOS.map((paso, i) => (
          <li key={paso.titulo} data-paso-texto className="flex min-h-[100svh] items-end pb-8 lg:min-h-[92vh] lg:items-center lg:pb-0">
            <div className={`flex w-full flex-col gap-5 rounded-[var(--radio-lg)] bg-superficie/92 p-5 backdrop-blur-md transition-opacity duration-500 sm:p-7 lg:bg-transparent lg:p-0 lg:backdrop-blur-none ${i === actual ? "opacity-100" : "lg:opacity-35"}`}>
              <span className="font-mono text-xs tracking-[0.14em] text-tinta-suave">
                {String(i + 1).padStart(2, "0")} · {paso.corto.toUpperCase()}
              </span>
              <h3 className="text-balance font-serif text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.02] tracking-[-0.02em]">{paso.titulo}</h3>
              <p className="max-w-md text-pretty text-lg leading-relaxed text-tinta-suave">{paso.texto}</p>
              <ul className="flex flex-col border-t border-linea">
                {paso.detalle.map((d) => (
                  <li key={d} className="flex items-center gap-3 border-b border-linea py-2.5 text-sm">
                    <span aria-hidden className="size-1.5 rounded-full bg-lumbre" />
                    {d}
                  </li>
                ))}
              </ul>
              {i === 2 ? <p className="text-xs text-tinta-suave">{ORIGEN_INSST}.</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Etiqueta({ paso, x, y, z, oculta = false, children }: { paso: number; x: number; y: number; z: number; oculta?: boolean; children: string }) {
  return (
    <span
      data-etiqueta
      data-paso={paso}
      data-z={z}
      className={`recorrido-etiqueta ${oculta ? "recorrido-etiqueta--oculta" : ""}`}
      style={{ left: x, top: y, opacity: 0 }}
    >
      {children}
    </span>
  );
}
