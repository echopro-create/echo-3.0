"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-[color:var(--bg)]/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-xl bg-[color:var(--fg)]/10 dark:bg-white/10" />
          <span className="text-sm font-medium tracking-wide">ECHO 3.0</span>
        </Link>

        <nav className="hidden gap-6 text-sm md:flex">
          <Link href="#formats" className="opacity-80 hover:opacity-100">Форматы</Link>
          <Link href="#delivery" className="opacity-80 hover:opacity-100">Доставка</Link>
          <Link href="#privacy" className="opacity-80 hover:opacity-100">Приватность</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="#start">Начать</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
