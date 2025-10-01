import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Какие роуты защищаем
const PROTECTED_PREFIXES = [
  "/messages",
  "/recipients",
  "/settings",
  "/activity",
];

// Разрешаем публичные
const PUBLIC_PATHS = new Set<string>([
  "/",
  "/login",
  "/onboarding",
  "/about",
  "/how",
  "/security",
  "/terms",
  "/privacy",
]);

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return false;
  return PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));
}

// Набор возможных имен куки, где может лежать токен
const ACCESS_COOKIE_CANDIDATES = [
  "sb-access-token",               // частый кейс
  "access-token",                  // запасной вариант
  "supabase-access-token",         // некоторые обёртки
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // публичная страница просмотра
  if (pathname.startsWith("/s/")) {
    return NextResponse.next();
  }

  // если путь не защищён — пропускаем
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // есть ли какой-то из access-куки
  const hasAccess = ACCESS_COOKIE_CANDIDATES.some(name => !!req.cookies.get(name)?.value);

  if (hasAccess) {
    return NextResponse.next();
  }

  // редиректим на /login с параметром next
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  const next = pathname + (search || "");
  url.search = `?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|robots.txt|sitemap.xml).*)"
  ],
};
