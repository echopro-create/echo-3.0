// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["100","300","400","500","700","900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://echoproject.space"),
  title: { default: "ECHO 3.0", template: "%s · ECHO 3.0" },
  description: "Next.js 15 + TS + Tailwind. Старт проверен.",
  manifest: "/site.webmanifest",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  themeColor: "#000000",
  robots: { index: true, follow: true },
  openGraph: {
    title: "ECHO 3.0",
    description: "Next.js 15 + TS + Tailwind. Старт проверен.",
    url: "https://echoproject.space",
    siteName: "ECHO 3.0",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${roboto.variable} font-sans`}>{children}</body>
    </html>
  );
}
