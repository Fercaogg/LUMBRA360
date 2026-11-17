import Image from "next/image";

// «Para qué sirve»: cuatro usos con pantallas reales del panel (datos de demostración, ficticios).
const USOS = [
  {
    titulo: "Saber cómo está la plantilla.",
    texto: "Seguimientos breves y evaluaciones con cuestionarios anónimos. Los resultados se ven por grupos de 5 respuestas o más, cuando la campaña se cierra.",
    puntos: ["Participación en tiempo real, sin saber quién responde", "Filtros por área sin romper el anonimato"],
    imagen: "/portada/pantalla-resultados.webp",
    alt: "Resultados de un seguimiento de demostración: participación del 75 % y distribución por niveles de un factor.",
  },
  {
    titulo: "Convertir lo que sale en medidas.",
    texto: "Un plan de acción con responsable, fecha prevista y estado. Cada cambio guarda su historial, así se sabe qué se hizo y cuándo.",
    puntos: ["Medidas ligadas a la campaña de origen", "Historial de cambios con fecha y autor"],
    imagen: "/portada/pantalla-plan.webp",
    alt: "Plan de acción de demostración con tres medidas de ejemplo, su responsable y su fecha prevista.",
  },
  {
    titulo: "Ordenar la desconexión digital.",
    texto: "La política se redacta desde una plantilla, se aprueba por versiones y se difunde con acuse de lectura. También se registran la audiencia a la representación y la formación.",
    puntos: ["Versiones aprobadas que no se editan", "Acuse de lectura nominal, separado de los cuestionarios"],
    imagen: "/portada/pantalla-desconexion.webp",
    alt: "Pantalla de desconexión digital: versión 1 de la política aprobada y acuse de lectura abierto.",
  },
  {
    titulo: "Llevar varias empresas a la vez.",
    texto: "Para servicios de prevención y gestorías: todas sus empresas en un panel, con el estado de cada evaluación. Con su marca, si lo desea.",
    puntos: ["Altas de empresas e invitaciones", "Cada empresa ve solo lo suyo"],
    imagen: "/portada/pantalla-partner.webp",
    alt: "Panel de un partner de demostración con su lista de empresas asignadas.",
  },
];

export function Usos() {
  return (
    <div className="flex flex-col gap-24 sm:gap-32">
      {USOS.map((uso, i) => {
        const invertido = i % 2 === 1;
        return (
          <article key={uso.titulo} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className={`flex flex-col gap-5 lg:col-span-4 ${invertido ? "lg:order-2 lg:col-start-9" : ""}`}>
              <span className="font-mono text-xs tracking-[0.14em] text-tinta-suave">{String(i + 1).padStart(2, "0")} / {String(USOS.length).padStart(2, "0")}</span>
              <h3 className="text-balance font-serif text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.02] tracking-[-0.03em]">{uso.titulo}</h3>
              <p className="text-pretty text-lg leading-relaxed text-tinta-suave">{uso.texto}</p>
              <ul className="flex flex-col border-t border-linea">
                {uso.puntos.map((p) => (
                  <li key={p} className="flex items-center gap-3 border-b border-linea py-2.5 text-sm">
                    <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-lumbre" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <figure className={`lg:col-span-8 ${invertido ? "lg:order-1 lg:col-start-1" : ""}`}>
              <div className="pantalla" data-girar={invertido ? "izquierda" : "derecha"}>
                <Image src={uso.imagen} alt={uso.alt} width={1800} height={1140} sizes="(min-width: 1024px) 60vw, 100vw" className="block h-auto w-full" />
              </div>
              <figcaption className="mt-4 text-xs text-tinta-suave">Pantalla real del panel con datos de demostración, ficticios.</figcaption>
            </figure>
          </article>
        );
      })}
    </div>
  );
}
