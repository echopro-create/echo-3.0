import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://echoproject.space";

  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/account",
        "/messages",
        "/login",
        "/api/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
