import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, BellOff, Building2, ClipboardCheck, EyeOff, FileCheck2, HardHat, ListChecks, Users, Waves } from "lucide-react";
import { ORIGEN_INSST } from "@/config/atribucion";
import { LEMA, NOMBRE } from "@/config/marca";
import { EfectosPortada } from "@/components/portada/efectos";
import { VideoLumbra } from "@/components/portada/video-lumbra";
import { Movil, Portatil, PortatilPelicula } from "@/components/portada/dispositivos";
import { ONDA_CAJA, ONDA_TRANSFORMACION, ONDA_TRAZADO } from "@/components/marca/onda";
import { Logotipo, Simbolo } from "@/components/marca/logotipo";
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
    titulo: "Porque en la pyme esto se queda en papeles sueltos.",
    texto:
      "Evaluar los riesgos psicosociales y ordenar la desconexión digital suele acabar repartido entre correos, hojas y carpetas, sin seguimiento ni pruebas. Nace para ordenar ese trabajo y que no dependa de la memoria de nadie.",
  },
  {
    etiqueta: "Cómo le ayuda",
    titulo: "Le da método sin cargarle de trabajo.",
    puntos: [
      "Sabe cómo está su plantilla sin exponer a nadie",
      "Convierte los resultados en medidas con responsable y fecha",
      "Tiene cada paso documentado si se lo piden",
    ],
  },
  {
    etiqueta: "Qué necesita",
    titulo: "Para empezar, muy poco.",
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

const HITOS: { etiqueta: string; titulo: string; texto: string; marca?: string; logo?: "ymca" | "onda"; destacado?: boolean }[] = [
  { etiqueta: "Prototipo", titulo: "WORKWELL360", texto: "La primera versión de la idea.", marca: "WW" },
  { etiqueta: "Pilotaje", titulo: "YMCA Salamanca", texto: "Monitorizado con resultados satisfactorios.", logo: "ymca" },
  { etiqueta: "Evolución", titulo: "LUMBRA360", texto: "Más completo, con evidencias fechadas.", logo: "onda", destacado: true },
];

const EQUIPO: { nombre: string; foto: string; perfil?: string }[] = [
  { nombre: "Fernando Martín Vaquero", foto: "/equipo/fernando-martin-vaquero.webp" },
  { nombre: "Ana María Pinto Llorente", foto: "/equipo/ana-maria-pinto-llorente.webp", perfil: "https://produccioncientifica.usal.es/investigadores/57371/detalle" },
  { nombre: "Luis Eduardo Andrade Silva", foto: "/equipo/luis-eduardo-andrade-silva-v2.webp", perfil: "https://produccioncientifica.usal.es/investigadores/148334/detalle" },
];

const PERFILES = [
  { icono: Building2, titulo: "Gerencia de pymes", texto: "Una visión clara de lo hecho y lo pendiente." },
  { icono: Users, titulo: "Recursos humanos", texto: "Campañas, política de desconexión y acuses en un sitio." },
  { icono: HardHat, titulo: "Técnicos de PRL", texto: "Respuestas para FPSICO, informe firmado y plan de acción." },
  { icono: ClipboardCheck, titulo: "Asesorías y gestorías", texto: "Varias empresas desde un panel, con su marca." },
];

// ---------- Piezas de maquetación ----------

const BOTON = "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-base font-medium transition-colors duration-200";
const BOTON_PRINCIPAL = `${BOTON} bg-tinta text-[var(--texto-sobre-marca)] hover:bg-[var(--tinta-800)]`;
const BOTON_SECUNDARIO = `${BOTON} border border-linea-fuerte text-tinta hover:border-tinta`;
const TARJETA = "h-full rounded-[20px] border border-linea bg-superficie p-8 transition-shadow duration-300 hover:shadow-[var(--sombra-2)] lg:p-10";

function Contenedor({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1264px] px-6 sm:px-8 ${className}`}>{children}</div>;
}

function Seccion({ id, alterna = false, children }: { id?: string; alterna?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-16 py-24 lg:py-40 ${alterna ? "bg-papel" : "bg-superficie"}`}>
      <Contenedor>{children}</Contenedor>
    </section>
  );
}

