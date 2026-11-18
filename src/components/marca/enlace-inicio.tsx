"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { NOMBRE } from "@/config/marca";

// El logotipo siempre lleva a la página principal. Si ya está en ella, sube al principio.
export function EnlaceInicio({ children, className = "", tabIndex }: { children: ReactNode; className?: string; tabIndex?: number }) {
  const alPulsar = (e: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname !== "/") return;
    e.preventDefault();
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducido ? "auto" : "smooth" });
    if (window.location.hash) history.replaceState(null, "", "/");
  };
  return (
    <Link href="/" onClick={alPulsar} aria-label={`${NOMBRE}, página principal`} className={className} tabIndex={tabIndex}>
      {children}
    </Link>
  );
}
