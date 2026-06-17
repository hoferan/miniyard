import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Nav } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const INTER_FONT = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#0f766e',
}

export const metadata: Metadata = {
  title: {
    default: 'miniyard',
    template: '%s | miniyard',
  },
  description: 'A modular playground for useful tools, mini games, and API explorers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={INTER_FONT.className}>
        <ThemeProvider>
          <Header />
          <Nav />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
