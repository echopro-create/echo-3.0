"use client";

import { createElement, useEffect, useRef, useState } from "react";

type Props = {
  as?: keyof JSX.IntrinsicElements; // обёртка: div/section/article и т.д.
  className?: string;
  children: React.ReactNode;
  /** задержка в мс для каскадной анимации */
  delay?: number;
  /** смещение по оси Y в px до появления */
  y?: number;
  /** наблюдать только один раз */
  once?: boolean;
  /** порог видимости (0..1), по умолчанию 0.2 */
  threshold?: number;
};

/**
 * Лёгкий scroll-reveal без внешних библиотек.
 * Никаких «хайджаков» скролла: просто IntersectionObserver,
 * мягкая трансформация и прозрачность. Идеально для белого лендинга.
 */
export function Reveal({
  as = "div",
  className,
  children,
  delay = 0,
  y = 16,
  once = true,
  threshold = 0.2,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return createElement(
    as,
    {
      ref: (node: HTMLElement) => {
        // @ts-expect-error: HTMLElement narrow
        ref.current = node;
      },
      className,
      style: {
        transform: visible ? "translateY(0px)" : `translateY(${y}px)`,
        opacity: visible ? 1 : 0,
        transitionProperty: "transform, opacity",
        transitionDuration: "600ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
        willChange: "transform, opacity",
      } as React.CSSProperties,
    },
    children
  );
}
