// middleware.ts — клади в корень репозитория (рядом с package.json)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const host = (req.headers.get('host') || url.host).toLowerCase()

  // 1) Пропускаем локалку и превью-домены Vercel (чтобы не ломать предпросмотры)
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1')
  const isVercelPreview = host.endsWith('.vercel.app')
  if (isLocalhost || isVercelPreview) return NextResponse.next()

  // 2) Канонический прод-домен
  const canonicalHost = 'www.echoproject.space'

  // Если пришли на голый домен — мягко перекидываем на www
  if (host === 'echoproject.space') {
    url.host = canonicalHost
    url.protocol = 'https:'
    return NextResponse.redirect(url, 308)
  }

  // Если уже на каноническом — ничего не делаем
  return NextResponse.next()
}

// Применяем ко всем путям, кроме статики и служебных
export const config = {
  matcher: [
    '/((?!_next|static|.*\\.(?:png|jpg|jpeg|svg|ico|webp|avif|gif|txt|xml|json)).*)',
  ],
}
