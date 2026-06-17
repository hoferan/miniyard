'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { LOCALES } from '@/i18n/config'

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('nav')
  const locale = useLocale()

  useEffect(() => setMounted(true), [])

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  function switchLocale(next: string) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }

  const NAV_LINKS = [
    { href: '/utilities', label: t('tools') },
    { href: '/games', label: t('games') },
  ]

  return (
    <header className="relative z-10 mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Link
        href="/"
        className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-foreground"
      >
        <span className="flex h-8 w-8 animate-bob items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-400 to-primary text-base shadow-[0_6px_16px_-6px_rgba(124,108,255,.8)]">
          🧰
        </span>
        miniyard
      </Link>

      <div className="flex items-center gap-2">
        <nav className="mr-2 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                isActive(link.href)
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Language switcher */}
        <div className="flex items-center rounded-full border border-border bg-background/60 p-0.5 font-mono text-xs font-bold backdrop-blur-sm dark:bg-white/[0.06]">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              aria-pressed={locale === l}
              className={cn(
                'rounded-full px-2.5 py-1 uppercase transition-colors',
                locale === l
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-bold text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground dark:bg-white/[0.06]"
            aria-label={t('toggleTheme')}
          >
            <span className="text-base">{resolvedTheme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{resolvedTheme === 'dark' ? t('light') : t('dark')}</span>
          </button>
        )}
      </div>
    </header>
  )
}
