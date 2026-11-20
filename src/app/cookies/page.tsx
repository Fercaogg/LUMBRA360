import type { Metadata } from "next";
import Link from "next/link";
import { ACTUALIZADO } from "@/config/legal";
import { NOMBRE } from "@/config/marca";
import { PaginaTexto, Prosa } from "@/components/portada/pagina-texto";

export const metadata: Metadata = {
  title: "Aviso de cookies",
  description: `Qué cookies usa ${NOMBRE}. La web pública no usa cookies de seguimiento ni de publicidad.`,
  alternates: { canonical: "/cookies" },
};

export default function Cookies() {
  return (
    <PaginaTexto antetitulo="Legal" titulo="Aviso de cookies" entradilla={`Última actualización: ${ACTUALIZADO}.`}>
      <Prosa>
        <h2>En resumen</h2>
        <p>
          La web pública de {NOMBRE} no usa cookies de seguimiento, de analítica ni de publicidad. Por eso no le pedimos que acepte cookies al entrar.
        </p>
        <p>
          Las estadísticas de visitas se obtienen sin cookies y sin identificar a nadie. Puede leer más en la <Link href="/privacidad">política de privacidad</Link>.
        </p>

        <h2>Cookies técnicas del panel</h2>
        <p>
          Solo cuando alguien entra en el panel, o abre la demostración, se guardan cookies técnicas para mantener la sesión iniciada. Son imprescindibles para que el panel funcione y por eso no
          necesitan consentimiento.
        </p>
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Para qué</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="whitespace-nowrap font-mono text-xs">sb-…-auth-token</td>
              <td>Mantener la sesión iniciada en el panel de forma segura.</td>
              <td>Hasta que cierra la sesión o caduca.</td>
            </tr>
          </tbody>
        </table>
        <p>Quien responde a un cuestionario no necesita cuenta y no recibe cookies de sesión.</p>

        <h2>Cómo borrarlas</h2>
        <p>
          Puede cerrar la sesión con el botón «Salir» del panel o borrar las cookies desde la configuración de su navegador. Si las borra, tendrá que volver a acceder.
        </p>
      </Prosa>
    </PaginaTexto>
  );
}
