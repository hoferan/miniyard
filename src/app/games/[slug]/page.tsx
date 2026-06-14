import { getModuleBySlug } from '@/lib/registry'
import { ModuleBreadcrumb } from '@/components/module-breadcrumb'
import { notFound } from 'next/navigation'
import MemoryCard from '@/modules/games/memory-card'

const componentMap: Record<string, React.ComponentType> = {
  'memory-card': MemoryCard,
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  const Component = componentMap[slug]
  if (!mod || !Component) return notFound()
  return (
    <>
      <ModuleBreadcrumb title={mod.title} category={mod.category} />
      <Component />
    </>
  )
}
