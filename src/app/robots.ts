import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://echoproject.space";

  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/"], // закрыть вообще всё
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
