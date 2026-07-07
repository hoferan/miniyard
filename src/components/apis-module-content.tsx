'use client'

import type { ComponentType } from 'react'

const componentMap: Record<string, ComponentType> = {
  // Add entries here as apis modules are created, e.g.:
  // 'weather-lookup': dynamic(() => import('@/modules/apis/weather-lookup'), { loading: ModuleSkeleton, ssr: false }),
}

export function ApisModuleContent({ slug }: { slug: string }) {
  const Component = slug in componentMap ? componentMap[slug as keyof typeof componentMap] : null
  if (!Component) return <p className="py-12 text-center text-muted-foreground">Module not found.</p>
  return <Component />
}
