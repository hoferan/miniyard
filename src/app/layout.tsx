import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Nav } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const INTER_FONT = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'miniyard',
  description: 'A modular playground for useful tools, mini games, and API explorers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={INTER_FONT.className}>
        <Header />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
