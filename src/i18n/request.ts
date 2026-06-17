import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { LOCALES, DEFAULT_LOCALE, type Locale } from './config'

function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale)
}

async function detectLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get('NEXT_LOCALE')?.value
  if (isLocale(cookieLang)) return cookieLang

  const acceptLang = (await headers()).get('accept-language') ?? ''
  if (/\bde\b/i.test(acceptLang)) return 'de'

  return DEFAULT_LOCALE
}

export default getRequestConfig(async () => {
  const locale = await detectLocale()
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
