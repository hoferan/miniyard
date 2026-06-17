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
      <div className="mx-auto max-w-lg px-4 pt-6 pb-2 sm:px-6">
        <ModuleBreadcrumb title={mod.title} category={mod.category} />
        <div className="mt-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-primary/15 bg-primary/10 text-2xl">
            {mod.icon}
          </span>
          <h1 className="text-[1.75rem] font-extrabold tracking-tight text-foreground">
            {mod.title}
          </h1>
        </div>
        <p className="mt-1 pl-[56px] text-sm text-muted-foreground">{mod.description}</p>
      </div>
      <Component />
    </>
  )
}
