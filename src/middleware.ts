import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Пути, которые точно не должны попадать в поисковики
const NOINDEX = [
  "/login",
  "/account",
  "/messages",
  "/api",
];

export function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // если запрошен один из защищаемых маршрутов — ставим заголовок
  const shouldNoindex = NOINDEX.some(prefix => url.pathname === prefix || url.pathname.startsWith(prefix + "/"));

  if (shouldNoindex) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  return NextResponse.next();
}

// Срабатываем только там, где надо, без лишних тормозов
export const config = {
  matcher: ["/login", "/account", "/messages/:path*", "/api/:path*"],
};
