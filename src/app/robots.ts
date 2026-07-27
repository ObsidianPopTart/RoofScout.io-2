import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /app/* is real per-tenant customer data (also noindex'd at the
        // page level as defense in depth); /api/* is never useful to crawl.
        disallow: ["/app/", "/api/"],
      },
    ],
    sitemap: "https://roof-scout.org/sitemap.xml",
  };
}
