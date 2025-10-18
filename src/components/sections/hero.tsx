"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { CTA } from "@/components/cta";

/** Дополняем СSSРrореrтiеs нашими кастомными переменными */
type HeroVars = CSSProperties & {
  ["--hero-weight"]?: number | string;
  ["--hero-shift"]?: string;
};

/**
 * НЕRО v3
 * - Уаriаblе fоnт ощущения: аккуратная игра толщиной заголовка через СSS-переменные.
 * - Sсrоll мотiоn без зависимостей: минимальный раrаllах для фона.
 * - Уважает рrеfеrs-rеduсеd-мотiоn.
 * - Адаптив, доступность.
 */
export function HeroSection() {
  const wrapRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let raf = 0;
    const onScroll = () => {
      const y = window.scrollY || 0;
      const damp = Math.min(1, y / 800);
      root.style.setProperty("--hero-shift", `${(damp * 8).toFixed(2)}px`);
      const w = 520 + Math.round(Math.min(80, (y / 600) * 80));
      root.style.setProperty("--hero-weight", String(w));
    };
    const loop = () => {
      onScroll();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={wrapRef}
      className="relative w-full py-20 md:py-28"
      aria-labelledby="hero-title"
      role="region"
      style={{ "--hero-weight": 560, "--hero-shift": "0px" } as HeroVars}
    >
      {/* Фон: спокойные эллипсы с легким параллаксом */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute -top-24 -left-28 h-80 w-80 rounded-full bg-[color:var(--fg)]/[0.06] blur-3xl will-change-transform"
          style={{ transform: "translate3d(0,var(--hero-shift),0)" }}
        />
        <div
          className="absolute -bottom-24 -right-28 h-96 w-96 rounded-full bg-[color:var(--fg)]/[0.05] blur-3xl will-change-transform"
          style={{ transform: "translate3d(0,calc(var(--hero-shift) * -1),0)" }}
        />
        {/* Тонкое «орбита»-кольцо */}
        <div
          className="absolute left-1/2 top-1/2 h-[52vmin] w-[52vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80"
          style={{
            background:
              "radial-gradient(closest-side, rgba(0,0,0,0.08), transparent 70%)",
            mask: "radial-gradient(circle, transparent 62%, black 64%, black 66%, transparent 68%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-3xl text-left md:text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs text-[color:var(--fg)]/70 md:mx-auto">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--fg)]/70" />
          Приватность по умолчанию · Доставка по событию и времени
        </div>

        <h1
          id="hero-title"
          className="mt-5 text-[color:var(--fg)] tracking-tight leading-[1.05]"
          style={{
            fontVariationSettings: `"wght" var(--hero-weight)`,
            fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
          }}
        >
          Послания, которые будут доставлены&nbsp;после нас.
        </h1>

        <p
          className="mt-6 mx-auto max-w-prose text-base leading-relaxed text-[color:var(--muted)] md:text-lg"
          aria-describedby="hero-title"
        >
          Echo хранит ваш текст, голос, видео и файлы и доставляет их по дате,
          событию или «после моей смерти». Мы шифруем, бережно храним и
          отправляем вовремя.
        </p>

        <div className="mt-10 flex justify-center">
          <CTA />
        </div>

        <div className="mt-6 text-center text-xs text-[color:var(--muted)]">
          Без рекламы · Без трекинга · Можно удалить всё одним щелчком
        </div>
      </div>
    </section>
  );
}
