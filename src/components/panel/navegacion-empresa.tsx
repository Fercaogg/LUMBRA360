"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { BellOff, ClipboardList, LayoutDashboard, ListChecks, Users } from "lucide-react";

// Navegación de la empresa: barra lateral en escritorio y barra horizontal en móvil.
const SECCIONES = [
  { ruta: "", texto: "Resumen", icono: LayoutDashboard },
  { ruta: "/campanas", texto: "Campañas", icono: ClipboardList },
  { ruta: "/plan", texto: "Plan de acción", icono: ListChecks },
  { ruta: "/desconexion", texto: "Desconexión digital", icono: BellOff },
  { ruta: "/estructura", texto: "Grupos", icono: Users },
];

export function NavegacionEmpresa({ empresaId, movil = false }: { empresaId: string; movil?: boolean }) {
  const actual = usePathname();
  const base = `/panel/empresa/${empresaId}`;
  const activa = (ruta: string) => (ruta === "" ? actual === base : actual.startsWith(base + ruta));
  const lista = useRef<HTMLUListElement>(null);
  // En móvil, la sección activa se centra en la barra deslizable.
  useEffect(() => {
    if (!movil) return;
    const el = lista.current?.querySelector<HTMLElement>('[aria-current="page"]');
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [movil, actual]);

  if (movil) {
    return (
      <nav aria-label="Secciones de la empresa" className="-mx-4 overflow-x-auto px-4 lg:hidden">
        <ul ref={lista} className="flex gap-2 pb-1">
          {SECCIONES.map(({ ruta, texto, icono: I }) => {
            const si = activa(ruta);
            return (
              <li key={texto}>
                <Link
                  href={base + ruta}
                  aria-current={si ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors ${
                    si ? "border-tinta bg-tinta text-[var(--texto-sobre-marca)]" : "border-linea bg-superficie text-tinta-suave hover:text-tinta"
                  }`}
                >
                  <I size={16} strokeWidth={1.75} aria-hidden />
                  {texto}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Secciones de la empresa">
      <ul className="flex flex-col gap-1">
        {SECCIONES.map(({ ruta, texto, icono: I }) => {
          const si = activa(ruta);
          return (
            <li key={texto}>
              <Link
                href={base + ruta}
                aria-current={si ? "page" : undefined}
                className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] font-medium transition-colors ${
                  si ? "bg-superficie text-tinta shadow-[var(--sombra-1)]" : "text-tinta-suave hover:bg-superficie/70 hover:text-tinta"
                }`}
              >
                {si ? <span aria-hidden className="absolute -left-3 top-2 bottom-2 w-1 rounded-full bg-lumbre" /> : null}
                <I size={18} strokeWidth={1.75} aria-hidden className={si ? "text-[var(--lumbre-600)]" : ""} />
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
