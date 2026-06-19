'use client'

import dynamic from 'next/dynamic'
import { ModuleSkeleton } from '@/components/module-skeleton'

const componentMap = {
  'unit-converter': dynamic(() => import('@/modules/utilities/unit-converter'), { loading: ModuleSkeleton, ssr: false }),
  'base64-converter': dynamic(() => import('@/modules/utilities/base64-converter'), { loading: ModuleSkeleton, ssr: false }),
}

export function UtilitiesModuleContent({ slug }: { slug: string }) {
  const Component = componentMap[slug as keyof typeof componentMap]
  if (!Component) return null
  return <Component />
}
