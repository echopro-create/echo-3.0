"use client";

import { useEffect, useState } from "react";

/**
 * Простая шапочная тень при скролле.
 * Не перехватывает прокрутку, не лезет в разметку — просто рендерит
 * тонкую тень, когда страница прокручена вниз.
 */
export function ScrollShadow() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const handler = () => setOn(window.scrollY > 8);
    handler(); // первичная инициализация
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none absolute inset-x-0 bottom-[-1px] h-px transition",
        on ? "shadow-[0_8px_16px_rgba(14,20,32,0.06)]" : "shadow-none",
      ].join(" ")}
    />
  );
}
