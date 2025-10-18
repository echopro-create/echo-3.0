"use client";

import Link from "next/link";

export function CTA() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/messages/new"
        className={[
          // размеры и форма
          "inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-medium",
          // поверхность и контраст
          "bg-[color:var(--fg)] text-[color:var(--bg)] shadow-sm ring-1 ring-black/10",
          // интерактивные состояния
          "transition will-change-transform hover:opacity-95 hover:shadow-md active:translate-y-[1px]",
          // фокус
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]",
        ].join(" ")}
        aria-label="Создать послание"
      >
        <span className="mr-2 inline-flex">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 12h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M12 5v14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        Создать послание
      </Link>
    </div>
  );
}
