import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, BellOff, Check, EyeOff, FileCheck2, Waves } from "lucide-react";
import { ORIGEN_INSST } from "@/config/atribucion";
import { LEMA, NOMBRE } from "@/config/marca";
import { EfectosPortada } from "@/components/portada/efectos";
import { VideoLumbra } from "@/components/portada/video-lumbra";
import { CaosOrden } from "@/components/portada/caos-orden";
import { PerfilesBento } from "@/components/portada/perfiles-bento";
import { BeneficiosVivos } from "@/components/portada/beneficios-vivos";
import { Movil, Portatil, PortatilPelicula } from "@/components/portada/dispositivos";
import { ONDA_CAJA, ONDA_TRANSFORMACION, ONDA_TRAZADO } from "@/components/marca/onda";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo, Simbolo } from "@/components/marca/logotipo";
import Image from "next/image";
import { DESCRIPCION, urlPublica } from "@/config/publicacion";

export const metadata: Metadata = {
  title: { absolute: `${NOMBRE} · ${LEMA}` },
  description: DESCRIPCION,
  alternates: { canonical: "/" },
};

// Datos estructurados para buscadores: solo lo que la página ya dice, sin precios ni valoraciones.
function DatosEstructurados() {
  const base = urlPublica();
  const datos = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${base}/#organizacion`, name: NOMBRE, url: `${base}/`, logo: `${base}/marca/lumbra-horizontal-positivo.svg`, description: DESCRIPCION },
      { "@type": "WebSite", "@id": `${base}/#web`, url: `${base}/`, name: NOMBRE, inLanguage: "es-ES", publisher: { "@id": `${base}/#organizacion` } },
      {
        "@type": "SoftwareApplication",
        name: NOMBRE,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: "es-ES",
        description: DESCRIPCION,
        url: `${base}/`,
        publisher: { "@id": `${base}/#organizacion` },
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }} />;
}

// ---------- Contenido ----------

const NAVEGACION = [
  { href: "#para-que-sirve", texto: "Para qué sirve" },
  { href: "#como-se-utiliza", texto: "Cómo se utiliza" },
  { href: "#aplicacion", texto: "La aplicación" },
  { href: "#para-quien", texto: "Para quién" },
];

const PASOS = [
  { titulo: "Alta de la empresa", texto: "Su servicio de prevención o asesoría da de alta la empresa e invita a sus responsables.", imagen: "/portada/app-partner.webp", alt: "Panel de un partner de demostración con su empresa asignada." },
  { titulo: "Cuestionario anónimo", texto: "La plantilla responde desde el móvil con un código. Sin cuenta y sin nombre.", imagen: "/portada/app-campanas.webp", alt: "Lista de campañas de demostración con su tipo y su estado." },
  { titulo: "Resultados y medidas", texto: "Con la campaña cerrada, se revisan los resultados y se acuerdan medidas.", imagen: "/portada/app-resultados.webp", alt: "Participación del 75 % en un seguimiento de demostración." },
  { titulo: "Evidencias fechadas", texto: "Cada paso queda registrado con fecha y autor, listo para consultarlo.", imagen: "/portada/app-desconexion.webp", alt: "Política de desconexión de ejemplo aprobada, con fecha y autor." },
];

// Capítulos de la «película» de la aplicación. `cursor`: dónde señala, en % de la pantalla.
const CAPITULOS = [
  { titulo: "Panel de la empresa", texto: "El estado de cada campaña, de un vistazo.", imagen: "/portada/app-empresa.webp", alt: "Resumen de una empresa de demostración con sus campañas cerradas.", cursor: [24, 44] },
  { titulo: "Campañas anónimas", texto: "Evaluaciones y seguimientos, con su tipo y su estado.", imagen: "/portada/app-campanas.webp", alt: "Lista de campañas y seguimientos de una empresa de demostración.", cursor: [26, 56] },
  { titulo: "Resultados por grupos", texto: "Solo con 5 respuestas o más, al cerrar la campaña.", imagen: "/portada/app-resultados.webp", alt: "Resultados de un seguimiento de demostración con la participación.", cursor: [16, 46] },
  { titulo: "Plan de acción", texto: "Medidas con responsable, fecha y estado.", imagen: "/portada/app-plan.webp", alt: "Plan de acción de demostración con medidas de ejemplo.", cursor: [29, 59] },
  { titulo: "Evidencias fechadas", texto: "Política aprobada, acuses y formación, con fecha y autor.", imagen: "/portada/app-desconexion.webp", alt: "Política de desconexión de ejemplo aprobada, con fecha y autor.", cursor: [40, 63] },
];

