import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sapfircouture.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/catalog", "/about", "/contacts", "/uk"],
        disallow: ["/admin", "/api", "/login", "/_next", "/private"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
