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
      <span className="font-semibold text-lg">miniyard 🧰</span>
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
