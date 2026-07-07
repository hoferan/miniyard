import { getModuleBySlug, getModulesByCategory } from '@/lib/registry'
import { notFound } from 'next/navigation'
import { UtilitiesModuleContent } from '@/components/utilities-module-content'
import { ModulePageLayout } from '@/components/module-page-layout'
import type { Metadata } from 'next'

export const dynamicParams = false

export function generateStaticParams() {
  return getModulesByCategory('utilities').map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  if (!mod) return {}
  return { title: mod.title, description: mod.description }
}

export default async function UtilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  if (!mod) return notFound()

  return (
    <ModulePageLayout mod={mod}>
      <UtilitiesModuleContent slug={slug} />
    </ModulePageLayout>
  )
}
