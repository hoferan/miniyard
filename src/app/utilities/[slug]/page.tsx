import { getModuleBySlug } from '@/lib/registry'
import UnitConverter from '@/modules/utilities/unit-converter'
import { notFound } from 'next/navigation'

const componentMap: Record<string, React.ComponentType> = {
  'unit-converter': UnitConverter,
}

export default async function UtilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  const Component = componentMap[slug]
  if (!mod || !Component) return notFound()
  return <Component />
}
