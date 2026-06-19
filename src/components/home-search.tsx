'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Module } from '@/lib/types'
import { ModuleCard } from './module-card'

interface HomeSearchProps {
  modules: Module[]
}

export function HomeSearch({ modules }: HomeSearchProps) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      inputRef.current?.focus()
    }
  }, [])

  const handleChange = useCallback((value: string) => {
    setQuery(value)
    const url = new URL(window.location.href)
    if (value) {
      url.searchParams.set('q', value)
    } else {
      url.searchParams.delete('q')
    }
    window.history.replaceState(null, '', url.toString())
  }, [])

  const handleClear = () => handleChange('')

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
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search tools and games…"
          aria-label="Search modules"
          className="rounded-xl border-border bg-white/60 py-2.5 pl-9 pr-4 text-foreground backdrop-blur-sm focus-visible:ring-primary/40 dark:bg-white/[0.05]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <X className="mr-1.5 h-4 w-4" />
              Clear search
            </Button>
          </div>
        ) : (
          filtered.map((module) => <ModuleCard key={module.slug} module={module} />)
        )}
      </div>
    </>
  )
}
