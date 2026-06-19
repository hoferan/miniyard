'use client'

import Link from 'next/link'
import { Module } from '@/lib/types'
import { cn, isNew } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type Props = { module: Module }

export function ModuleCard({ module }: Props) {
  const categoryLabel = module.category === 'utilities' ? 'UTILITY' : 'GAME'

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
        {isNew(module.createdAt) && (
          <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground">NEW</Badge>
        )}

        <div className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-primary">
          {categoryLabel}
        </div>

        <div className="mb-1.5 text-[18px] font-bold text-foreground">{module.title}</div>

        <p className="text-[13.5px] leading-[1.5] text-muted-foreground">{module.description}</p>
      </div>
    </Link>
  )
}
