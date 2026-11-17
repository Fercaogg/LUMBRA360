import { LEMA, NOMBRE } from "@/config/marca";
import { EnlaceBoton } from "@/components/ui/boton";

// Portada mínima. La web pública completa llega en la fase 6.
export default function Portada() {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-6 px-4 py-16">
      <p className="text-sm font-semibold tracking-wide text-acento">{NOMBRE}</p>
      <h1 className="aparecer text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{LEMA}</h1>
      <EnlaceBoton href="/acceso">Acceder</EnlaceBoton>
    </main>
  );
}
