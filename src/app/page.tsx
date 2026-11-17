import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, ClipboardCheck, EyeOff, FileCheck2, HardHat, ListChecks, Users } from "lucide-react";
import { ORIGEN_INSST } from "@/config/atribucion";
import { LEMA, NOMBRE } from "@/config/marca";
import { EfectosPortada } from "@/components/portada/efectos";
import { Movil, Portatil, Ventana } from "@/components/portada/dispositivos";
import { Logotipo } from "@/components/marca/logotipo";
import Image from "next/image";

export const metadata: Metadata = {
  title: { absolute: `${NOMBRE} · ${LEMA}` },
  description: "Evaluación psicosocial y desconexión digital para pymes, con cada paso documentado.",
};

// ---------- Contenido ----------

const NAVEGACION = [
  { href: "#para-que-sirve", texto: "Para qué sirve" },
  { href: "#como-se-utiliza", texto: "Cómo se utiliza" },
  { href: "#aplicacion", texto: "La aplicación" },
  { href: "#para-quien", texto: "Para quién" },
];

const BENEFICIOS = [
  { icono: EyeOff, titulo: "Escuchar sin exponer a nadie", texto: "Cuestionarios anónimos. Los resultados solo se ven en grupos de 5 personas o más." },
  { icono: ListChecks, titulo: "Pasar de los datos a las medidas", texto: "Cada medida del plan tiene responsable, fecha prevista y estado." },
  { icono: FileCheck2, titulo: "Tenerlo todo documentado", texto: "Evaluación, política de desconexión, acuses y formación quedan fechados." },
];

const PASOS = [
  { titulo: "Alta de la empresa", texto: "Su servicio de prevención o asesoría da de alta la empresa e invita a sus responsables.", imagen: "/portada/paso-partner.webp", alt: "Panel de un partner de demostración con su empresa asignada." },
  { titulo: "Cuestionario anónimo", texto: "La plantilla responde desde el móvil con un código. Sin cuenta y sin nombre.", imagen: "/portada/paso-campanas.webp", alt: "Lista de campañas de demostración con su tipo y su estado." },
  { titulo: "Resultados y medidas", texto: "Con la campaña cerrada, se revisan los resultados y se acuerdan medidas.", imagen: "/portada/paso-resultados.webp", alt: "Participación del 75 % en un seguimiento de demostración." },
  { titulo: "Evidencias fechadas", texto: "Cada paso queda registrado con fecha y autor, listo para consultarlo.", imagen: "/portada/paso-desconexion.webp", alt: "Política de desconexión de ejemplo aprobada, con fecha y autor." },
];

const PANTALLAS = [
  { titulo: "Panel de la empresa", texto: "El estado de cada campaña de un vistazo.", imagen: "/portada/app-empresa.webp", alt: "Resumen de una empresa de demostración con sus campañas cerradas." },
  { titulo: "Evaluaciones y seguimientos", texto: "Campañas anónimas, con su tipo y su estado.", imagen: "/portada/app-campanas.webp", alt: "Lista de campañas y seguimientos de una empresa de demostración." },
  { titulo: "Registro de evidencias", texto: "Política aprobada, acuses y formación, con fecha y autor.", imagen: "/portada/app-desconexion.webp", alt: "Pantalla de desconexión digital con la versión 1 de la política aprobada." },
];

const PERFILES = [
  { icono: Building2, titulo: "Gerencia de pymes", texto: "Una visión clara de lo hecho y lo pendiente." },
  { icono: Users, titulo: "Recursos humanos", texto: "Campañas, política de desconexión y acuses en un sitio." },
  { icono: HardHat, titulo: "Técnicos de prevención", texto: "Respuestas para FPSICO, informe firmado y plan de acción." },
  { icono: ClipboardCheck, titulo: "Asesorías y gestorías", texto: "Varias empresas desde un panel, con su marca." },
];

// ---------- Piezas de maquetación ----------

const BOTON = "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-base font-medium transition-colors duration-200";
const BOTON_PRINCIPAL = `${BOTON} bg-tinta text-[var(--texto-sobre-marca)] hover:bg-[var(--tinta-800)]`;
const BOTON_SECUNDARIO = `${BOTON} border border-linea-fuerte text-tinta hover:border-tinta`;
const TARJETA = "h-full rounded-[20px] border border-linea bg-superficie p-6 lg:p-8";

