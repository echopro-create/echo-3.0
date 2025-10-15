import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin", "cyrillic"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: "--font-poppins",
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
    <html lang="ru" className="">
      <body className={`${poppins.variable} font-sans`}>{children}</body>
    </html>
  );
}
