import Link from "next/link";
export default function Header() {
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
      </div>
    </header>
  );
}
