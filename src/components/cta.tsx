"use client";

import Link from "next/link";

export function CTA() {
  return (
    <div className="flex flex-wrap gap-3" id="start">
      <Link
        href="/messages/new"
        prefetch
        className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium
                   bg-[color:var(--fg)] text-[color:var(--bg)]
                   shadow-sm ring-1 ring-black/10
                   hover:opacity-95 hover:shadow-md
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]
                   active:opacity-90 motion-safe:active:scale-[0.98]
                   transition"
        aria-label="Создать послание"
        aria-describedby="cta-hint"
      >
        Создать послание
      </Link>
      <span id="cta-hint" className="sr-only">
        Откроется редактор нового послания
      </span>
    </div>
  );
}
