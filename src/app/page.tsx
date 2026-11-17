import type { Metadata } from "next";
import Link from "next/link";
import { ORIGEN_INSST } from "@/config/atribucion";
import { LEMA, NOMBRE } from "@/config/marca";
import { EnlaceBoton } from "@/components/ui/boton";
import { Demostracion } from "@/components/portada/demostracion";
import { Logotipo } from "@/components/marca/logotipo";

export const metadata: Metadata = {
  title: { absolute: `${NOMBRE} · ${LEMA}` },
  description: "Evaluación psicosocial continua y desconexión digital para pymes, con un dossier de evidencias fechadas.",
};

const PASOS = [
  {
    titulo: "La plantilla responde",
    texto: "Cuestionarios breves, voluntarios y anónimos. Se entra con un código, sin cuenta. Ningún resultado se muestra con menos de 5 respuestas.",
  },
  {
    titulo: "El técnico de prevención decide",
    texto: "Trata las respuestas de la evaluación con FPSICO, registra y firma su informe, y acompaña el plan de acción con responsables y fechas.",
  },
  {
    titulo: "Queda la evidencia",
    texto: "Campañas, informes, medidas, política, audiencia, acuses y formación se ordenan en una línea de tiempo y en un dossier en PDF.",
  },
];

const QUIEN_VE = [
  { dato: "Respuestas individuales", plantilla: "Solo envía la suya", empresa: "No", partner: "No", tecnico: "No" },
  { dato: "Resultados de grupo (5 o más)", plantilla: "No", empresa: "Sí", partner: "Sí", tecnico: "Sí" },
  { dato: "Plan de acción", plantilla: "No", empresa: "Edita", partner: "Consulta", tecnico: "Edita" },
  { dato: "Dossier de evidencias", plantilla: "No", empresa: "Sí", partner: "Sí", tecnico: "Sí" },
];
const COLUMNAS = [
  { clave: "plantilla", titulo: "Persona trabajadora" },
  { clave: "empresa", titulo: "Empresa" },
  { clave: "partner", titulo: "Partner" },
  { clave: "tecnico", titulo: "Técnico de prevención" },
] as const;

