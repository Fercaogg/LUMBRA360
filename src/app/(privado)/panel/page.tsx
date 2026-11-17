import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Cabecera, EstadoVacio, Etiqueta } from "@/components/ui/piezas";
import { exigirAcceso } from "@/lib/acceso";

export const metadata: Metadata = { title: "Panel" };

export default async function PaginaPanel() {
  const acceso = await exigirAcceso();

  const espacios = [
    ...acceso.partners.map((p) => ({
      href: `/panel/partner/${p.id}`,
      nombre: p.nombre,
      tipo: p.rol === "gestor" ? "Partner" : "Partner · técnico",
    })),
    ...acceso.empresas.map((e) => ({
      href: `/panel/empresa/${e.id}`,
      nombre: e.nombre,
      tipo: e.via === "tecnico" ? "Empresa asignada" : "Empresa",
    })),
  ];

  if (!acceso.esAdmin && espacios.length === 1) redirect(espacios[0].href);

  if (!acceso.esAdmin && espacios.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu cuenta todavía no tiene ningún espacio"
        texto="Has entrado bien, pero nadie te ha dado acceso a una empresa o a un partner. Pide a quien te invitó que revise el correo que usó."
      />
    );
  }

  return (
    <>
      <Cabecera titulo="Tus espacios" descripcion="Elige dónde quieres trabajar." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {acceso.esAdmin ? (
          <li>
            <Link href="/admin" className="flex min-h-20 flex-col justify-center gap-1 rounded-xl border border-linea bg-superficie p-4 transition-colors duration-150 hover:border-acento">
              <Etiqueta tono="acento">Administración</Etiqueta>
              <span className="font-medium">Partners, empresas y pendientes</span>
            </Link>
          </li>
        ) : null}
        {espacios.map((espacio) => (
          <li key={espacio.href}>
            <Link href={espacio.href} className="flex min-h-20 flex-col justify-center gap-1 rounded-xl border border-linea bg-superficie p-4 transition-colors duration-150 hover:border-acento">
              <Etiqueta>{espacio.tipo}</Etiqueta>
              <span className="font-medium">{espacio.nombre}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
