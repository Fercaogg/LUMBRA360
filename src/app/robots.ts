import type { MetadataRoute } from "next";
import { INDEXAR, RUTAS_PRIVADAS, urlPublica } from "@/config/publicacion";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXAR) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: RUTAS_PRIVADAS },
    sitemap: `${urlPublica()}/sitemap.xml`,
  };
}
