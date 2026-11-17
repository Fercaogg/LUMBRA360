import Image from "next/image";
import { Simbolo } from "@/components/marca/logotipo";

// Maquetas de dispositivo para las capturas reales de la aplicación.
// Mismo tratamiento en todas: pantalla con radio de 6 px dentro de un marco de tinta.
// Sin JavaScript o con «reducir movimiento», el portátil se ve abierto y encendido.

export function Portatil({ src, alt, prioridad = false }: { src: string; alt: string; prioridad?: boolean }) {
  return (
    <div data-portatil className="portatil">
      <div className="portatil-escena">
        <div data-tapa className="portatil-tapa">
          <div className="portatil-cara portatil-frente">
            <div className="relative aspect-[1600/1013] overflow-hidden rounded-[6px] bg-[var(--tinta-950)]">
              <div data-encender className="absolute inset-0">
                <Image src={src} alt={alt} fill priority={prioridad} sizes="(min-width: 1200px) 1000px, 92vw" className="object-cover object-top" />
              </div>
            </div>
          </div>
          <div aria-hidden className="portatil-cara portatil-dorso">
            <Simbolo tamano={96} color="var(--tinta-600)" />
          </div>
        </div>
        <div aria-hidden className="portatil-base">
          <span />
        </div>
      </div>
    </div>
  );
}

export function Movil({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div data-movil className={`rounded-[1.75rem] bg-[var(--tinta-900)] p-1.5 shadow-[0_30px_60px_-30px_rgb(17_17_17/0.5)] ${className}`}>
      <div className="relative aspect-[1/2] overflow-hidden rounded-[1.4rem] bg-superficie">
        <Image src={src} alt={alt} fill sizes="220px" className="object-cover object-top" />
      </div>
    </div>
  );
}

// Portátil abierto con varias pantallas apiladas: la sección «La aplicación por dentro»
// las va pasando con el scroll, como un vídeo, y un cursor señala lo importante.
export function PortatilPelicula({ pantallas }: { pantallas: { src: string; alt: string }[] }) {
  return (
    <div className="w-full">
      <div className="mx-auto w-[88%] rounded-t-[18px] bg-[var(--tinta-900)] p-[1.4%] pb-[2%] shadow-[0_40px_80px_-40px_rgb(17_17_17/0.45)]">
        <div className="relative aspect-[1600/1013] overflow-hidden rounded-[6px] bg-superficie">
          {pantallas.map((p, i) => (
            <div key={p.src} data-fotograma className="absolute inset-0" style={i === 0 ? undefined : { opacity: 0 }}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1200px) 760px, 92vw" className="object-cover object-top" />
            </div>
          ))}
          <span data-cursor aria-hidden className="cursor-pelicula" />
        </div>
      </div>
      <div aria-hidden className="relative h-3 w-full rounded-b-[14px] bg-gradient-to-b from-[var(--piedra-200)] to-[var(--piedra-400)] sm:h-4">
        <span className="absolute left-1/2 top-0 h-1.5 w-[14%] -translate-x-1/2 rounded-b-md bg-[var(--piedra-400)]" />
      </div>
    </div>
  );
}
