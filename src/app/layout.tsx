import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import './globals.css'

const JAKARTA = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
})

const MONO = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const viewport: Viewport = {
  themeColor: '#7c6cff',
}

export const metadata: Metadata = {
  title: {
    default: 'miniyard',
    template: '%s | miniyard',
  },
  description: 'A modular playground for useful tools and mini games.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'miniyard',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${JAKARTA.variable} ${MONO.variable} font-sans`}>{children}</body>
    </html>
  )
}
