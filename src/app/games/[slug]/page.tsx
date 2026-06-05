import { getModuleBySlug } from '@/lib/registry'
import { notFound } from 'next/navigation'

const componentMap: Record<string, React.ComponentType> = {
  // Add game components here as they are created
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  const Component = componentMap[slug]
  if (!mod || !Component) return notFound()
  return <Component />
}
