import { Pestanas } from "@/components/panel/listas";

const ENLACES = [
  { href: "/admin", texto: "Resumen" },
  { href: "/admin/partners", texto: "Partners" },
  { href: "/admin/empresas", texto: "Empresas" },
  { href: "/admin/instrumentos", texto: "Instrumentos" },
  { href: "/admin/pendientes", texto: "Pendientes" },
];

export function PestanasAdmin({ actual }: { actual: string }) {
  return <Pestanas enlaces={ENLACES} actual={actual} />;
}
