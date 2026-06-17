'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground text-sm font-bold">
          m
        </span>
        <span className="font-bold text-lg tracking-tight">miniyard</span>
      </div>
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-md hover:bg-accent transition-colors w-10 h-10 flex items-center justify-center"
        aria-label="Toggle theme"
      >
        {mounted && (resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
      </button>
    </header>
  )
}
