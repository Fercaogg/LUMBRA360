import { TransicionSeccion } from "@/components/movimiento/movimiento";

// Se vuelve a montar en cada navegación dentro del panel: anima la entrada de la sección.
export default function Plantilla({ children }: { children: React.ReactNode }) {
  return <TransicionSeccion>{children}</TransicionSeccion>;
}
