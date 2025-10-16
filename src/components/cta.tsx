"use client";

import Link from "next/link";

export function CTA() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/messages/new"
        className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium
                   bg-[color:var(--fg)] text-[color:var(--bg)]
                   ring-1 ring-black/10
                   hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                   transition"
        aria-label="Создать послание"
      >
        Создать послание
      </Link>
    </div>
  );
}