function Encabezado({ etiqueta, titulo, entradilla }: { etiqueta: string; titulo: string; entradilla?: string }) {
  return (
    <div data-titular className="mx-auto mb-14 flex max-w-[44rem] flex-col items-center gap-5 text-center lg:mb-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-tinta-suave">{etiqueta}</p>
      <h2 className="text-balance text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] lg:text-[2.5rem]">{titulo}</h2>
      {entradilla ? <p className="text-pretty text-lg text-tinta-suave">{entradilla}</p> : null}
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

      <main id="contenido" className="flex-1 overflow-x-clip">
        {/* 2. Hero */}
        <section data-heroe className="relative overflow-hidden bg-superficie pb-16 pt-28 lg:pt-32">
          <Contenedor>
            <div data-hero-texto className="mx-auto flex max-w-[52rem] flex-col items-center gap-6 text-center">
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
          <Encabezado etiqueta="Qué es" titulo={`Qué es ${NOMBRE} y por qué nace.`} />
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div data-tarjetas className="flex flex-col gap-6 lg:col-span-5">
              <p data-tarjeta className="max-w-[60ch] text-pretty text-xl leading-relaxed lg:text-[1.375rem]">
                Una plataforma web para evaluar los riesgos psicosociales de forma continua, ordenar la desconexión digital y guardar cada paso con fecha.
              </p>
              <p data-tarjeta className="max-w-[60ch] text-pretty text-lg leading-relaxed text-tinta-suave">
                Acompaña al técnico de prevención: la plantilla responde de forma anónima, la empresa actúa y todo queda documentado.
              </p>
              <p data-tarjeta className="flex items-center gap-3 text-sm font-medium">
                <span aria-hidden className="size-2 rounded-full bg-lumbre" />
                Sin vigilancia: no mide actividad, conexiones ni correos.
              </p>
            </div>
            <ul data-tarjetas className="grid gap-6 [perspective:1400px] lg:col-span-7">
              {PILARES.map((p) => (
                <li key={p.titulo} data-tarjeta className={`${TARJETA} flex items-start gap-6`}>
                  <Icono icono={p.icono} />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold">{p.titulo}</h3>
                    <p className="text-pretty text-tinta-suave">{p.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ol data-tarjetas className="mt-16 grid gap-6 [perspective:1400px] md:grid-cols-3 lg:mt-20 lg:gap-8">
            {CONTEXTO.map((c, i) => (
              <li key={c.titulo} data-tarjeta className={`${TARJETA} flex flex-col gap-4`}>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-tinta-suave">{String(i + 1).padStart(2, "0")} · {c.etiqueta}</span>
                <h3 className="text-xl font-semibold leading-snug">{c.titulo}</h3>
                {c.texto ? <p className="text-pretty text-tinta-suave">{c.texto}</p> : null}
                {c.puntos ? (
                  <ul className="flex flex-col border-t border-linea">
                    {c.puntos.map((pt) => (
                      <li key={pt} className="flex items-start gap-3 border-b border-linea py-2.5 text-[0.95rem]">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-lumbre" />
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
          <Encabezado etiqueta="Para qué sirve" titulo="Cuidar a la plantilla y poder demostrarlo." />
          <ul data-tarjetas className="grid gap-6 [perspective:1400px] md:grid-cols-3 lg:gap-8">
            {BENEFICIOS.map((b) => (
              <li key={b.titulo} data-tarjeta className={`${TARJETA} flex flex-col gap-4`}>
                <Icono icono={b.icono} />
                <h3 className="text-lg font-semibold">{b.titulo}</h3>
                <p className="text-pretty text-tinta-suave">{b.texto}</p>
              </li>
            ))}
          </ul>
        </Seccion>

        {/* 5. Cómo se utiliza */}
        <Seccion id="como-se-utiliza" alterna>
          <Encabezado etiqueta="Cómo se utiliza" titulo="De la primera respuesta a la última evidencia." />
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
          <Encabezado etiqueta="La aplicación por dentro" titulo="Todo en un panel claro." entradilla="Pantallas reales con datos de demostración." />
          <div data-pelicula data-cursores={JSON.stringify(CAPITULOS.map((c) => c.cursor))} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <ol className="hidden flex-col gap-7 lg:col-span-4 lg:flex">
              {CAPITULOS.map((c, i) => (
                <li key={c.titulo} data-capitulo data-activo={i === 0} className="flex flex-col gap-2">
                  <span aria-hidden className="relative h-0.5 overflow-hidden rounded-full bg-linea-fuerte">
                    <span data-barra className="absolute inset-0 origin-left bg-tinta" />
                  </span>
                  <span className="mt-2 font-mono text-xs text-tinta-suave">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-lg font-semibold">{c.titulo}</h3>
                  <p className="text-pretty text-tinta-suave">{c.texto}</p>
                </li>
              ))}
            </ol>
            <div className="mx-auto w-full max-w-[calc((100svh-10rem)*1.5)] lg:col-span-8">
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

        {/* 7. Para quién es */}
        <Seccion id="para-quien" alterna>
          <Encabezado etiqueta="Para quién es" titulo="Pensada para quien gestiona la prevención." />
          <ul data-perfiles className="grid gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-4">
            {PERFILES.map((p) => (
              <li key={p.titulo} data-perfil className={`${TARJETA} flex flex-col gap-4 lg:p-8`}>
                <Icono icono={p.icono} />
                <h3 className="text-lg font-semibold">{p.titulo}</h3>
                <p className="text-pretty text-tinta-suave">{p.texto}</p>
              </li>
            ))}
          </ul>
        </Seccion>

        {/* 8. Respaldo: lo ya hecho, los avales y el equipo */}
        <Seccion id="respaldo">
          <Encabezado etiqueta="Respaldo" titulo="No partimos de cero." />
          <div data-evolucion className="relative overflow-hidden rounded-[28px] bg-[var(--tinta-900)] p-8 text-[var(--texto-sobre-marca)] sm:p-10 lg:p-14">
            <div className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div data-evolucion-texto className="flex flex-col gap-5 lg:col-span-5">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--lumbre-300)]">Ya lo hemos hecho</p>
                <h3 className="text-balance text-[1.875rem] font-medium leading-[1.08] tracking-[-0.03em] lg:text-[2.5rem]">Antes de {NOMBRE}, ya pusimos a prueba WORKWELL360.</h3>
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
                      {h.logo === "ymca" ? (
                        <Image src="/marca/terceros/ymca.svg" alt="YMCA" width={40} height={12} className="h-auto w-10" />
                      ) : h.logo === "onda" ? (
                        <Simbolo tamano={30} color="var(--tinta-950)" />
                      ) : (
                        <span className="font-mono text-sm font-semibold">{h.marca}</span>
                      )}
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
              <h3 className="text-2xl font-medium tracking-[-0.025em] lg:text-[1.75rem]">Las personas detrás del proyecto.</h3>
            </div>
            <ul data-tarjetas className="mx-auto flex w-full max-w-[72rem] flex-wrap justify-center gap-4 [perspective:1400px] lg:gap-6">
            {EQUIPO.map((m) => (
              <li key={m.nombre} data-tarjeta className="flex w-full items-center gap-4 rounded-[20px] border border-linea bg-superficie p-4 pr-5 sm:w-[calc(50%-0.5rem)] lg:w-[calc(50%-0.75rem)] xl:w-[calc((100%-3rem)/3)]">
                <Image src={m.foto} alt={`Retrato de ${m.nombre}`} width={128} height={128} sizes="64px" className="size-16 shrink-0 rounded-full object-cover" />
                <div className="flex min-w-0 flex-col">
                  <h3 className="font-semibold leading-snug">{m.nombre}</h3>
                  <p className="text-sm text-tinta-suave">Dirección del proyecto</p>
                  {m.perfil ? (
                    <a href={m.perfil} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 self-start text-sm font-medium underline decoration-linea-fuerte underline-offset-4 transition-colors hover:decoration-tinta">
                      Perfil de investigación
                      <ArrowUpRight aria-hidden size={14} strokeWidth={2} />
                      <span className="sr-only">(se abre en una pestaña nueva)</span>
                    </a>
                  ) : null}
                </div>
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
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-6">
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
              { href: "/contacto", texto: "Pedir una demostración" },
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
