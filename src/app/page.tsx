import type { Metadata } from "next";
import Link from "next/link";
import { ORIGEN_INSST } from "@/config/atribucion";
import { LEMA, NOMBRE } from "@/config/marca";
import { Demostracion } from "@/components/portada/demostracion";
import { Orbita } from "@/components/portada/orbita";
import { Recorrido } from "@/components/portada/recorrido";
import { Lente } from "@/components/portada/lente";
import { EfectosPortada } from "@/components/portada/efectos";
import { Logotipo } from "@/components/marca/logotipo";
import { ONDA_CAJA, ONDA_TRANSFORMACION, ONDA_TRAZADO } from "@/components/marca/onda";

export const metadata: Metadata = {
  title: { absolute: `${NOMBRE} · ${LEMA}` },
  description: "Evaluación psicosocial continua y desconexión digital para pymes, con un dossier de evidencias fechadas.",
};

const PROBLEMA = `Evaluar los riesgos psicosociales y ordenar la desconexión digital pide participación real, un plan con responsables y pruebas de lo que se hace. En una pyme, todo eso acaba repartido entre correos, hojas sueltas y carpetas. ${NOMBRE} lo reúne en un solo sitio. Sin vigilar a nadie.`;

const PRINCIPIOS = [
  {
    titulo: "Nada de vigilancia",
    texto: "No medimos actividad, conexiones, horarios ni correos. Solo cuestionarios voluntarios y documentos.",
  },
  {
    titulo: "El técnico, al mando",
    texto: "La plataforma ordena y registra. El criterio profesional y la firma son del técnico de prevención.",
  },
  {
    titulo: "Para servicios de prevención y gestorías",
    texto: "Varias empresas desde un panel: altas, estado de cada evaluación y descarga de informes. Con su marca, si lo desea.",
  },
];

const pastilla =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-medium transition-[background-color,border-color,transform] duration-200 ease-salida active:scale-[0.97]";

