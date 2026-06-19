'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { FEATURES } from '@/lib/features'

type FlagsState = Record<string, boolean>

type FeaturesContextValue = {
  flags: FlagsState
  setFlag: (id: string, enabled: boolean) => void
}

const FeaturesContext = createContext<FeaturesContextValue | null>(null)

const STORAGE_KEY = 'miniyard-features'

function defaultFlags(): FlagsState {
  return Object.fromEntries(FEATURES.map((f) => [f.id, f.defaultEnabled]))
}

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FlagsState>(defaultFlags)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setFlags((prev) => ({ ...prev, ...(JSON.parse(raw) as FlagsState) }))
    } catch {
      // ignore malformed storage
    }
  }, [])

  function setFlag(id: string, enabled: boolean) {
    setFlags((prev) => {
      const next = { ...prev, [id]: enabled }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return <FeaturesContext.Provider value={{ flags, setFlag }}>{children}</FeaturesContext.Provider>
}

export function useFeatures() {
  const ctx = useContext(FeaturesContext)
  if (!ctx) throw new Error('useFeatures must be used inside FeaturesProvider')
  return ctx
}

export function useFeatureFlag(id: string): boolean {
  const { flags } = useFeatures()
  return flags[id] ?? false
}