function Contenedor({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1264px] px-6 sm:px-8 ${className}`}>{children}</div>;
}

function Seccion({ id, alterna = false, children }: { id?: string; alterna?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-16 py-20 lg:py-28 ${alterna ? "bg-papel" : "bg-superficie"}`}>
      <Contenedor>{children}</Contenedor>
    </section>
  );
}

function Encabezado({ etiqueta, titulo, entradilla }: { etiqueta: string; titulo: string; entradilla?: string }) {
  return (
    <div data-entrar className="mx-auto mb-12 flex max-w-[44rem] flex-col items-center gap-4 text-center lg:mb-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-tinta-suave">{etiqueta}</p>
      <h2 className="text-balance text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] lg:text-[2.5rem]">{titulo}</h2>
      {entradilla ? <p className="text-pretty text-lg text-tinta-suave">{entradilla}</p> : null}
    </div>
  );
}

function Icono({ icono: I }: { icono: typeof EyeOff }) {
  return (
    <span aria-hidden className="grid size-11 place-items-center rounded-xl bg-[var(--lumbre-50)] text-[var(--lumbre-600)]">
      <I size={20} strokeWidth={1.75} />
    </span>
  );
}

// ---------- Página ----------

export default function Portada() {
  return (
    <>
      <EfectosPortada />

      {/* 1. Cabecera */}
      <header data-cabecera className="cabecera fixed inset-x-0 top-0 z-40">
        <Contenedor className="flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label={`${NOMBRE}, inicio`} className="rounded-md py-2">
            <Logotipo alto={22} decorativo />
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-8">
            <ul className="hidden items-center gap-8 md:flex">
              {NAVEGACION.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-sm text-tinta-suave transition-colors hover:text-tinta">
                    {n.texto}
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/acceso" className={`${BOTON_PRINCIPAL} min-h-10 px-5 text-sm`}>
              Acceder
            </Link>
          </nav>
        </Contenedor>
      </header>

      <main id="contenido" className="flex-1">
        {/* 2. Hero */}
        <section className="bg-[linear-gradient(to_bottom,var(--superficie)_62%,var(--fondo-alterno)_62%)] pt-32 lg:pt-40">
          <Contenedor>
            <div className="mx-auto flex max-w-[52rem] flex-col items-center gap-6 text-center">
              <h1 className="aparecer text-balance text-[2rem] font-medium leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[3.75rem]">
                Evaluación psicosocial y desconexión digital, en orden.
              </h1>
              <p className="aparecer max-w-[36rem] text-pretty text-lg text-tinta-suave">
                Para pymes, servicios de prevención y asesorías que quieren cuidar a su plantilla y documentar cada paso.
              </p>
              <div className="aparecer mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
                <Link href="/contacto" className={BOTON_PRINCIPAL}>
                  Solicitar una demostración
                </Link>
                <a href="#como-se-utiliza" className={BOTON_SECUNDARIO}>
                  Cómo se utiliza
                </a>
              </div>
            </div>
            <div data-entrar className="relative mx-auto mt-16 max-w-[1040px] pb-8 lg:mt-20">
              <Portatil src="/portada/app-resultados.webp" alt="Resultados de un seguimiento de demostración: participación del 75 % y niveles de un factor." prioridad />
              <Movil
                src="/portada/app-responder-movil.webp"
                alt="Pantalla para responder el cuestionario en el móvil con un código."
                className="absolute bottom-0 right-[2%] w-[22%] max-w-[200px] sm:right-[4%]"
              />
            </div>
          </Contenedor>
        </section>

        {/* 3. Para qué sirve */}
        <Seccion id="para-que-sirve" alterna>
          <Encabezado etiqueta="Para qué sirve" titulo="Cuidar a la plantilla y poder demostrarlo." />
          <ul data-entrar="grupo" className="grid gap-6 md:grid-cols-3">
            {BENEFICIOS.map((b) => (
              <li key={b.titulo} className={`${TARJETA} flex flex-col gap-4`}>
                <Icono icono={b.icono} />
                <h3 className="text-lg font-semibold">{b.titulo}</h3>
                <p className="text-pretty text-tinta-suave">{b.texto}</p>
              </li>
            ))}
          </ul>
        </Seccion>

        {/* 4. Cómo se utiliza */}
        <Seccion id="como-se-utiliza">
          <Encabezado etiqueta="Cómo se utiliza" titulo="De la primera respuesta a la última evidencia." />
          <ol data-pasos className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {PASOS.map((p, i) => (
              <li key={p.titulo} data-paso className="flex flex-col gap-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] border border-linea bg-papel">
                  <Image src={p.imagen} alt={p.alt} fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 92vw" className="object-cover object-top" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tinta font-mono text-xs text-[var(--texto-sobre-marca)]">{i + 1}</span>
                  <span data-linea aria-hidden className={`hidden h-px flex-1 bg-linea-fuerte lg:block ${i === PASOS.length - 1 ? "lg:invisible" : ""}`} />
                </div>
                <h3 className="text-lg font-semibold">{p.titulo}</h3>
                <p className="text-pretty text-tinta-suave">{p.texto}</p>
              </li>
            ))}
          </ol>
        </Seccion>

        {/* 5. La aplicación por dentro */}
        <Seccion id="aplicacion" alterna>
          <Encabezado etiqueta="La aplicación por dentro" titulo="Todo en un panel claro." entradilla="Pantallas reales con datos de demostración." />
          <ul data-entrar="grupo" className="grid gap-6 md:grid-cols-3">
            {PANTALLAS.map((p) => (
              <li key={p.titulo} className={`${TARJETA} flex flex-col gap-5`}>
                <Ventana src={p.imagen} alt={p.alt} />
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">{p.titulo}</h3>
                  <p className="text-pretty text-tinta-suave">{p.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </Seccion>

        {/* 6. Para quién es */}
        <Seccion id="para-quien">
          <Encabezado etiqueta="Para quién es" titulo="Pensada para quien gestiona la prevención." />
          <ul data-entrar="grupo" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PERFILES.map((p) => (
              <li key={p.titulo} className={`${TARJETA} flex flex-col gap-4`}>
                <Icono icono={p.icono} />
                <h3 className="text-lg font-semibold">{p.titulo}</h3>
                <p className="text-pretty text-tinta-suave">{p.texto}</p>
              </li>
            ))}
          </ul>
        </Seccion>

        {/* 7. Llamada final */}
        <Seccion alterna>
          <div data-entrar className="mx-auto flex max-w-[40rem] flex-col items-center gap-6 text-center">
            <h2 className="text-balance text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] lg:text-[2.5rem]">¿Quiere verlo con su empresa?</h2>
            <p className="text-pretty text-lg text-tinta-suave">Le enseñamos la aplicación y resolvemos sus dudas, sin compromiso.</p>
            <Link href="/contacto" className={BOTON_PRINCIPAL}>
              Solicitar una demostración
            </Link>
          </div>
        </Seccion>
      </main>

      {/* 8. Pie */}
      <footer className="bg-superficie">
        <Contenedor className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-6">
            <Logotipo alto={22} />
            <p className="max-w-[22rem] text-sm text-tinta-suave">Herramienta independiente de apoyo al técnico de prevención. No es un servicio de la Inspección de Trabajo ni del INSST.</p>
          </div>
          <ColumnaPie titulo="Producto" enlaces={NAVEGACION.map((n) => ({ href: `/${n.href}`, texto: n.texto }))} />
          <ColumnaPie
            titulo="Legal"
            enlaces={[
              { href: "/legal/aviso-legal", texto: "Aviso legal" },
              { href: "/legal/privacidad", texto: "Privacidad" },
              { href: "/legal/cookies", texto: "Cookies" },
            ]}
          />
          <ColumnaPie
            titulo="Contacto"
            enlaces={[
              { href: "/contacto", texto: "Solicitar una demostración" },
              { href: "/acceso", texto: "Acceder al panel" },
            ]}
          />
        </Contenedor>
        <Contenedor>
          <div className="flex flex-col gap-2 border-t border-linea py-6 text-xs text-tinta-suave sm:flex-row sm:justify-between">
            <p>{ORIGEN_INSST}.</p>
            <p>© {NOMBRE}</p>
          </div>
        </Contenedor>
      </footer>
    </>
  );
}

function ColumnaPie({ titulo, enlaces }: { titulo: string; enlaces: { href: string; texto: string }[] }) {
  return (
    <div className="flex flex-col gap-3 lg:col-span-2">
      <p className="text-sm font-semibold">{titulo}</p>
      <ul className="flex flex-col gap-2">
        {enlaces.map((e) => (
          <li key={e.href}>
            <Link href={e.href} className="text-sm text-tinta-suave transition-colors hover:text-tinta">
              {e.texto}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
