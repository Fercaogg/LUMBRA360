import Link from "next/link";
import { Boton } from "@/components/ui/boton";
import { Etiqueta } from "@/components/ui/piezas";
import { retirarInvitacion } from "@/app/(privado)/acciones";

export type EmpresaListada = {
  id: string;
  nombre: string;
  plantilla_declarada: number | null;
  es_demo: boolean;
  partner?: string | null;
  // Estado de su evaluación más reciente.
  estado?: string;
};

// Lista de empresas. En móvil se apila; no hay tablas con desplazamiento lateral.
export function ListaEmpresas({ empresas }: { empresas: EmpresaListada[] }) {
  return (
    <ul className="flex flex-col divide-y divide-linea overflow-hidden rounded-xl border border-linea bg-superficie">
      {empresas.map((empresa) => (
        <li key={empresa.id}>
          <Link
            href={`/panel/empresa/${empresa.id}`}
            className="flex flex-col gap-2 p-4 transition-colors duration-150 hover:bg-papel sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">{empresa.nombre}</span>
              <span className="text-sm text-tinta-suave">
                {empresa.partner ? `${empresa.partner} · ` : ""}
                {empresa.plantilla_declarada
                  ? `${empresa.plantilla_declarada} personas en plantilla`
                  : "Plantilla sin indicar"}
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-2">
              {empresa.es_demo ? <Etiqueta tono="aviso">Demo</Etiqueta> : null}
              <Etiqueta tono={empresa.estado === "Evaluación abierta" ? "acento" : "neutro"}>{empresa.estado ?? "Sin evaluaciones"}</Etiqueta>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export type InvitacionListada = { id: string; correo: string; rol: string };

const ROLES: Record<string, string> = {
  admin: "Administración",
  partner: "Gestor",
  tecnico: "Técnico de prevención",
  empresa: "Empresa",
};

export function ListaInvitaciones({ invitaciones }: { invitaciones: InvitacionListada[] }) {
  if (invitaciones.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-tinta-suave">Pendientes de entrar por primera vez</h3>
      <ul className="flex flex-col divide-y divide-linea rounded-lg border border-linea">
        {invitaciones.map((inv) => (
          <li key={inv.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex flex-col">
              <span className="break-all font-medium">{inv.correo}</span>
              <span className="text-sm text-tinta-suave">{ROLES[inv.rol] ?? inv.rol}</span>
            </span>
            <form action={retirarInvitacion}>
              <input type="hidden" name="id" value={inv.id} />
              <Boton variante="peligro" type="submit" aria-label={`Retirar el acceso pendiente de ${inv.correo}`}>
                Retirar
              </Boton>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Pestanas({ enlaces, actual }: { enlaces: { href: string; texto: string }[]; actual: string }) {
  return (
    <nav aria-label="Secciones" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1 border-b border-linea">
        {enlaces.map((enlace) => {
          const activo = enlace.href === actual;
          return (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                aria-current={activo ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors duration-150 ${
                  activo ? "border-acento text-acento" : "border-transparent text-tinta-suave hover:text-tinta"
                }`}
              >
                {enlace.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
