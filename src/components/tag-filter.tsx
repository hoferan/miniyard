'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ModuleCard } from '@/components/module-card'
import { useFeatureFlag } from '@/components/features-provider'
import type { Module } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  modules: Module[]
  emptyState?: React.ReactNode
}

export function TagFilter({ modules, emptyState }: Props) {
  const tagFilterEnabled = useFeatureFlag('tag-filter')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTag = tagFilterEnabled ? searchParams.get('tag') : null

  const allTags = Array.from(new Set(modules.flatMap((m) => m.tags))).sort()
  const filtered =
    tagFilterEnabled && activeTag ? modules.filter((m) => m.tags.includes(activeTag)) : modules

  function selectTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeTag === tag) {
      params.delete('tag')
    } else {
      params.set('tag', tag)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  if (modules.length === 0) {
    return <>{emptyState}</>
  }

  return (
    <div>
      {tagFilterEnabled && allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => selectTag(tag)}
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Badge
                variant={activeTag === tag ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer select-none',
                  activeTag !== tag && 'hover:bg-secondary',
                )}
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No modules match the &ldquo;{activeTag}&rdquo; tag.
        </p>
      )}
    </div>
  )
}
