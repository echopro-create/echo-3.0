import Link from "next/link";
import { isAuthenticated } from "../../lib/auth.server";

export default async function Header() {
  const authed = await isAuthenticated();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-black/10">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">ECHO</Link>

        <nav className="hidden md:flex items-center gap-3 text-sm">
          <Link href="/messages" className="hover:underline">Послания</Link>
          <Link href="/recipients" className="hover:underline">Получатели</Link>
          <Link href="/settings" className="hover:underline">Настройки</Link>
          <Link href="/activity" className="hover:underline">Журнал</Link>
        </nav>

        {/* Индикатор статуса справа */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              authed ? "bg-green-500" : "bg-gray-300"
            } shadow`}
            title={authed ? "Вы вошли" : "Гость"}
            aria-label={authed ? "Статус: авторизован" : "Статус: гость"}
          />
        </div>
      </div>
    </header>
  );
}
