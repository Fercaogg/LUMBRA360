import type { Metadata } from "next";
import Link from "next/link";
import { CORREO_CONTACTO } from "@/config/legal";
import { NOMBRE } from "@/config/marca";
import { PaginaTexto } from "@/components/portada/pagina-texto";
import { Campo, Casilla, Enviar, Formulario } from "@/components/ui/formulario";
import { solicitarDemo } from "./acciones";

export const metadata: Metadata = {
  title: "Solicitar una demostración",
  description: `Pida una demostración guiada de ${NOMBRE}: evaluación psicosocial, plan de acción y desconexión digital para su pyme.`,
  alternates: { canonical: "/contacto" },
};

export default function PaginaContacto() {
  return (
    <PaginaTexto
      antetitulo="Contacto"
      titulo="Solicitar una demostración"
      entradilla="Le enseñamos la aplicación con datos de ejemplo y resolvemos sus dudas. Déjenos su nombre y su correo y le escribimos."
    >
      <div className="rounded-[20px] border border-linea bg-superficie p-5 sm:p-7">
        <Formulario accion={solicitarDemo}>
          <Campo etiqueta="Nombre" name="nombre" autoComplete="name" required maxLength={120} />
          <Campo etiqueta="Correo electrónico" name="correo" type="email" autoComplete="email" inputMode="email" placeholder="nombre@empresa.es" required />
          {/* Campo trampa contra robots: oculto para las personas y para los lectores de pantalla. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Web
              <input name="web" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>
          <Casilla
            etiqueta={`Quiero recibir novedades de ${NOMBRE} por correo`}
            ayuda="Opcional. Puede darse de baja cuando quiera."
            name="novedades"
            value="si"
          />
          <p className="text-sm text-tinta-suave">
            Usaremos sus datos solo para responder a su solicitud y, si marca la casilla, para enviarle novedades. Más información en la{" "}
            <Link href="/privacidad" className="underline underline-offset-4">política de privacidad</Link>.
          </p>
          <Enviar ancho>Enviar solicitud</Enviar>
        </Formulario>
      </div>
      <p className="text-tinta-suave">
        ¿Prefiere escribirnos directamente? <a href={`mailto:${CORREO_CONTACTO}`} className="font-medium text-tinta underline underline-offset-4">{CORREO_CONTACTO}</a>
      </p>
    </PaginaTexto>
  );
}
