"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// «Quién ve qué» como una lente: se elige un perfil y las capas que no puede ver se apagan.
const PERFILES = [
  { clave: "plantilla", titulo: "Persona trabajadora" },
  { clave: "empresa", titulo: "Empresa" },
  { clave: "partner", titulo: "Partner" },
  { clave: "tecnico", titulo: "Técnico de prevención" },
] as const;
type Perfil = (typeof PERFILES)[number]["clave"];

const CAPAS: { dato: string; nota: string; acceso: Record<Perfil, string> }[] = [
  {
    dato: "Respuestas individuales",
    nota: "Nadie puede leerlas. Tampoco la empresa.",
    acceso: { plantilla: "Solo envía la suya", empresa: "No", partner: "No", tecnico: "No" },
  },
  {
    dato: "Resultados de grupo",
    nota: "Solo grupos de 5 respuestas o más.",
    acceso: { plantilla: "No", empresa: "Sí", partner: "Sí", tecnico: "Sí" },
  },
  {
    dato: "Plan de acción",
    nota: "Medidas con responsable y fecha.",
    acceso: { plantilla: "No", empresa: "Edita", partner: "Consulta", tecnico: "Edita" },
  },
  {
    dato: "Dossier de evidencias",
    nota: "Línea temporal y documentos fechados.",
    acceso: { plantilla: "No", empresa: "Sí", partner: "Sí", tecnico: "Sí" },
  },
];

const ve = (valor: string) => valor !== "No";

export function Lente() {
  const [perfil, setPerfil] = useState<Perfil>("empresa");
  const caja = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const capas = gsap.utils.toArray<HTMLElement>("[data-placa]", caja.current);
      const mm = gsap.matchMedia();
      const aplicar = (d: number) =>
        capas.forEach((placa, i) => {
          const visible = placa.dataset.visible === "true";
          gsap.to(placa, {
            z: visible ? (CAPAS.length - i) * 34 + 20 : (CAPAS.length - i) * 34 - 30,
            opacity: visible ? 1 : 0.38,
            duration: d,
            ease: "power3.out",
            delay: d ? i * 0.05 : 0,
          });
        });
      mm.add("(prefers-reduced-motion: no-preference)", () => aplicar(0.7));
      mm.add("(prefers-reduced-motion: reduce)", () => aplicar(0));
      return () => mm.revert();
    },
    { scope: caja, dependencies: [perfil] },
  );

  return (
    <div ref={caja} className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <div className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-3 text-sm text-tinta-suave">Mire los datos como:</legend>
          {PERFILES.map((p) => {
            const activo = p.clave === perfil;
            return (
              <label
                key={p.clave}
                className={`group flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-full border px-5 transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--foco)] ${
                  activo ? "border-tinta bg-tinta text-[var(--texto-sobre-marca)]" : "border-linea-fuerte bg-superficie hover:border-tinta"
                }`}
              >
                <input type="radio" name="perfil" value={p.clave} checked={activo} onChange={() => setPerfil(p.clave)} className="sr-only" />
                <span className="font-medium">{p.titulo}</span>
                <span className={`font-mono text-xs ${activo ? "text-lumbre-claro" : "text-tinta-suave"}`}>
                  {CAPAS.filter((c) => ve(c.acceso[p.clave])).length} / {CAPAS.length}
                </span>
              </label>
            );
          })}
        </fieldset>
        <p className="text-sm text-tinta-suave">Los permisos se aplican en la base de datos, no solo en la pantalla.</p>
      </div>

      {/* Pila de capas en 3D. El texto de cada capa es el dato accesible. */}
      <div className="lente relative">
        <ul className="lente-pila" aria-live="polite">
          {CAPAS.map((capa) => {
            const valor = capa.acceso[perfil];
            const visible = ve(valor);
            return (
              <li key={capa.dato} data-placa data-visible={visible} className={`lente-placa ${visible ? "lente-placa--ve" : ""}`}>
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{capa.dato}</span>
                  <span className="text-xs text-tinta-suave">{capa.nota}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${visible ? "bg-tinta text-[var(--texto-sobre-marca)]" : "border border-linea-fuerte text-tinta-suave"}`}>
                  {valor}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
