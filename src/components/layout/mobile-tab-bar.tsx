'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Wrench, Gamepad2, Plug, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileTabBar() {
  const pathname = usePathname()
  const homeActive = pathname === '/'
  const toolsActive = pathname.startsWith('/utilities')
  const gamesActive = pathname === '/games' || pathname.startsWith('/games/')
  const apisActive = pathname === '/apis' || pathname.startsWith('/apis/')
  const labsActive = pathname === '/features'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex h-[70px] items-start border-t border-border bg-background/80 px-6 pt-3 backdrop-blur-xl md:hidden dark:bg-background/70">
      <Link
        href="/"
        aria-label="Home"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          homeActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Home</span>
      </Link>
      <Link
        href="/utilities"
        aria-label="Utilities"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          toolsActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <Wrench className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Utilities</span>
      </Link>
      <Link
        href="/games"
        aria-label="Games"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          gamesActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <Gamepad2 className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Games</span>
      </Link>
      <Link
        href="/apis"
        aria-label="APIs"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          apisActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <Plug className="h-5 w-5" />
        <span className="text-[10px] font-semibold">APIs</span>
      </Link>
      <Link
        href="/features"
        aria-label="Labs"
        className={cn(
          'flex flex-1 flex-col items-center gap-1 transition-colors',
          labsActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <FlaskConical className="h-5 w-5" />
        <span className="text-[10px] font-semibold">Labs</span>
      </Link>
    </div>
  )
}