const CONTEXTO: { etiqueta: string; titulo: string; texto?: string; puntos?: string[] }[] = [
  {
    etiqueta: "Por qué nace",
    titulo: "Porque en la pyme esto se queda en papeles sueltos",
    texto:
      "Evaluar los riesgos psicosociales y ordenar la desconexión digital suele acabar repartido entre correos, hojas y carpetas, sin seguimiento ni pruebas. Nace para ordenar ese trabajo y que no dependa de la memoria de nadie.",
  },
  {
    etiqueta: "Cómo le ayuda",
    titulo: "Le da método sin cargarle de trabajo",
    puntos: [
      "Sabe cómo está su plantilla sin exponer a nadie",
      "Convierte los resultados en medidas con responsable y fecha",
      "Tiene cada paso documentado si se lo piden",
    ],
  },
  {
    etiqueta: "Qué necesita",
    titulo: "Para empezar, muy poco",
    puntos: [
      "Una persona responsable en la empresa",
      "Su técnico de prevención, propio o de su servicio de prevención",
      "Que la plantilla pueda responder desde el móvil o el ordenador",
      "Nada que instalar",
    ],
  },
];

const PILARES = [
  { icono: Waves, titulo: "Evaluación psicosocial continua", texto: "Seguimientos breves y apoyo a la evaluación con FPSICO, siempre anónimos." },
  { icono: BellOff, titulo: "Desconexión digital", texto: "Política, audiencia a la representación, acuses de lectura y formación." },
  { icono: FileCheck2, titulo: "Evidencias fechadas", texto: "Cada paso queda registrado con fecha y autor." },
];

const AVALES: { tipo: string; nombre: string; logo?: { src: string; ancho: number; alto: number } }[] = [
  { tipo: "Aval", nombre: "Universidad de Salamanca", logo: { src: "/marca/terceros/usal.svg", ancho: 2552, alto: 693 } },
  { tipo: "Aval", nombre: "Fundación General de la Universidad de Salamanca", logo: { src: "/marca/terceros/fundacion-general-usal.webp", ancho: 198, alto: 283 } },
  { tipo: "Programa", nombre: "Prototipos 2026/2027", logo: { src: "/marca/terceros/prototipos-tcue.webp", ancho: 427, alto: 239 } },
  { tipo: "Estrategia regional", nombre: "RIS3 de Castilla y León", logo: { src: "/marca/terceros/ris3-cyl.svg", ancho: 3747, alto: 748 } },
];

const HITOS: { etiqueta: string; titulo: string; texto: string; logo: "workwell" | "ymca" | "onda"; destacado?: boolean }[] = [
  { etiqueta: "Prototipo", titulo: "WORKWELL360", texto: "Nació como TFG y fue premiado por la Junta de Castilla y León y la USAL.", logo: "workwell" },
  { etiqueta: "Pilotaje", titulo: "YMCA Salamanca", texto: "Pilotado dentro del programa TCUE, con resultados satisfactorios.", logo: "ymca" },
  { etiqueta: "Evolución", titulo: "LUMBRA360", texto: "Más completo, con evidencias fechadas.", logo: "onda", destacado: true },
];

