import { getModuleBySlug } from '@/lib/registry'
import { ModuleBreadcrumb } from '@/components/module-breadcrumb'
import { notFound } from 'next/navigation'
import { UtilitiesModuleContent } from './module-content'

export default async function UtilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  if (!mod) return notFound()

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 pb-2 sm:px-6">
        <ModuleBreadcrumb label="Back to tools" href="/utilities" />
        <h1 className="mt-5 text-[1.75rem] font-extrabold tracking-tight text-foreground">{mod.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
      </div>
      <UtilitiesModuleContent slug={slug} />
    </>
  )
}
