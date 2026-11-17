import type { Metadata } from "next";
import Link from "next/link";
import { PestanasAdmin } from "@/components/panel/admin";
import { Cabecera } from "@/components/ui/piezas";
import { exigirAdmin } from "@/lib/acceso";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Administración" };

export default async function PaginaAdmin() {
  await exigirAdmin();
  const supabase = await crearClienteServidor();
  const contar = { count: "exact", head: true } as const;
  const [partners, empresas, pendientes] = await Promise.all([
    supabase.from("partners").select("id", contar),
    supabase.from("empresas").select("id", contar),
    supabase.from("pendientes").select("id", contar).is("resuelto_el", null),
  ]);

  const cifras = [
    { href: "/admin/partners", etiqueta: "Partners", valor: partners.count ?? 0 },
    { href: "/admin/empresas", etiqueta: "Empresas", valor: empresas.count ?? 0 },
    { href: "/admin/pendientes", etiqueta: "Pendientes abiertos", valor: pendientes.count ?? 0 },
  ];

  return (
    <>
      <Cabecera titulo="Administración" descripcion="Recuento real de la base de datos, incluidos los datos de demostración." />
      <PestanasAdmin actual="/admin" />
      <ul className="grid gap-3 sm:grid-cols-3">
        {cifras.map((cifra) => (
          <li key={cifra.href}>
            <Link href={cifra.href} className="flex flex-col gap-1 rounded-xl border border-linea bg-superficie p-5 transition-colors duration-150 hover:border-acento">
              <span className="text-3xl font-semibold tabular-nums">{cifra.valor}</span>
              <span className="text-sm text-tinta-suave">{cifra.etiqueta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
