import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * ДО РЕЛИЗА: ставим жёсткий X-Robots-Tag на всё.
 * Чтобы ОТКРЫТЬ сайт позже — закомментируй установку заголовка ниже
 * или верни прежнюю выборочную логику.
 */

// Пути/паттерны, для которых middleware не делает ничего (статика и служебка)
const EXCLUDE: RegExp[] = [
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/(icon-192|icon-512|apple-touch-icon)\.png$/,
  /^\/safari-pinned-tab\.svg$/,
  /^\/site\.webmanifest$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/og\/.+$/, // OG-изображения
  // любые «тяжёлые»/статические расширения
  /\.[a-z0-9]{2,4}$/i, // .png .jpg .svg .css .js .map .json .txt .xml .mp4 ...
];

export function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  // если путь совпадает с любым исключением — пропускаем без заголовков
  if (EXCLUDE.some(rx => rx.test(pathname))) {
    return NextResponse.next();
  }

  // тотальный запрет индексации
  const res = NextResponse.next();
  res.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noimageindex, noarchive, nosnippet"
  );
  return res;
}

// Обрабатываем всё, чтобы не плодить список матчеров.
// Исключения выше перекроют статику.
export const config = {
  matcher: ["/:path*"],
};
