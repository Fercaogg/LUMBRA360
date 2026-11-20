import type { MetadataRoute } from "next";
import { urlPublica } from "@/config/publicacion";

// Solo las páginas públicas. El panel, las encuestas y los acuses quedan fuera.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = urlPublica();
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/contacto`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/aviso-legal`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
