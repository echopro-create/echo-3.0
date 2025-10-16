import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const host = "https://echoproject.space";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/account", "/messages"],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
