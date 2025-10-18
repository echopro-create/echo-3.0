import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://echoproject.space";

  return {
    rules: [
      // ГЛОБАЛЬНАЯ ЗАГЛУШКА ДО РЕЛИЗА
      // Чтобы открыть сайт, просто заменим disallow: ["/"] на allow: ["/"] и удалим этот блок.
      {
        userAgent: "*",
        disallow: ["/"],
      },
      // Дублируем для популярных ботов, хотя звёздочка и так всё накрывает.
      { userAgent: "Googlebot", disallow: ["/"] },
      { userAgent: "bingbot", disallow: ["/"] }
    ],
    host: base,
    sitemap: `${base}/sitemap.xml`,
  };
}
