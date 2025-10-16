import type { Metadata } from "next";
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
  title: "Echo — сообщения, которые приходят вовремя",
  description:
    "Текст, голос и видео, доставленные по дате, событию или «пульсу». Приватно и предсказуемо.",
  metadataBase: new URL("https://echoproject.space"),
  openGraph: {
    title: "Echo 3.0",
    description: "Послания, которые приходят вовремя.",
    url: "https://echoproject.space",
    siteName: "Echo",
    type: "website",
  },
  robots: { index: true, follow: true },
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
