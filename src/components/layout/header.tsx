'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const NAV_LINKS = [
    { href: '/utilities', label: 'Utilities' },
    { href: '/games', label: 'Games' },
    { href: '/features', label: 'Labs' },
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

        {mounted && (
          <Button
            variant="ghost"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-bold text-muted-foreground backdrop-blur-sm hover:bg-transparent hover:text-foreground dark:bg-white/[0.06]"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
            <span>{resolvedTheme === 'dark' ? 'Light' : 'Dark'}</span>
          </Button>
        )}
      </div>
    </header>
  )
}
