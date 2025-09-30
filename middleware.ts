import { NextResponse, NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Канонический www в проде
  const host = req.headers.get('host') || ''
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd && host === 'echoproject.space') {
    const url = new URL(req.url)
    url.host = 'www.echoproject.space'
    return NextResponse.redirect(url, 308)
  }

  const res = NextResponse.next()

  // Жёсткие заголовки безопасности
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'bluetooth=()',
    'xr-spatial-tracking=()',
  ].join(', '))

  // HSTS только по https и в проде
  if (isProd && req.nextUrl.protocol === 'https:') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // CSP: достаточно строгая, но не душит наш функционал
  // Разрешаем собственный домен, blob/data для скачиваний/превью и Supabase
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "media-src 'self' blob: https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
  res.headers.set('Content-Security-Policy', csp)

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
