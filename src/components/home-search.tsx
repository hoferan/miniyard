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
      <div className="relative mx-auto mb-10 max-w-xl">
        <div className="flex items-center rounded-2xl border border-white/90 bg-white/70 shadow-[0_10px_26px_-14px_rgba(90,70,160,.45)] backdrop-blur-md transition-all focus-within:shadow-[0_10px_40px_-10px_rgba(124,108,255,.45)] dark:border-white/10 dark:bg-white/[0.04] dark:focus-within:shadow-[0_10px_40px_-10px_rgba(124,108,255,.3)]">
          <Search className="pointer-events-none ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search tools and games…"
            aria-label="Search modules"
            className="h-12 border-0 bg-transparent pl-3 pr-4 text-base shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              aria-label="Clear search"
              className="mr-2 h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
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
