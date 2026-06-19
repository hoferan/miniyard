import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'
import { SwRegister } from '@/components/sw-register'
import { ThemeProvider } from '@/components/theme-provider'
import { FeaturesProvider } from '@/components/features-provider'
import { Toaster } from '@/components/ui/sonner'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${JAKARTA.variable} ${MONO.variable} font-sans`}>
        <ThemeProvider>
          <FeaturesProvider>
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
            <Toaster />
          </FeaturesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
