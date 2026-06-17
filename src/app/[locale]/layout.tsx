import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/layout/header'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'
import { SwRegister } from '@/components/sw-register'
import { ThemeProvider } from '@/components/theme-provider'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 -top-56 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl animate-blob dark:bg-primary/30" />
            <div className="absolute -bottom-16 -right-28 h-[340px] w-[340px] rounded-full bg-blue-400/15 blur-3xl animate-blob-2 dark:bg-blue-400/20" />
          </div>
          <Header />
          <div className="pb-20 md:pb-0">{children}</div>
          <MobileTabBar />
          <SwRegister />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
