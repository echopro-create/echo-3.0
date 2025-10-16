import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://echoproject.space";
  const now = new Date().toISOString();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    // Когда появятся страницы — добавим сюда /login, /account, /messages
  ];
}
