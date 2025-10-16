import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://echoproject.space";
  const now = new Date().toISOString();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/account`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/messages`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/messages/new`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];
}