function Indice({ n, texto, claro = false }: { n: string; texto: string; claro?: boolean }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-xs tracking-[0.14em] ${claro ? "text-[var(--tinta-200)]" : "text-tinta-suave"}`}>
      <span>{n}</span>
      <span aria-hidden className={`h-px w-10 ${claro ? "bg-white/30" : "bg-linea-fuerte"}`} />
      <span>{texto.toUpperCase()}</span>
    </p>
  );
}

export default function Portada() {
  return (
    <>
      <EfectosPortada />

      <header data-cabecera className="cabecera fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-16 w-full max-w-[84rem] items-center justify-between gap-4 px-4 sm:px-8">
          <Link href="/" aria-label={`${NOMBRE}, inicio`} className="rounded-md py-2">
            <Logotipo alto={22} decorativo />
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-6">
            <a href="#metodo" className="hidden py-2 text-sm text-tinta-suave transition-colors hover:text-tinta md:inline-flex">
              Método
            </a>
            <a href="#demostracion" className="hidden py-2 text-sm text-tinta-suave transition-colors hover:text-tinta sm:inline-flex">
              Demostración
            </a>
            <a href="#quien-ve-que" className="hidden py-2 text-sm text-tinta-suave transition-colors hover:text-tinta md:inline-flex">
              Quién ve qué
            </a>
            <Link href="/acceso" className={`${pastilla} min-h-10 bg-tinta px-5 text-sm text-[var(--texto-sobre-marca)] hover:bg-[var(--tinta-800)]`}>
              Acceder
            </Link>
          </nav>
        </div>
      </header>

      <main id="contenido" className="flex-1 overflow-x-clip">
        {/* 00 · Portada */}
        <section className="relative min-h-[100svh] pt-16">
          <div className="mx-auto grid w-full max-w-[84rem] items-center gap-6 px-4 pb-16 pt-6 sm:px-8 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:pb-10">
            <div className="order-2 flex flex-col gap-8 lg:order-1">
              <p className="aparecer font-mono text-xs tracking-[0.14em] text-tinta-suave">EVALUACIÓN PSICOSOCIAL · DESCONEXIÓN DIGITAL · PYMES</p>
              <h1 className="aparecer text-balance font-serif text-[clamp(3.1rem,8.4vw,7.6rem)] font-normal leading-[0.92] tracking-[-0.035em]">
                Cumplir y cuidar
                <br />
                <span className="text-[var(--tinta-500)]">sin vigilar.</span>
              </h1>
              <p className="aparecer max-w-lg text-pretty text-lg leading-relaxed text-tinta-suave">
                Cuestionarios anónimos, plan de acción y un dossier de evidencias fechadas. Todo ordenado por si llega un requerimiento de la Inspección de Trabajo.
              </p>
              <div className="aparecer flex flex-wrap items-center gap-3">
                <a href="#demostracion" className={`${pastilla} bg-tinta text-[var(--texto-sobre-marca)] hover:bg-[var(--tinta-800)]`}>
                  Ver la demostración
                </a>
                <a href="#metodo" className={`${pastilla} border border-linea-fuerte text-tinta hover:border-tinta`}>
                  Cómo funciona
                </a>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-tinta-suave">
                Herramienta de apoyo para el técnico de prevención. Independiente: no es un servicio de la Inspección de Trabajo ni del INSST.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <Orbita />
            </div>
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center lg:flex">
            <span className="indicador-scroll" />
          </div>
        </section>

        {/* 01 · El problema */}
        <section className="border-t border-linea">
          <div className="mx-auto grid w-full max-w-[84rem] gap-10 px-4 py-24 sm:px-8 sm:py-32 lg:grid-cols-[14rem_1fr]">
            <Indice n="01" texto="El problema" />
            <p data-palabras className="max-w-5xl text-pretty font-serif text-[clamp(1.75rem,3.6vw,3.25rem)] font-normal leading-[1.18] tracking-[-0.015em]">
              {PROBLEMA.split(" ").map((palabra, i) => (
                <span key={i} data-palabra>
                  {palabra}{" "}
                </span>
              ))}
            </p>
          </div>
        </section>

        {/* 02 · Método */}
        <section id="metodo" className="scroll-mt-16 border-t border-linea bg-superficie">
          <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-8 px-4 pt-24 sm:px-8 sm:pt-32">
            <Indice n="02" texto="Método" />
            <h2 className="max-w-3xl text-balance font-serif text-[clamp(2.4rem,5.4vw,4.75rem)] font-normal leading-[0.98] tracking-[-0.03em]">
              Cuatro pasos. Cada uno deja huella.
            </h2>
          </div>
          <div className="mx-auto w-full max-w-[84rem] px-4 pb-24 sm:px-8">
            <Recorrido />
          </div>
        </section>

        {/* 03 · Demostración */}
        <section id="demostracion" className="scroll-mt-16 bg-marca text-[var(--texto-sobre-marca)]">
          <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-14 px-4 py-24 sm:px-8 sm:py-32">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
              <div className="flex flex-col gap-8">
                <Indice n="03" texto="Demostración" claro />
                <h2 className="text-balance font-serif text-[clamp(2.4rem,5.4vw,4.75rem)] font-normal leading-[0.98] tracking-[-0.03em]">Pruébelo aquí mismo.</h2>
              </div>
              <p className="max-w-md text-pretty text-lg leading-relaxed text-[var(--tinta-200)] lg:justify-self-end">
                Un recorrido con una empresa de ejemplo: responder, anonimato, evidencias y dossier. Los datos y los textos son ficticios.
              </p>
            </div>
            <div data-inclinar className="text-tinta will-change-transform">
              <Demostracion />
            </div>
          </div>
        </section>

        {/* 04 · Quién ve qué */}
        <section id="quien-ve-que" className="scroll-mt-16">
          <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-14 px-4 py-24 sm:px-8 sm:py-32">
            <div className="flex flex-col gap-8">
              <Indice n="04" texto="Privacidad por diseño" />
              <h2 className="max-w-3xl text-balance font-serif text-[clamp(2.4rem,5.4vw,4.75rem)] font-normal leading-[0.98] tracking-[-0.03em]">Quién ve qué.</h2>
            </div>
            <Lente />
            <ol className="grid border-t border-linea md:grid-cols-3">
              {PRINCIPIOS.map((p, i) => (
                <li key={p.titulo} data-subir className="flex flex-col gap-3 border-b border-linea py-8 md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0">
                  <span className="font-serif text-4xl font-normal text-[var(--tinta-500)]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-lg font-semibold">{p.titulo}</h3>
                  <p className="text-pretty leading-relaxed text-tinta-suave">{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Cierre */}
        <section className="relative overflow-hidden bg-marca text-[var(--texto-sobre-marca)]">
          {/* La onda de la marca se dibuja con el scroll y se rellena de lumbre al final. */}
          <svg aria-hidden viewBox={ONDA_CAJA} className="pointer-events-none absolute -bottom-[12%] -right-[22vw] w-[min(95vw,46rem)] overflow-visible opacity-25 sm:opacity-40 lg:-right-[9vw] lg:opacity-100">
            <path data-trazo d={ONDA_TRAZADO} transform={ONDA_TRANSFORMACION} pathLength={100} fill="var(--lumbre)" stroke="var(--lumbre)" strokeWidth="1.2" />
          </svg>
          <div className="relative mx-auto flex min-h-[80svh] w-full max-w-[84rem] flex-col justify-center gap-10 px-4 py-24 sm:px-8">
            <h2 className="max-w-[11ch] text-balance font-serif text-[clamp(3rem,8vw,7rem)] font-normal leading-[0.92] tracking-[-0.035em]">{LEMA}</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/acceso" className={`${pastilla} bg-lumbre text-[var(--tinta-950)] hover:bg-lumbre-claro`}>
                Acceder al panel
              </Link>
              <a href="#demostracion" className={`${pastilla} border border-white/30 hover:border-white/70`}>
                Ver la demostración
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-marca text-[var(--tinta-200)]">
        <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-6 border-t border-white/10 px-4 py-10 text-sm sm:flex-row sm:items-start sm:justify-between sm:px-8">
          <div className="flex flex-col gap-3">
            <Logotipo alto={22} variante="negativo" />
            <p>{LEMA}</p>
          </div>
          <div className="flex max-w-md flex-col gap-2 sm:text-right">
            <p>Herramienta independiente de apoyo al técnico de prevención. No es un servicio de la Inspección de Trabajo ni del INSST.</p>
            <p>{ORIGEN_INSST}.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
