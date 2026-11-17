import { EnlaceBoton } from "@/components/ui/boton";

export default function NoEncontrada() {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Esta página no existe</h1>
      <p className="text-pretty text-tinta-suave">Puede que el enlace esté mal escrito o que no tengas acceso a este espacio.</p>
      <EnlaceBoton href="/panel">Ir al panel</EnlaceBoton>
    </main>
  );
}
