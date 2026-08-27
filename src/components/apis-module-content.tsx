'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap: Record<string, ComponentType> = {
  'currency-converter': dynamic(() => import('@/modules/apis/currency-converter'), {
    loading: ModuleSkeleton,
    ssr: false,
  }),
  'random-joke': dynamic(() => import('@/modules/apis/random-joke'), {
    loading: ModuleSkeleton,
    ssr: false,
  }),
}

export function ApisModuleContent({ slug }: { slug: string }) {
  const Component = slug in componentMap ? componentMap[slug as keyof typeof componentMap] : null
  if (!Component) return <p className="py-12 text-center text-muted-foreground">Module not found.</p>
  return <Component />
}
