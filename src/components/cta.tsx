"use client";

import Link from "next/link";

export function CTA() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/login"
        className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium
                   bg-[color:var(--fg)] text-[color:var(--bg)]
                   ring-1 ring-[color:var(--fg)]/10 dark:ring-[color:var(--fg)]/25
                   hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                   transition"
        aria-label="Создать послание (вход)"
      >
        Создать послание
      </Link>

      <Link
        href="/#delivery"
        className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium
                   ring-1 ring-[color:var(--fg)]/20 dark:ring-[color:var(--fg)]/30
                   hover:bg-[color:var(--fg)]/5
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                   transition"
        aria-label="Узнать, как работает доставка посланий"
      >
        Как это работает
      </Link>
    </div>
  );
}
