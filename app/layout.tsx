import "./globals.css";
import "@/styles/styles.css";
import Link from "next/link";
import AuthStatus from "./components/AuthStatus";

export const metadata = {
  title: "ECHO — послания, которые будут доставлены позже",
  description:
    "Запишите текст, голос или видео. Мы доставим их тем, кому они предназначены — даже после вашей смерти.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <a href="#main" className="sr-only">Пропустить к основному содержимому</a>

        <header className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" aria-label="Главная — ECHO">ECHO</Link>

          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* Индикатор авторизации: если не вошёл — покажет «Войти», если вошёл — e-mail с зелёной точкой */}
            {/* Кнопка «Создать» остаётся доступной по дизайну */}
            <AuthStatus />
            <Link href="/messages/new" className="btn" aria-label="Создать послание">Создать</Link>
          </nav>
        </header>

        <main id="main">{children}</main>

        <footer className="wrap" style={{ textAlign: "center", paddingTop: 24, paddingBottom: 24 }}>
          © 2025 ECHO
        </footer>
      </body>
    </html>
  );
}
