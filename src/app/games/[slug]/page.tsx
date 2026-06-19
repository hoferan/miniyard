import dynamic from 'next/dynamic'
import { getModuleBySlug } from '@/lib/registry'
import { ModuleBreadcrumb } from '@/components/module-breadcrumb'
import { ModuleSkeleton } from '@/components/module-skeleton'
import { notFound } from 'next/navigation'

const componentMap: Record<string, React.ComponentType> = {
  'memory-card': dynamic(() => import('@/modules/games/memory-card'), { loading: ModuleSkeleton }),
  'typing-speed-test': dynamic(() => import('@/modules/games/typing-speed-test'), { loading: ModuleSkeleton }),
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  const Component = componentMap[slug]
  if (!mod || !Component) return notFound()

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 pb-2 sm:px-6">
        <ModuleBreadcrumb label="Back to games" href="/games" />
        <h1 className="mt-5 text-[1.75rem] font-extrabold tracking-tight text-foreground">{mod.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
      </div>
      <Component />
    </>
  )
}