type Miembro = { nombre: string; foto: string; cargo: string; detalle: string[]; enlaces: { texto: string; href: string }[] };
const EQUIPO: Miembro[] = [
  {
    nombre: "Fernando Martín Vaquero",
    foto: "/equipo/fernando-martin-vaquero.webp",
    cargo: "Pedagogo y gestor de proyectos",
    detalle: [
      "Graduado en Pedagogía (Formación y Gestión de Calidad) por la Universidad de Salamanca",
      "Cursa el Máster en Estudios de la Ciencia, la Tecnología y la Innovación (MECTI)",
      "Técnico Gestor de Proyectos Académicos en DIDOSEG",
      "Creador de WORKWELL360, premio a la excelencia de la Junta de Castilla y León y la USAL",
    ],
    enlaces: [{ texto: "LinkedIn", href: "https://www.linkedin.com/in/fermartvaq/" }],
  },
  {
    nombre: "Ana María Pinto Llorente",
    foto: "/equipo/ana-maria-pinto-llorente.webp",
    cargo: "Profesora Titular de Universidad",
    detalle: [
      "Departamento de Didáctica, Organización y Métodos de Investigación",
      "Instituto Universitario de Ciencias de la Educación",
      "Grupo GRIAL, de Investigación en Interacción y eLearning",
      "Universidad de Salamanca",
    ],
    enlaces: [{ texto: "Perfil de investigación", href: "https://produccioncientifica.usal.es/investigadores/57371/detalle" }],
  },
  {
    nombre: "Luis Eduardo Andrade Silva",
    foto: "/equipo/luis-eduardo-andrade-silva-v2.webp",
    cargo: "Profesor Ayudante Doctor",
    detalle: [
      "Departamento de Teoría e Historia de la Educación",
      "Grupo CaUSAL, Cultura Académica, Patrimonio y Memoria Social",
      "Grupo Procesos, Espacios y Prácticas Educativas",
      "Universidad de Salamanca",
    ],
    enlaces: [
      { texto: "Perfil de investigación", href: "https://produccioncientifica.usal.es/investigadores/148334/detalle" },
      { texto: "Web personal", href: "https://gipep.usal.es/luis-eduardo-andrade-silva/" },
    ],
  },
];


// ---------- Piezas de maquetación ----------

const BOTON = "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-base font-medium transition-colors duration-200";
const BOTON_PRINCIPAL = `${BOTON} bg-tinta text-[var(--texto-sobre-marca)] hover:bg-[var(--tinta-800)]`;
const BOTON_SECUNDARIO = `${BOTON} border border-linea-fuerte text-tinta hover:border-tinta`;

function Contenedor({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1264px] px-6 sm:px-8 ${className}`}>{children}</div>;
}

function Seccion({ id, alterna = false, children }: { id?: string; alterna?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-16 py-16 sm:py-24 lg:py-40 ${alterna ? "bg-papel" : "bg-superficie"}`}>
      <Contenedor>{children}</Contenedor>
    </section>
  );
}

function Encabezado({ etiqueta, titulo, entradilla, oscuro = false }: { etiqueta: string; titulo: string; entradilla?: string; oscuro?: boolean }) {
  return (
    <div data-titular className="mx-auto mb-14 flex max-w-[44rem] flex-col items-center gap-5 text-center lg:mb-20">
      <p className={`font-mono text-xs uppercase tracking-[0.14em] ${oscuro ? "text-[var(--lumbre-300)]" : "text-tinta-suave"}`}>{etiqueta}</p>
      <h2 className="text-balance text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] lg:text-[2.5rem]">{titulo}</h2>
      {entradilla ? <p className={`text-pretty text-lg ${oscuro ? "text-[var(--tinta-200)]" : "text-tinta-suave"}`}>{entradilla}</p> : null}
    </div>
  );
}

function Icono({ icono: I }: { icono: typeof EyeOff }) {
  return (
    <span aria-hidden data-trazar className="grid size-11 place-items-center rounded-xl bg-[var(--lumbre-50)] text-[var(--lumbre-600)]">
      <I size={20} strokeWidth={1.75} />
    </span>
  );
}

// ---------- Página ----------

