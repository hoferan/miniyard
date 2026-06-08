import { getModuleBySlug } from '@/lib/registry'
import { ModuleBreadcrumb } from '@/components/module-breadcrumb'
import UnitConverter from '@/modules/utilities/unit-converter'
import Base64Converter from '@/modules/utilities/base64-converter'
import { notFound } from 'next/navigation'

const componentMap: Record<string, React.ComponentType> = {
  'unit-converter': UnitConverter,
  'base64-converter': Base64Converter,
}

export default async function UtilityPage({ params }: { params: Promise<{ slug: string }> }) {
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
