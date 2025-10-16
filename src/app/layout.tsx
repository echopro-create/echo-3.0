import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Poppins, Manrope } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://echoproject.space"),
  title: "Echo — послания, которые приходят вовремя",
  description:
    "Текст, голос и видео. Доставим по дате, событию или вашему «пульсу». Шифрование на устройстве, ключи отдельно от данных.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Echo — послания, которые приходят вовремя",
    description:
      "Текст, голос и видео. Доставим по дате, событию или вашему «пульсу». Приватность по умолчанию.",
    url: "/",
    siteName: "Echo",
    type: "website",
    locale: "ru_RU",
    images: [
      { url: "/og/cover-1200x630.png", width: 1200, height: 630, alt: "Echo" },
      { url: "/og/cover-1200x1200.png", width: 1200, height: 1200, alt: "Echo" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Echo — послания, которые приходят вовремя",
    description:
      "Текст, голос и видео. Доставим по дате, событию или вашему «пульсу».",
    images: ["/og/cover-1200x630.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#0b0e14" }],
  },
  // вот тут меняем путь на твой файл
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${poppins.variable} ${manrope.variable}`}>
      <body className="bg-[var(--bg)] text-[var(--fg)] font-sans antialiased">
        <div className="min-h-dvh">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
