'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/messages", label:"Послания" },
  { href: "/messages/new", label:"Создать" },
  { href: "/recipients", label:"Получатели" },
  { href: "/settings", label:"Настройки" },
];

export default function TabBar(){
  const path = usePathname();
  return (
    <nav className="tabbar">
      <div className="tabbar-inner">
        {items.map(it => (
          <Link key={it.href} href={it.href} className="tab">
            <span className={path?.startsWith(it.href) ? "font-semibold" : ""}>{it.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
