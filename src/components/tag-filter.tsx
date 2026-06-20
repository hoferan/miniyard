'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
            <Button
              key={tag}
              type="button"
              variant={activeTag === tag ? 'default' : 'outline'}
              onClick={() => selectTag(tag)}
              className={cn(
                'h-auto rounded-md px-2.5 py-0.5 text-xs font-semibold select-none',
                activeTag !== tag && 'hover:bg-secondary hover:text-secondary-foreground',
              )}
            >
              {tag}
            </Button>
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
          No modules match the &ldquo;{activeTag ?? ''}&rdquo; tag.
        </p>
      )}
    </div>
  )
}
