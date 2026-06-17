import { getTranslations, getMessages } from 'next-intl/server'
import { getModuleBySlug } from '@/lib/registry'
import { ModuleBreadcrumb } from '@/components/module-breadcrumb'
import { notFound } from 'next/navigation'
import MemoryCard from '@/modules/games/memory-card'

const componentMap: Record<string, React.ComponentType> = {
  'memory-card': MemoryCard,
}

type ModuleMessages = Record<string, { title?: string; description?: string }>

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = getModuleBySlug(slug)
  const Component = componentMap[slug]
  if (!mod || !Component) return notFound()

  const t = await getTranslations('breadcrumb')
  const messages = await getMessages()
  const moduleMessages = (messages.modules as ModuleMessages | undefined) ?? {}
  const title = moduleMessages[slug]?.title ?? mod.title
  const description = moduleMessages[slug]?.description ?? mod.description

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 pb-2 sm:px-6">
        <ModuleBreadcrumb label={t('backToGames')} href="/games" />
        <div className="mt-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-primary/15 bg-primary/10 text-2xl">
            {mod.icon}
          </span>
          <h1 className="text-[1.75rem] font-extrabold tracking-tight text-foreground">{title}</h1>
        </div>
        <p className="mt-1 pl-[56px] text-sm text-muted-foreground">{description}</p>
      </div>
      <Component />
    </>
  )
}
