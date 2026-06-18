import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import { LOCALES } from './i18n/config'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang')
  if (lang && LOCALES.includes(lang as (typeof LOCALES)[number])) {
    const url = request.nextUrl.clone()
    url.searchParams.delete('lang')
    const response = NextResponse.redirect(url)
    response.cookies.set('NEXT_LOCALE', lang, { path: '/', sameSite: 'lax' })
    return response
  }
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|icon|apple-icon|.*\\..*).*)', '/'],
}
