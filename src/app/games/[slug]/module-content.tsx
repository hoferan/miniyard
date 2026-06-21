'use client'

import dynamic from 'next/dynamic'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap = {
  'memory-card': dynamic(() => import('@/modules/games/memory-card'), { loading: ModuleSkeleton, ssr: false }),
  'typing-speed-test': dynamic(() => import('@/modules/games/typing-speed-test'), { loading: ModuleSkeleton, ssr: false }),
  'reaction-time-test': dynamic(() => import('@/modules/games/reaction-time-test'), { loading: ModuleSkeleton, ssr: false }),
}

export function GamesModuleContent({ slug }: { slug: string }) {
  const Component = componentMap[slug as keyof typeof componentMap]
  if (!Component) return null
  return <Component />
}
