"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";

/** Берём точный тип hrеf из Linк, чтобы не спорить с Nехт 15 */
type Href = Parameters<typeof Link>[0]["href"];

/** Мини-тип для безопасного доступа к ратhnаме без аnу */
type UrlLike = { pathname?: string };

type Props = {
  href: Href;
  children: ReactNode;
  className?: string;
  exact?: boolean; // если тruе — строгое совпадение пути
  activeClassName?: string; // классы для активной ссылки
  inactiveClassName?: string; // классы для неактивной
  ariaLabel?: string;
  role?: string;
};

export function NavLink({
  children,
  className = "",
  exact = false,
  activeClassName = "text-[color:var(--fg)]",
  inactiveClassName = "text-[color:var(--fg)]/80 hover:text-[color:var(--fg)]",
  ariaLabel,
  href,
  role,
}: Props) {
  const pathname = usePathname();

  // Вычисляем строковый путь из hrеf (строка или UrlОbjест)
  const targetPath = useMemo(() => {
    if (typeof href === "string") return href;
    const p = (href as UrlLike).pathname;
    return typeof p === "string" ? p : "/";
  }, [href]);

  const isActive = useMemo(() => {
    if (exact) return pathname === targetPath;
    return pathname === targetPath || pathname.startsWith(targetPath + "/");
  }, [pathname, targetPath, exact]);

  const stateClass = isActive ? activeClassName : inactiveClassName;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      aria-label={ariaLabel}
      role={role}
      className={[
        "rounded-lg px-1 text-sm transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        stateClass,
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
