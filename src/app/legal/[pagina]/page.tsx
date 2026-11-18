import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaPendiente } from "@/components/portada/pagina-pendiente";

const PAGINAS = {
  privacidad: "Política de privacidad",
  cookies: "Política de cookies",
} as const;

export function generateStaticParams() {
  return Object.keys(PAGINAS).map((pagina) => ({ pagina }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[pagina]">): Promise<Metadata> {
  const { pagina } = await params;
  return { title: PAGINAS[pagina as keyof typeof PAGINAS] ?? "Legal" };
}

export default async function PaginaLegal({ params }: PageProps<"/legal/[pagina]">) {
  const { pagina } = await params;
  const titulo = PAGINAS[pagina as keyof typeof PAGINAS];
  if (!titulo) notFound();
  // No se inventan textos legales: se redactan y revisan aparte.
  return <PaginaPendiente titulo={titulo} nota="[PENDIENTE DE VALIDAR] Texto pendiente de redacción y revisión jurídica." />;
}