export default function Portada() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-linea/70 bg-papel/85 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" aria-label={`${NOMBRE}, inicio`} className="rounded-md py-2 text-tinta">
            <Logotipo alto={30} decorativo />
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
            <a href="#como-funciona" className="hidden rounded-md px-3 py-2 text-sm text-tinta-suave transition-colors duration-150 hover:text-tinta md:inline-flex">
              Cómo funciona
            </a>
            <a href="#demostracion" className="hidden rounded-md px-3 py-2 text-sm text-tinta-suave transition-colors duration-150 hover:text-tinta sm:inline-flex">
              Demostración
            </a>
            <a href="#quien-ve-que" className="hidden rounded-md px-3 py-2 text-sm text-tinta-suave transition-colors duration-150 hover:text-tinta md:inline-flex">
              Quién ve qué
            </a>
            <EnlaceBoton href="/acceso" variante="secundario">
              Acceder
            </EnlaceBoton>
          </nav>
        </div>
      </header>

      <main id="contenido" className="flex-1">
        {/* Portada */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(56rem_30rem_at_78%_-12%,color-mix(in_srgb,var(--lumbre)_16%,transparent),transparent_70%)]" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:pb-28">
            <div className="flex flex-col items-start gap-6">
              <p className="aparecer text-sm font-medium text-acento">Evaluación psicosocial y desconexión digital para pymes</p>
              <h1 className="aparecer text-balance font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">{LEMA}</h1>
              <p className="aparecer max-w-xl text-pretty text-lg leading-relaxed text-tinta-suave">
                {NOMBRE} reúne cuestionarios anónimos, plan de acción y un dossier de evidencias fechadas. Todo ordenado por si llega un requerimiento de la Inspección de Trabajo.
              </p>
              <div className="aparecer flex flex-wrap gap-3">
                <EnlaceBoton href="#demostracion">Ver la demostración</EnlaceBoton>
                <EnlaceBoton href="/acceso" variante="secundario">
                  Acceder al panel
                </EnlaceBoton>
              </div>
              <p className="aparecer max-w-xl text-sm text-tinta-suave">
                Herramienta de apoyo para el técnico de prevención. Independiente: no es un servicio de la Inspección de Trabajo ni del INSST.
              </p>
            </div>

            {/* Documento de ejemplo: se eleva al hacer scroll */}
            <div aria-hidden className="relative mx-auto hidden w-full max-w-sm sm:block">
              <div className="flotar relative">
                <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-2 rounded-xl border border-linea bg-superficie/60" />
                <div className="relative flex flex-col gap-5 rounded-xl border border-linea bg-superficie p-7 shadow-[0_32px_64px_-32px_rgba(23,33,30,0.35)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-semibold tracking-[0.22em] text-acento">DOSSIER DE EVIDENCIAS</span>
                    <span className="rounded-full bg-aviso-tenue px-2 py-0.5 text-[0.6rem] font-medium text-aviso">Ejemplo</span>
                  </div>
                  <p className="font-serif text-2xl leading-tight">Empresa de ejemplo</p>
                  <span className="h-[3px] w-10 rounded-full bg-lumbre" />
                  <ul className="flex flex-col gap-3 text-sm">
                    {["Evaluación cerrada", "Informe firmado", "Plan de acción", "Política aprobada", "Acuses de lectura"].map((linea, i) => (
                      <li key={linea} className="flex items-center gap-3">
                        <span className="grid size-5 place-items-center rounded-full bg-acento-tenue text-[0.6rem] font-semibold text-acento-fuerte">{i + 1}</span>
                        <span className="text-tinta">{linea}</span>
                        <span className="ml-auto h-1.5 w-12 rounded-full bg-papel" />
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-tinta-suave">Generado con fecha. Sin respuestas individuales.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problema */}
        <section className="border-y border-linea bg-superficie">
          <div className="revelar mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:py-20 lg:grid-cols-[1fr_1.4fr]">
            <h2 className="text-balance font-serif text-3xl leading-tight sm:text-4xl">Cuidar a las personas exige método. Y demostrarlo, pruebas fechadas.</h2>
            <div className="flex flex-col gap-4 text-pretty text-lg leading-relaxed text-tinta-suave">
              <p>
                Evaluar los riesgos psicosociales y ordenar la desconexión digital pide participación real, un plan con responsables y un registro de lo que se hace.
              </p>
              <p>En una pyme, todo eso suele acabar repartido entre correos, hojas sueltas y carpetas. {NOMBRE} lo reúne en un solo sitio, sin vigilar a nadie.</p>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="scroll-mt-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-20 sm:py-24">
            <div className="revelar flex max-w-2xl flex-col gap-3">
              <p className="text-sm font-medium text-acento">Cómo funciona</p>
              <h2 className="text-balance font-serif text-3xl leading-tight sm:text-4xl">Tres pasos. Cada uno deja huella.</h2>
            </div>
            <ol className="grid gap-5 md:grid-cols-3">
              {PASOS.map((paso, i) => (
                <li key={paso.titulo} className="revelar flex flex-col gap-4 rounded-2xl border border-linea bg-superficie p-6 sm:p-7">
                  <span className="font-serif text-4xl italic text-acento">{i + 1}</span>
                  <h3 className="text-lg font-semibold">{paso.titulo}</h3>
                  <p className="text-pretty leading-relaxed text-tinta-suave">{paso.texto}</p>
                </li>
              ))}
            </ol>
            <p className="revelar text-sm text-tinta-suave">{ORIGEN_INSST}.</p>
          </div>
        </section>

        {/* Demostración */}
        <section id="demostracion" className="scroll-mt-20 border-y border-linea bg-[linear-gradient(180deg,var(--color-superficie),var(--color-papel))]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-20 sm:py-24">
            <div className="revelar flex max-w-2xl flex-col gap-3">
              <p className="text-sm font-medium text-acento">Demostración</p>
              <h2 className="text-balance font-serif text-3xl leading-tight sm:text-4xl">Pruébelo aquí mismo.</h2>
              <p className="text-pretty text-lg text-tinta-suave">Un recorrido con una empresa de ejemplo. Los datos y los textos son ficticios.</p>
            </div>
            <div className="revelar">
              <Demostracion />
            </div>
          </div>
        </section>

        {/* Quién ve qué */}
        <section id="quien-ve-que" className="scroll-mt-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-20 sm:py-24">
            <div className="revelar flex max-w-2xl flex-col gap-3">
              <p className="text-sm font-medium text-acento">Privacidad por diseño</p>
              <h2 className="text-balance font-serif text-3xl leading-tight sm:text-4xl">Quién ve qué.</h2>
              <p className="text-pretty text-lg text-tinta-suave">Los permisos se aplican en la base de datos, no solo en la pantalla.</p>
            </div>

            {/* Escritorio: tabla. Móvil: tarjetas. Sin desplazamiento lateral. */}
            <div className="revelar hidden overflow-hidden rounded-2xl border border-linea bg-superficie md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Qué dato ve cada perfil</caption>
                <thead className="bg-papel/70">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">Dato</th>
                    {COLUMNAS.map((c) => (
                      <th key={c.clave} scope="col" className="px-5 py-4 font-semibold">{c.titulo}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-linea">
                  {QUIEN_VE.map((fila) => (
                    <tr key={fila.dato}>
                      <th scope="row" className="px-5 py-4 font-medium">{fila.dato}</th>
                      {COLUMNAS.map((c) => (
                        <td key={c.clave} className={`px-5 py-4 ${fila[c.clave] === "No" ? "text-tinta-suave" : ""}`}>{fila[c.clave]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="revelar flex flex-col gap-4 md:hidden">
              {QUIEN_VE.map((fila) => (
                <li key={fila.dato} className="rounded-2xl border border-linea bg-superficie p-5">
                  <h3 className="font-semibold">{fila.dato}</h3>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {COLUMNAS.map((c) => (
                      <div key={c.clave} className="flex flex-col">
                        <dt className="text-tinta-suave">{c.titulo}</dt>
                        <dd className="font-medium">{fila[c.clave]}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>

            <div className="revelar grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-linea bg-superficie p-6 sm:p-7">
                <h3 className="text-lg font-semibold">Nada de vigilancia</h3>
                <p className="mt-2 text-pretty leading-relaxed text-tinta-suave">
                  No medimos actividad, conexiones, horarios ni correos. Solo cuestionarios voluntarios y documentos.
                </p>
              </div>
              <div className="rounded-2xl border border-linea bg-superficie p-6 sm:p-7">
                <h3 className="text-lg font-semibold">Para servicios de prevención y gestorías</h3>
                <p className="mt-2 text-pretty leading-relaxed text-tinta-suave">
                  Gestiona varias empresas desde un panel: altas, estado de cada evaluación y descarga de informes. Con su marca, si lo desea.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cierre */}
        <section className="border-t border-linea bg-marca text-white">
          <div className="revelar mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:py-20 md:flex-row md:items-center md:justify-between">
            <h2 className="max-w-xl text-balance font-serif text-3xl leading-tight sm:text-4xl">{LEMA}</h2>
            <Link
              href="/acceso"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-lumbre px-5 font-medium text-[var(--petroleo-900)] transition-[background-color,transform] duration-150 ease-salida hover:bg-lumbre-claro active:scale-[0.98]"
            >
              Acceder al panel
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-linea bg-papel">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-tinta-suave sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Logotipo alto={28} />
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
