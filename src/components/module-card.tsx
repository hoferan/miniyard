'use client'

import Link from 'next/link'
import { Module } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = { module: Module; order?: number }

export function ModuleCard({ module, order }: Props) {
  const categoryLabel = module.category === 'utilities' ? 'UTILITY' : 'GAME'

  const statusLabel =
    module.status === 'stable'
      ? 'stable'
      : module.status === 'beta'
        ? 'beta'
        : 'coming soon'

  return (
    <Link href={`/${module.category}/${module.slug}`}>
      <div
        className={cn(
          'group relative cursor-pointer rounded-[22px] p-6',
          'border border-white/90 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]',
          'shadow-[0_10px_26px_-14px_rgba(90,70,160,.45)] dark:shadow-[0_18px_40px_-20px_rgba(0,0,0,.6)]',
          'transition-all duration-300',
          'hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_26px_52px_-22px_rgba(124,108,255,.5)]',
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[15px] border border-primary/15 bg-primary/10 text-[26px]">
            {module.icon}
          </div>
          {order !== undefined && (
            <span className="font-mono text-xs text-muted-foreground/60">
              {String(order + 1).padStart(2, '0')}
            </span>
          )}
        </div>

        <div className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-primary">
          {categoryLabel}
        </div>

        <div className="mb-1.5 text-[18px] font-bold text-foreground">{module.title}</div>

        <p className="mb-4 text-[13.5px] leading-[1.5] text-muted-foreground">
          {module.description}
        </p>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          {statusLabel}
        </div>
      </div>
    </Link>
  )
}
