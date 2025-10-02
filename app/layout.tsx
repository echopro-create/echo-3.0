import "./globals.css";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import OnlineBadge from "@/components/OnlineBadge";

export const metadata: Metadata = {
  title: "ECHO — Послания, которые будут доставлены позже",
  description:
    "Запишите текст, голос или видео. Мы доставим адресатам позже, даже после вашей смерти.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://echoproject.space")
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Асинхронная фабрика: обязательно await
  const supabase = await createSupabaseServerClient();

  let user: { id: string; email?: string | null } | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) user = (data.user as any) ?? null;
  } catch {
    user = null;
  }

  return (
    <html lang="ru">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only">Пропустить к содержимому</a>

        <header className="border-b">
          <div className="container flex items-center justify-between py-3">
            <a href="/" className="font-semibold">ECHO</a>
            <nav className="hidden md:flex items-center gap-4">
              <a href="/messages">Послания</a>
              <a href="/recipients">Получатели</a>
              <a href="/settings">Настройки</a>
              <a href="/activity">Журнал</a>
            </nav>

            {user ? (
              <form action="/api/auth/signout" method="post">
                <button className="btn secondary" type="submit" title={user.email ?? "Аккаунт"}>
                  Выйти
                </button>
              </form>
            ) : (
              <a className="btn primary" href="/login">Войти</a>
            )}
          </div>
        </header>

        <main id="main" className="min-h-[70vh]">{children}</main>

        <footer className="border-t">
          <div className="container py-10 text-center text-sm">© 2025 ECHO</div>
        </footer>

        <div className="mobile-tabbar md:hidden">
          <ul>
            <li><a href="/messages">Послания</a></li>
            <li><a href="/messages/new">Создать</a></li>
            <li><a href="/recipients">Получатели</a></li>
            <li><a href="/settings">Настройки</a></li>
          </ul>
        </div>

        {/* Индикатор только для авторизованных */}
        {user ? <OnlineBadge /> : null}
      </body>
    </html>
  );
}
