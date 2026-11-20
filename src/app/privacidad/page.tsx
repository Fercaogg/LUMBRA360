import type { Metadata } from "next";
import Link from "next/link";
import { ACTUALIZADO, CORREO_CONTACTO, FIN_PILOTO, MARCO, TITULAR } from "@/config/legal";
import { NOMBRE } from "@/config/marca";
import { PaginaTexto, Prosa } from "@/components/portada/pagina-texto";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Qué datos trata ${NOMBRE}, para qué, durante cuánto tiempo y cómo ejercer sus derechos.`,
  alternates: { canonical: "/privacidad" },
};

const TRATAMIENTOS = [
  {
    que: "Solicitudes de demostración",
    datos: "Nombre y correo.",
    para: "Responder a su solicitud y acordar la demostración.",
    base: "Su petición, como paso previo a una posible relación (art. 6.1.b RGPD).",
    plazo: `Hasta ${FIN_PILOTO}, o antes si pide que se borren.`,
  },
  {
    que: "Novedades por correo",
    datos: "Nombre y correo, solo si marca la casilla.",
    para: `Enviarle novedades de ${NOMBRE}.`,
    base: "Su consentimiento (art. 6.1.a RGPD). Puede retirarlo cuando quiera.",
    plazo: `Hasta que se dé de baja o, como máximo, ${FIN_PILOTO}.`,
  },
  {
    que: "Cuentas del panel",
    datos: "Correo, rol y registro de las acciones con su fecha y autor.",
    para: "Darle acceso al panel y dejar constancia de cada paso.",
    base: "La relación con la entidad que le ha invitado (art. 6.1.b RGPD).",
    plazo: `Mientras dure el piloto, ${FIN_PILOTO}, salvo lo que acuerde cada empresa.`,
  },
  {
    que: "Seguridad",
    datos: "Un resumen cifrado e irreversible de la dirección IP, del correo o del usuario. Nunca se guardan en claro.",
    para: "Limitar los intentos repetidos y proteger los formularios.",
    base: "Interés legítimo en proteger el servicio (art. 6.1.f RGPD).",
    plazo: "24 horas.",
  },
  {
    que: "Estadísticas de visitas",
    datos: "Páginas vistas y datos técnicos agregados, sin cookies y sin identificar a nadie.",
    para: "Saber qué partes de la web pública se consultan. El panel, los cuestionarios y los acuses no se miden.",
    base: "Interés legítimo en mejorar la web (art. 6.1.f RGPD).",
    plazo: "Según el proveedor, solo como datos agregados.",
  },
];

export default function Privacidad() {
  return (
    <PaginaTexto antetitulo="Legal" titulo="Política de privacidad" entradilla={`Última actualización: ${ACTUALIZADO}.`}>
      <Prosa>
        <h2>Responsable</h2>
        <ul>
          <li>
            <strong>Responsable:</strong> {TITULAR}. {MARCO}.
          </li>
          <li>
            <strong>Contacto para privacidad:</strong> <a href={`mailto:${CORREO_CONTACTO}`}>{CORREO_CONTACTO}</a>
          </li>
          <li>No se ha designado Delegado de Protección de Datos.</li>
        </ul>

        <h2>Qué datos se tratan y para qué</h2>
        <div className="flex flex-col gap-3">
          {TRATAMIENTOS.map((t) => (
            <section key={t.que} className="rounded-[16px] border border-linea bg-superficie p-5">
              <h3 className="font-semibold">{t.que}</h3>
              <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[9rem_1fr]">
                <dt className="text-tinta-suave">Datos</dt>
                <dd>{t.datos}</dd>
                <dt className="text-tinta-suave">Para qué</dt>
                <dd>{t.para}</dd>
                <dt className="text-tinta-suave">Base legal</dt>
                <dd>{t.base}</dd>
                <dt className="text-tinta-suave">Cuánto tiempo</dt>
                <dd>{t.plazo}</dd>
              </dl>
            </section>
          ))}
        </div>

        <h2>Datos de las plantillas de las empresas</h2>
        <p>
          Cuando una empresa usa {NOMBRE} para evaluar los riesgos psicosociales o gestionar la desconexión digital, la responsable de esos datos es la propia empresa. {NOMBRE} los trata por encargo
          suyo y siguiendo sus instrucciones, con un contrato de encargo de tratamiento.
        </p>
        <ul>
          <li>Las respuestas a los cuestionarios son anónimas: no se guarda el nombre, el correo ni la IP de quien responde.</li>
          <li>Los resultados solo se muestran en grupos de 5 personas o más.</li>
          <li>El acuse de lectura de la política de desconexión es nominal y se guarda aparte. No tiene ninguna relación con los cuestionarios.</li>
          <li>{NOMBRE} no mide la actividad, las conexiones ni los correos de nadie.</li>
        </ul>
        <p>Si usted forma parte de una plantilla y quiere ejercer sus derechos sobre estos datos, diríjase a su empresa.</p>

        <h2>Con quién se comparten</h2>
        <p>Los datos no se venden ni se ceden a terceros, salvo obligación legal. Para prestar el servicio se usan estos proveedores, que tratan los datos por encargo:</p>
        <ul>
          <li>
            <strong>Supabase:</strong> base de datos, acceso al panel y envío de los correos de acceso. Los datos se guardan en la Unión Europea (Irlanda).
          </li>
          <li>
            <strong>Vercel:</strong> alojamiento de la web, que se ejecuta en la Unión Europea (Dublín), y estadísticas de visitas sin cookies.
          </li>
        </ul>
        <p>
          Ambas empresas tienen su sede en Estados Unidos, por lo que podría haber accesos desde allí. En ese caso, las transferencias se amparan en las cláusulas contractuales tipo de la Comisión
          Europea y, cuando corresponda, en el Marco de Privacidad de Datos entre la UE y EE. UU.
        </p>

        <h2>Sus derechos</h2>
        <p>
          Puede pedir el acceso, la rectificación o la supresión de sus datos, oponerse a su tratamiento, pedir que se limite o que se le entreguen en un formato portable, y retirar su consentimiento en
          cualquier momento. Escriba a <a href={`mailto:${CORREO_CONTACTO}`}>{CORREO_CONTACTO}</a> indicando qué derecho quiere ejercer.
        </p>
        <p>
          Si considera que no se han atendido bien sus derechos, puede presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>
          ).
        </p>

        <h2>Seguridad</h2>
        <p>
          Las comunicaciones van cifradas. Cada persona solo puede ver los datos de las empresas a las que tiene acceso, y ese control se aplica en la propia base de datos.
        </p>

        <h2>Menores</h2>
        <p>Esta web no está dirigida a menores de 14 años.</p>

        <h2>Cambios</h2>
        <p>
          Si esta política cambia, se publicará aquí con su nueva fecha. Consulte también el <Link href="/aviso-legal">aviso legal</Link> y el <Link href="/cookies">aviso de cookies</Link>.
        </p>
      </Prosa>
    </PaginaTexto>
  );
}
