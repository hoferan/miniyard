'use client'

import Link from 'next/link'
import { Module } from '@/lib/types'
import { ICON_MAP } from '@/lib/icons'
import { cn, isNew } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Box } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Props = { module: Module }

export function ModuleCard({ module }: Props) {
  const categoryLabel = module.category === 'utilities' ? 'UTILITY' : 'GAME'
  const Icon: LucideIcon = (module.icon ? ICON_MAP[module.icon] : undefined) ?? Box

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

        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 dark:bg-primary/15">
          <Icon className="h-5 w-5" />
        </div>

        <div className="mb-1 font-mono text-[10px] tracking-[0.16em] text-primary">
          {categoryLabel}
        </div>

        <div className="mb-1.5 text-[18px] font-bold text-foreground">{module.title}</div>

        <p className="text-[13.5px] leading-[1.5] text-muted-foreground">{module.description}</p>
      </div>
    </Link>
  )
}
