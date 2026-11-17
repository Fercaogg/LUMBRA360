import Image from "next/image";

// Maquetas de dispositivo para las capturas reales de la aplicación.
// Mismo tratamiento en todas: pantalla con radio de 6 px dentro de un marco de tinta.

export function Portatil({ src, alt, prioridad = false }: { src: string; alt: string; prioridad?: boolean }) {
  return (
    <div className="w-full">
      <div className="mx-auto w-[88%] rounded-t-[18px] bg-[var(--tinta-900)] p-[1.4%] pb-[2%] shadow-[0_40px_80px_-40px_rgb(17_17_17/0.45)]">
        <div className="relative aspect-[1600/1013] overflow-hidden rounded-[6px] bg-superficie">
          <Image src={src} alt={alt} fill priority={prioridad} sizes="(min-width: 1200px) 1000px, 92vw" className="object-cover object-top" />
        </div>
      </div>
      <div aria-hidden className="relative h-3 w-full rounded-b-[14px] bg-gradient-to-b from-[var(--piedra-200)] to-[var(--piedra-400)] sm:h-4">
        <span className="absolute left-1/2 top-0 h-1.5 w-[14%] -translate-x-1/2 rounded-b-md bg-[var(--piedra-400)]" />
      </div>
    </div>
  );
}

export function Movil({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`rounded-[1.75rem] bg-[var(--tinta-900)] p-1.5 shadow-[0_30px_60px_-30px_rgb(17_17_17/0.5)] ${className}`}>
      <div className="relative aspect-[1/2] overflow-hidden rounded-[1.4rem] bg-superficie">
        <Image src={src} alt={alt} fill sizes="220px" className="object-cover object-top" />
      </div>
    </div>
  );
}

// Ventana de navegador sencilla para las tarjetas de capturas. Se amplía la esquina superior
// izquierda de la captura para que el texto se lea a tamaño de tarjeta.
export function Ventana({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-linea bg-superficie">
      <div aria-hidden className="flex h-7 items-center gap-1.5 border-b border-linea px-3">
        <span className="size-2 rounded-full bg-[var(--piedra-300)]" />
        <span className="size-2 rounded-full bg-[var(--piedra-300)]" />
        <span className="size-2 rounded-full bg-[var(--piedra-300)]" />
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 560px, (min-width: 640px) 75vw, 100vw" className="origin-top-left scale-[1.6] object-cover object-left-top" />
      </div>
    </div>
  );
}
