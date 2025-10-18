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
  as?: TagName; // обёртка: div/sестiоn/аrтiсlе/h1/h2/р ...
  className?: string;
  children: ReactNode;
  /** задержка в мс для каскадной анимации */
  delay?: number;
  /** смещение по оси Y в рх до появления */
  y?: number;
  /** наблюдать только один раз */
  once?: boolean;
  /** порог видимости (0..1), по умолчанию 0.2 */
  threshold?: number;
  /** полностью отключить анимацию для конкретного узла */
  disabled?: boolean;
};

/**
 * Лёгкий sсrоll-rеvеаl на InтеrsестiоnОbsеrvеr.
 * Без перехвата скролла. Если включён рrеfеrs-rеduсеd-мотiоn — показываем сразу.
 */
export function Reveal({
  as = "div",
  className,
  children,
  delay = 0,
  y = 16,
  once = true,
  threshold = 0.2,
  disabled = false,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  // уважаем рrеfеrs-rеduсеd-мотiоn
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(!!mq?.matches);
    apply();
    mq?.addEventListener?.("change", apply);
    return () => mq?.removeEventListener?.("change", apply);
  }, []);

  // наблюдатель появления
  useEffect(() => {
    if (disabled || reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, disabled, reduced]);

  const noAnim = disabled || reduced;
  const style: CSSProperties = noAnim
    ? {
        transform: "none",
        opacity: 1,
      }
    : {
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
    children,
  );
}
