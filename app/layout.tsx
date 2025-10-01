import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import TabBar from "../components/nav/TabBar";

export const metadata: Metadata = {
  title: "ECHO",
  description: "Послания, которые будут доставлены позже."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ру">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded focus:bg-black/90 focus:px-3 focus:py-1 focus:text-white">Перейти к содержанию</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <TabBar />
      </body>
    </html>
  );
}