export default function Portada() {
  return (
    <>
      <DatosEstructurados />
      <EfectosPortada />

      {/* 1. Cabecera */}
      <header data-cabecera className="cabecera fixed inset-x-0 top-0 z-40">
        <Contenedor className="flex h-16 items-center justify-between gap-6">
          <EnlaceInicio className="rounded-md py-2">
            <Logotipo alto={22} decorativo />
          </EnlaceInicio>
          <nav aria-label="Principal" className="flex items-center gap-3 md:gap-8">
            <ul className="hidden items-center gap-8 md:flex">
              {NAVEGACION.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-sm text-tinta-suave transition-colors hover:text-tinta">
                    {n.texto}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              {/* Enlace normal, sin precarga: /demo abre una sesión al visitarlo. */}
              <a href="/demo" className={`${BOTON_SECUNDARIO} min-h-10 px-5 text-sm`}>
                Demo
              </a>
              <Link href="/acceso" className={`${BOTON_PRINCIPAL} min-h-10 px-5 text-sm`}>
                Acceder
              </Link>
            </div>
          </nav>
        </Contenedor>
      </header>

      <main id="contenido" className="flex-1 overflow-x-clip">
        {/* 2. Hero */}
        <section data-heroe className="relative overflow-hidden bg-superficie pb-16 pt-28 lg:pt-32">
          <Contenedor>
            <div data-hero-texto className="mx-auto flex max-w-[52rem] flex-col items-center gap-6 text-center">
              <h1 className="aparecer text-balance text-[2rem] font-medium leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[3.75rem]">
                Evaluación psicosocial y desconexión digital, en orden
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
            <div data-hero-dispositivo className="relative mx-auto mt-12 w-full max-w-[min(1200px,max(480px,calc((100svh-24rem)*1.7)))] pb-6 lg:mt-14">
              <Portatil>
                <VideoLumbra />
              </Portatil>
              <Movil
                src="/portada/app-responder-movil.webp"
                alt="Pantalla para responder el cuestionario en el móvil con un código."
                className="absolute -right-[6%] bottom-0 hidden w-[16%] max-w-[170px] sm:block"
              />
            </div>
          </Contenedor>
        </section>

        {/* 3. Qué es */}
        <Seccion id="que-es" alterna>
          <Encabezado etiqueta="Qué es" titulo={`Qué es ${NOMBRE} y por qué nace`} />
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
            <div data-tarjetas className="flex flex-col gap-6 sm:gap-8 lg:col-span-6">
              <p data-tarjeta className="max-w-[34rem] text-pretty text-lg leading-relaxed sm:text-xl lg:text-[1.375rem]">
                Una plataforma web para evaluar los riesgos psicosociales de forma continua, ordenar la desconexión digital y guardar cada paso con fecha.
              </p>
              <p data-tarjeta className="max-w-[34rem] text-pretty leading-relaxed text-tinta-suave sm:text-lg">
                Acompaña al técnico de prevención: la plantilla responde de forma anónima, la empresa actúa y todo queda documentado.
              </p>
              <ul data-tarjeta className="flex max-w-[34rem] flex-col border-t border-linea-fuerte">
                {PILARES.map((p) => (
                  <li key={p.titulo} className="flex items-start gap-4 border-b border-linea-fuerte py-4">
                    <Icono icono={p.icono} />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold">{p.titulo}</span>
                      <span className="text-pretty text-sm text-tinta-suave">{p.texto}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p data-tarjeta className="flex items-center gap-3 text-sm font-medium">
                <span aria-hidden className="size-2 rounded-full bg-lumbre" />
                Sin vigilancia: no mide actividad, conexiones ni correos
              </p>
            </div>
            <div className="lg:col-span-6">
              <CaosOrden />
            </div>
          </div>

          {/* En móvil, tarjetas que se deslizan en horizontal; desde md, tres columnas. */}
          <ol
            data-tarjetas
            className="-mx-4 mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] md:mx-0 md:mt-20 md:grid md:snap-none md:grid-cols-3 md:gap-0 md:overflow-visible md:border-t md:border-linea-fuerte md:px-0 md:pb-0 md:[perspective:1400px] lg:mt-28"
          >
            {CONTEXTO.map((c, i) => (
              <li
                key={c.titulo}
                data-tarjeta
                className="flex w-[84%] max-w-[22rem] shrink-0 snap-start flex-col gap-3 rounded-[20px] border border-linea bg-superficie p-6 md:w-auto md:max-w-none md:gap-4 md:rounded-none md:border-0 md:border-l md:border-linea-fuerte md:bg-transparent md:px-8 md:py-10 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
              >
                <span aria-hidden className="text-[2.5rem] font-medium leading-none tracking-[-0.05em] text-transparent [-webkit-text-stroke:1.5px_var(--lumbre-500)] md:text-[3.5rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-tinta-suave">{c.etiqueta}</span>
                <h3 className="text-xl font-semibold leading-snug">{c.titulo}</h3>
                {c.texto ? <p className="text-pretty text-tinta-suave">{c.texto}</p> : null}
                {c.puntos ? (
                  <ul className="flex flex-col gap-2.5">
                    {c.puntos.map((pt) => (
                      <li key={pt} className="flex items-start gap-3 text-[0.95rem]">
                        <Check aria-hidden size={16} strokeWidth={2.5} className="mt-1 shrink-0 text-[var(--lumbre-600)]" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </Seccion>

        {/* 4. Para qué sirve */}
        <Seccion id="para-que-sirve">
          <Encabezado etiqueta="Para qué sirve" titulo="Cuidar a la plantilla y poder demostrarlo" entradilla={`Tres cosas que una pyme necesita y que ${NOMBRE} resuelve en un mismo sitio.`} />
          <BeneficiosVivos />
        </Seccion>

        {/* 5. Cómo se utiliza */}
        <Seccion id="como-se-utiliza" alterna>
          <Encabezado etiqueta="Cómo se utiliza" titulo="De la primera respuesta a la última evidencia" />
          <ol data-pasos className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PASOS.map((p, i) => (
              <li key={p.titulo} data-paso className="flex flex-col gap-4">
                <div className="relative aspect-[1600/1013] overflow-hidden rounded-[12px] border border-linea bg-superficie shadow-[var(--sombra-1)]">
                  <Image data-miniatura src={p.imagen} alt={p.alt} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 92vw" className="object-contain" />
                </div>
                <div className="flex items-center gap-3">
                  <span data-numero className="grid size-8 shrink-0 place-items-center rounded-full bg-tinta font-mono text-xs text-[var(--texto-sobre-marca)]">{i + 1}</span>
                  <span aria-hidden className={`relative hidden h-0.5 flex-1 overflow-hidden rounded-full bg-linea lg:block ${i === PASOS.length - 1 ? "lg:invisible" : ""}`}>
                    <span data-relleno className="absolute inset-0 origin-left bg-lumbre" />
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{p.titulo}</h3>
                <p className="text-pretty text-tinta-suave">{p.texto}</p>
              </li>
            ))}
          </ol>
        </Seccion>

        {/* 6. La aplicación por dentro */}
        <Seccion id="aplicacion">
          <Encabezado etiqueta="La aplicación por dentro" titulo="Todo en un panel claro" entradilla="Pantallas reales con datos de demostración." />
          <div data-pelicula data-cursores={JSON.stringify(CAPITULOS.map((c) => c.cursor))} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <ol className="hidden flex-col lg:col-span-4 lg:flex">
              {CAPITULOS.map((c, i) => (
                <li key={c.titulo} data-capitulo data-activo={i === 0} className="capitulo flex flex-col border-t border-linea py-4 first:border-t-0">
                  <div className="flex items-center gap-4">
                    <span data-numero-capitulo className="capitulo-numero grid size-9 shrink-0 place-items-center rounded-full font-mono text-xs">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="capitulo-titulo text-lg font-semibold leading-snug">{c.titulo}</h3>
                  </div>
                  <div className="capitulo-cuerpo">
                    <div className="overflow-hidden">
                      <p className="pl-[3.25rem] pt-2 text-pretty text-tinta-suave">{c.texto}</p>
                      <span aria-hidden className="relative ml-[3.25rem] mt-3 block h-0.5 overflow-hidden rounded-full bg-linea">
                        <span data-barra className="absolute inset-0 origin-left bg-lumbre" />
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mx-auto w-full max-w-[calc((100svh-12rem)*1.5)] lg:col-span-8">
              <PortatilPelicula pantallas={CAPITULOS.map((c) => ({ src: c.imagen, alt: c.alt }))} />
            </div>
            {/* Móvil: un solo texto que cambia con la pantalla */}
            <div className="relative min-h-[6.5rem] text-center lg:hidden">
              {CAPITULOS.map((c, i) => (
                <div key={c.titulo} data-capitulo-movil className="absolute inset-x-0 top-0 flex flex-col gap-2" style={i === 0 ? undefined : { opacity: 0 }}>
                  <span className="font-mono text-xs text-tinta-suave">
                    {String(i + 1).padStart(2, "0")} / {String(CAPITULOS.length).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold">{c.titulo}</h3>
                  <p className="text-pretty text-tinta-suave">{c.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </Seccion>

        {/* 7. Para quién es: bento oscuro */}
        <section id="para-quien" className="relative scroll-mt-16 overflow-hidden bg-[var(--tinta-950)] py-16 text-white sm:py-24 lg:py-40">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[70rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--lumbre)_22%,transparent),transparent)] blur-2xl" />
          <Contenedor className="relative">
            <Encabezado etiqueta="Para quién es" titulo="Pensada para quien gestiona la prevención" entradilla="Cada perfil ve lo que necesita. Nadie ve lo que no le corresponde." oscuro />
            <PerfilesBento />
          </Contenedor>
        </section>

        {/* 8. Respaldo: lo ya hecho, los avales y el equipo */}
        <Seccion id="respaldo">
          <Encabezado etiqueta="Respaldo" titulo="No partimos de cero" />
          <div data-evolucion className="relative overflow-hidden rounded-[28px] bg-[var(--tinta-900)] p-8 text-[var(--texto-sobre-marca)] sm:p-10 lg:p-14">
            <div className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div data-evolucion-texto className="flex flex-col gap-5 lg:col-span-5">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--lumbre-300)]">Ya lo hemos hecho</p>
                <h3 className="text-balance text-[1.875rem] font-medium leading-[1.08] tracking-[-0.03em] lg:text-[2.5rem]">Antes de {NOMBRE}, ya pusimos a prueba WORKWELL360</h3>
                <p className="max-w-[46ch] text-pretty text-lg text-[var(--tinta-200)]">
                  Monitorizamos el prototipo en YMCA Salamanca con resultados satisfactorios. {NOMBRE} es su evolución.
                </p>
              </div>
              <ol className="relative grid gap-8 sm:grid-cols-3 sm:gap-6 lg:col-span-7">
                <span aria-hidden className="absolute left-7 right-[calc((100%-3rem)/3-1.75rem)] top-7 hidden h-0.5 overflow-hidden rounded-full bg-white/15 sm:block">
                  <span data-evolucion-linea className="absolute inset-0 origin-left bg-lumbre" />
                </span>
                {HITOS.map((h) => (
                  <li key={h.titulo} data-hito className="relative flex flex-col gap-4">
                    <span className={`grid size-14 place-items-center rounded-full ${h.destacado ? "bg-lumbre text-[var(--tinta-950)]" : "bg-white text-[var(--tinta-900)]"}`}>
                      {h.logo === "workwell" ? (
                        <Image src="/marca/terceros/workwell360.svg" alt="WORKWELL360" width={34} height={20} className="h-auto w-[34px]" />
                      ) : h.logo === "ymca" ? (
                        <Image src="/marca/terceros/ymca.svg" alt="YMCA" width={40} height={12} className="h-auto w-10" />
                      ) : h.logo === "onda" ? (
                        <Simbolo tamano={30} color="var(--tinta-950)" />
                      ) : null}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--tinta-300)]">{h.etiqueta}</span>
                    <span className="text-lg font-semibold leading-snug">{h.titulo}</span>
                    <span className="text-sm text-[var(--tinta-200)]">{h.texto}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <ul data-tarjetas className="mt-6 grid grid-cols-2 gap-4 [perspective:1400px] lg:mt-8 lg:grid-cols-4">
            {AVALES.map((a) => (
              <li key={a.nombre} data-tarjeta className="flex flex-col items-center gap-3 rounded-[20px] border border-linea bg-superficie px-4 py-5 text-center">
                <div className="flex h-12 items-center justify-center">
                  {a.logo ? (
                    <Image src={a.logo.src} alt={a.nombre} width={a.logo.ancho} height={a.logo.alto} className="h-auto max-h-12 w-auto max-w-[9.5rem] object-contain" />
                  ) : (
                    <span className="text-base font-semibold leading-tight tracking-[-0.02em]">RIS3 CyL</span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-tinta-suave">{a.tipo}</span>
                  <span className="text-sm font-medium leading-snug">{a.nombre}</span>
                </div>
              </li>
            ))}
          </ul>

          <div id="equipo" className="mt-16 flex scroll-mt-24 flex-col items-center gap-8 lg:mt-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-tinta-suave">Quiénes somos</p>
              <h3 className="text-2xl font-medium tracking-[-0.025em] lg:text-[1.75rem]">Las personas detrás del proyecto</h3>
            </div>
            <ul data-tarjetas className="mx-auto flex w-full max-w-[72rem] flex-wrap justify-center gap-4 [perspective:1400px] lg:gap-6">
            {EQUIPO.map((m) => (
              <li key={m.nombre} data-tarjeta className="flex w-full flex-col gap-4 rounded-[20px] border border-linea bg-superficie p-6 sm:w-[calc(50%-0.5rem)] lg:w-[calc(50%-0.75rem)] xl:w-[calc((100%-3rem)/3)]">
                <div className="flex items-center gap-4">
                  <Image src={m.foto} alt={`Retrato de ${m.nombre}`} width={128} height={128} sizes="64px" className="size-16 shrink-0 rounded-full object-cover" />
                  <div className="flex min-w-0 flex-col">
                    <h3 className="font-semibold leading-snug">{m.nombre}</h3>
                    <p className="text-sm text-tinta-suave">{m.cargo}</p>
                  </div>
                </div>
                {m.detalle.length ? (
                  <ul className="flex flex-col gap-1.5 border-t border-linea pt-4 text-sm text-tinta-suave">
                    {m.detalle.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-1">
                  {m.enlaces.map((e) => (
                    <a key={e.href} href={e.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium underline decoration-linea-fuerte underline-offset-4 transition-colors hover:decoration-tinta">
                      {e.texto}
                      <ArrowUpRight aria-hidden size={14} strokeWidth={2} />
                      <span className="sr-only">(se abre en una pestaña nueva)</span>
                    </a>
                  ))}
                </p>
              </li>
            ))}
            </ul>
          </div>
        </Seccion>

        {/* 9. Llamada final */}
        <Seccion alterna>
          <div data-cierre className="relative mx-auto flex max-w-[40rem] flex-col items-center gap-6 text-center">
            <svg aria-hidden viewBox={ONDA_CAJA} className="pointer-events-none absolute left-1/2 top-1/2 -z-0 w-[min(120vw,46rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible opacity-[0.14]">
              <path data-onda d={ONDA_TRAZADO} transform={ONDA_TRANSFORMACION} pathLength={100} fill="none" stroke="var(--lumbre)" strokeWidth="2" />
            </svg>
            <h2 data-revelar className="relative text-balance text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] lg:text-[2.5rem]">¿Quiere verlo con su empresa?</h2>
            <p data-revelar className="relative text-pretty text-lg text-tinta-suave">Le enseñamos la aplicación y resolvemos sus dudas, sin compromiso.</p>
            <Link data-revelar href="/contacto" className={`${BOTON_PRINCIPAL} relative`}>
              Solicitar una demostración
            </Link>
          </div>
        </Seccion>
      </main>

      {/* 10. Pie */}
      <footer className="border-t border-linea bg-superficie">
        <Contenedor className="grid grid-cols-2 gap-x-8 gap-y-12 py-20 lg:grid-cols-12">
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-8">
            <EnlaceInicio className="self-start rounded-md">
              <Logotipo alto={22} decorativo />
            </EnlaceInicio>
            <p className="max-w-[22rem] text-sm text-tinta-suave">Herramienta independiente de apoyo al técnico de prevención. No es un servicio de la Inspección de Trabajo ni del INSST.</p>
          </div>
          <ColumnaPie titulo="Producto" enlaces={NAVEGACION.map((n) => ({ href: `/${n.href}`, texto: n.texto }))} />
          <ColumnaPie
            titulo="Contacto"
            enlaces={[
              { href: "/contacto", texto: "Pedir una demostración" },
              { href: "/acceso", texto: "Acceder al panel" },
            ]}
          />
        </Contenedor>
        <Contenedor>
          <div className="flex flex-col gap-2 border-t border-linea py-6 text-xs text-tinta-suave sm:flex-row sm:justify-between">
            <p>{ORIGEN_INSST}.</p>
            <nav aria-label="Textos legales" className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/aviso-legal" className="hover:text-tinta">Aviso legal</Link>
              <Link href="/privacidad" className="hover:text-tinta">Privacidad</Link>
              <Link href="/cookies" className="hover:text-tinta">Cookies</Link>
              <span>© {NOMBRE}</span>
            </nav>
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
