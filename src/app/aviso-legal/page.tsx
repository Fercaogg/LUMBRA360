import type { Metadata } from "next";
import Link from "next/link";
import { ORIGEN_INSST } from "@/config/atribucion";
import { ACTUALIZADO, CORREO_CONTACTO, MARCO, TITULAR } from "@/config/legal";
import { NOMBRE } from "@/config/marca";
import { PaginaTexto, Prosa } from "@/components/portada/pagina-texto";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: `Quién está detrás de ${NOMBRE} y condiciones de uso de esta web.`,
  alternates: { canonical: "/aviso-legal" },
};

export default function AvisoLegal() {
  return (
    <PaginaTexto antetitulo="Legal" titulo="Aviso legal" entradilla={`Última actualización: ${ACTUALIZADO}.`}>
      <Prosa>
        <h2>Quién está detrás de esta web</h2>
        <ul>
          <li>
            <strong>Responsable:</strong> {TITULAR}.
          </li>
          <li>
            <strong>Contexto:</strong> {MARCO}.
          </li>
          <li>
            <strong>Contacto:</strong> <a href={`mailto:${CORREO_CONTACTO}`}>{CORREO_CONTACTO}</a>
          </li>
        </ul>

        <h2>Qué es esta web</h2>
        <p>
          {NOMBRE} es una herramienta web de apoyo al técnico de prevención para evaluar los riesgos psicosociales, ordenar la desconexión digital y guardar cada paso con fecha. Se encuentra en fase
          de prototipo y piloto.
        </p>
        <p>
          {NOMBRE} es una herramienta independiente. No es un servicio de la Inspección de Trabajo ni del Instituto Nacional de Seguridad y Salud en el Trabajo, y no sustituye al servicio de prevención
          ni al criterio del técnico.
        </p>

        <h2>Condiciones de uso</h2>
        <p>
          Quien use esta web se compromete a hacerlo de forma lícita y a no dañar su funcionamiento ni intentar acceder a zonas o datos para los que no tiene permiso. El acceso al panel es solo para las
          personas invitadas.
        </p>

        <h2>Propiedad intelectual</h2>
        <p>
          Los textos, el diseño, el logotipo y el código de {NOMBRE} pertenecen a su responsable, salvo que se indique otra cosa. No se pueden copiar ni reutilizar sin permiso.
        </p>
        <p>
          {ORIGEN_INSST}. Su uso en la plataforma no supone que el Instituto respalde {NOMBRE}. Los nombres y logotipos de otras entidades que puedan aparecer pertenecen a sus titulares.
        </p>

        <h2>Responsabilidad</h2>
        <p>
          La información de esta web es general y orientativa. Al tratarse de un piloto, el servicio puede tener interrupciones o cambios. Se procura que todo funcione correctamente, pero no se puede
          garantizar que esté siempre disponible ni libre de errores.
        </p>
        <p>Los enlaces a webs de terceros se ofrecen como información. Su contenido es responsabilidad de quien las gestiona.</p>

        <h2>Datos personales y cookies</h2>
        <p>
          Puede consultar cómo se tratan los datos en la <Link href="/privacidad">política de privacidad</Link> y qué cookies se usan en el <Link href="/cookies">aviso de cookies</Link>.
        </p>

        <h2>Legislación aplicable</h2>
        <p>Esta web se rige por la legislación española.</p>
      </Prosa>
    </PaginaTexto>
  );
}
