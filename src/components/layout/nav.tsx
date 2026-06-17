'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/utilities', label: 'Utilities' },
  { href: '/games', label: 'Games' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-4 px-4 py-2 border-b text-sm">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'transition-colors',
              isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
