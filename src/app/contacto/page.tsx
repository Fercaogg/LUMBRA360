import type { Metadata } from "next";
import { PaginaPendiente } from "@/components/portada/pagina-pendiente";

export const metadata: Metadata = {
  title: "Solicitar una demostración",
  description: "Pida una demostración guiada de LUMBRA360: evaluación psicosocial, plan de acción y desconexión digital para su pyme.",
  alternates: { canonical: "/contacto" },
};

export default function PaginaContacto() {
  return (
    <PaginaPendiente
      titulo="Solicitar una demostración"
      texto="Le enseñamos la aplicación con datos de ejemplo y resolvemos sus dudas."
      nota="[PENDIENTE DE VALIDAR] Correo, teléfono o formulario de contacto."
    />
  );
}
