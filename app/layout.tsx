// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.echoproject.space"),
  title: "ECHO — послания, которые будут доставлены позже",
  description:
    "Запишите текст, голос или видео. Мы доставим их адресатам в нужный день, даже после вашей смерти.",
  alternates: {
    canonical: "https://www.echoproject.space/",
    languages: {
      ru: "https://www.echoproject.space/",
      // en: "https://www.echoproject.space/en/",
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.echoproject.space/",
    siteName: "ECHO",
    title: "ECHO — послания, которые будут доставлены позже",
    description:
      "Запишите текст, голос или видео. Мы доставим их адресатам в нужный день, даже после вашей смерти.",
    images: [{ url: "/og-cover.jpg", width: 1200, height: 630, alt: "ECHO" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ECHO — послания, которые будут доставлены позже",
    description:
      "Запишите текст, голос или видео. Мы доставим их адресатам в нужный день, даже после вашей смерти.",
    images: ["/og-cover.jpg"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/* Preload variable font to stabilize LCP */}
        <link
          rel="preload"
          href="/fonts/RobotoFlex-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Global landing stylesheet */}
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
