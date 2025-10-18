"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";

type Props = LinkProps & {
  children: ReactNode;
  className?: string;
  exact?: boolean;                // если true — строгое совпадение пути
  activeClassName?: string;       // классы для активной ссылки
  inactiveClassName?: string;     // классы для неактивной
  ariaLabel?: string;
};

export function NavLink({
  children,
  className = "",
  exact = false,
  activeClassName = "text-[color:var(--fg)]",
  inactiveClassName = "text-[color:var(--fg)]/80 hover:text-[color:var(--fg)]",
  ariaLabel,
  href,
  ...rest
}: Props) {
  const pathname = usePathname();

  const isActive = useMemo(() => {
    const target =
      typeof href === "string"
        ? href
        : (href?.pathname as string) || "/";

    if (exact) return pathname === target;
    return pathname === target || pathname.startsWith(target + "/");
  }, [pathname, href, exact]);

  const stateClass = isActive ? activeClassName : inactiveClassName;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      aria-label={ariaLabel}
      className={[
        "rounded-lg px-1 text-sm transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        stateClass,
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </Link>
  );
}
