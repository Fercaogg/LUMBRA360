import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { EnlaceInicio } from "@/components/marca/enlace-inicio";
import { Logotipo } from "@/components/marca/logotipo";
import { Campo, Casilla, Enviar, Formulario } from "@/components/ui/formulario";
import { Aviso, Cargando, Tarjeta } from "@/components/ui/piezas";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { registrarAcuse } from "../acciones";

export const metadata: Metadata = { title: "Acuse de lectura", referrer: "no-referrer" };

type Politica = {
  empresa: string;
  es_demo: boolean;
  version: number;
  aprobada_el: string;
  secciones: { titulo: string; cuerpo: string }[] | null;
};

async function Contenido({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const valido = /^[A-Za-z0-9_-]{20,80}$/.test(token);
  const { data } = valido ? await crearClienteAdmin().rpc("obtener_politica_acuse", { p_token: token }) : { data: null };
  const politica = data as Politica | null;

  if (!politica) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-2xl font-medium leading-tight tracking-tight">Este enlace no está disponible</h1>
        <p className="text-pretty text-tinta-suave">El acuse de lectura se ha cerrado o el enlace no es correcto. Pida uno nuevo a su empresa.</p>
      </div>
    );
  }

  const aprobada = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" }).format(
    new Date(politica.aprobada_el),
  );

  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-sm text-tinta-suave">{politica.empresa}</p>
        <h1 className="text-balance font-serif text-2xl font-medium leading-tight tracking-tight sm:text-3xl">Política de desconexión digital</h1>
        <p className="text-sm text-tinta-suave">
          Versión {politica.version}, aprobada el {aprobada}.
        </p>
      </header>
      {politica.es_demo ? <Aviso>Documento de demostración. Su texto es ficticio.</Aviso> : null}

      <article className="flex flex-col gap-6 rounded-xl border border-linea bg-superficie p-5 sm:p-8">
        {(politica.secciones ?? []).map((seccion, i) => (
          <section key={i} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{seccion.titulo}</h2>
            <p className="whitespace-pre-line text-pretty">{seccion.cuerpo}</p>
          </section>
        ))}
      </article>

      <Tarjeta className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Confirmar la lectura</h2>
        <p className="text-pretty text-sm text-tinta-suave">
          Este acuse sí lleva su nombre, porque sirve para acreditar que ha recibido la política. Se guarda con la fecha y nada más. No tiene ninguna
          relación con los cuestionarios anónimos.
        </p>
        <Formulario accion={registrarAcuse}>
          <input type="hidden" name="token" value={token} />
          <Campo etiqueta="Nombre y apellidos" name="nombre" autoComplete="name" required maxLength={160} />
          <Casilla etiqueta="He leído la política de desconexión digital" name="conforme" />
          <Enviar>Confirmar lectura</Enviar>
        </Formulario>
      </Tarjeta>
    </>
  );
}

export default function PaginaAcuse({ params }: { params: Promise<{ token: string }> }) {
  return (
    <main id="contenido" className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <EnlaceInicio className="self-start rounded-md">
        <Logotipo alto={26} decorativo />
      </EnlaceInicio>
      <Suspense fallback={<Cargando texto="Cargando la política…" />}>
        <Contenido params={params} />
      </Suspense>
    </main>
  );
}
