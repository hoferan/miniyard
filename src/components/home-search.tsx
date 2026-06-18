'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Module } from '@/lib/types'
import { ModuleCard } from './module-card'

interface HomeSearchProps {
  modules: Module[]
}

export function HomeSearch({ modules }: HomeSearchProps) {
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered =
    q === ''
      ? modules
      : modules.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.tags.some((tag) => tag.toLowerCase().includes(q)),
        )

  return (
    <>
      <div className="relative mx-auto mb-8 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools and games…"
          aria-label="Search modules"
          className="rounded-xl border-border bg-white/60 py-2.5 pl-9 pr-4 text-foreground backdrop-blur-sm focus-visible:ring-primary/40 dark:bg-white/[0.05]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            No results for &ldquo;{query}&rdquo;
          </p>
        ) : (
          filtered.map((module) => (
            <ModuleCard
              key={module.slug}
              module={module}
              order={modules.indexOf(module)}
            />
          ))
        )}
      </div>
    </>
  )
}
