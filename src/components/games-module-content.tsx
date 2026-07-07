'use client'

import dynamic from 'next/dynamic'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap = {
  'memory-card': dynamic(() => import('@/modules/games/memory-card'), { loading: ModuleSkeleton, ssr: false }),
  'typing-speed-test': dynamic(() => import('@/modules/games/typing-speed-test'), { loading: ModuleSkeleton, ssr: false }),
  'reaction-time-test': dynamic(() => import('@/modules/games/reaction-time-test'), { loading: ModuleSkeleton, ssr: false }),
  'snake': dynamic(() => import('@/modules/games/snake'), { loading: ModuleSkeleton, ssr: false }),
  'colour-sequence-memory': dynamic(() => import('@/modules/games/colour-sequence-memory'), { loading: ModuleSkeleton, ssr: false }),
}

export function GamesModuleContent({ slug }: { slug: string }) {
  const Component = slug in componentMap ? componentMap[slug as keyof typeof componentMap] : null
  if (!Component) return <p className="py-12 text-center text-muted-foreground">Module not found.</p>
  return <Component />
}
