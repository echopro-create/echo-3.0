"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";

/** Разрешённые теги-обёртки — хватает для лендинга */
type TagName =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "main"
  | "h1"
  | "h2"
  | "p";

type Props = {
  as?: TagName;            // обёртка: div/section/article/h1/h2/p ...
  className?: string;
  children: ReactNode;
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
 * Лёгкий scroll-reveal на IntersectionObserver.
 * Никаких перехватов скролла. Мягкая трансформация и прозрачность.
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
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  const style: CSSProperties = {
    transform: visible ? "translateY(0px)" : `translateY(${y}px)`,
    opacity: visible ? 1 : 0,
    transitionProperty: "transform, opacity",
    transitionDuration: "600ms",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: `${delay}ms`,
    willChange: "transform, opacity",
  };

  return createElement(
    as,
    {
      ref: (node: Element | null) => {
        ref.current = node as HTMLElement | null;
      },
      className,
      style,
    },
    children
  );
}
