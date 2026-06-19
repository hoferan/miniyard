'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function MobileTabBar() {
  const pathname = usePathname()
  const toolsActive = pathname.startsWith('/utilities')
  const gamesActive = pathname === '/games' || pathname.startsWith('/games/')
  const labsActive = pathname === '/features'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex h-[70px] items-start border-t border-border bg-background/80 px-6 pt-3 backdrop-blur-xl md:hidden dark:bg-background/70">
      <Link
        href="/utilities"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          toolsActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <span className="text-xl">🧰</span>
        <span className="text-[10px] font-semibold">Tools</span>
      </Link>
      <Link
        href="/games"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          gamesActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <span className="text-xl">🎮</span>
        <span className="text-[10px] font-semibold">Games</span>
      </Link>
      <Link
        href="/features"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          labsActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <span className="text-xl">🧪</span>
        <span className="text-[10px] font-semibold">Labs</span>
      </Link>
    </div>
  )
}
