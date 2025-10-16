"use client";

import Link from "next/link";

export function CTA() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/login"
        className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium
                   bg-[color:var(--fg)] text-[color:var(--bg)]
                   hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Создать послание
      </Link>

      <Link
        href="/#delivery"
        className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium
                   ring-1 ring-[color:var(--fg)]/20 hover:bg-[color:var(--fg)]/5
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Как это работает
      </Link>
    </div>
  );
}
