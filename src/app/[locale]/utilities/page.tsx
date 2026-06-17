import { getTranslations, getMessages } from 'next-intl/server'
import { registry, getModulesByCategory } from '@/lib/registry'
import { ModuleCard } from '@/components/module-card'
import type { Module } from '@/lib/types'

type ModuleMessages = Record<string, { title?: string; description?: string }>

export default async function UtilitiesPage() {
  const t = await getTranslations('utilities')
  const messages = await getMessages()
  const moduleMessages = (messages.modules as ModuleMessages | undefined) ?? {}

  const orderBySlug = Object.fromEntries(registry.map((m, i) => [m.slug, i]))
  const modules = getModulesByCategory('utilities')
  const localizedModules: Module[] = modules.map((m) => ({
    ...m,
    title: moduleMessages[m.slug]?.title ?? m.title,
    description: moduleMessages[m.slug]?.description ?? m.description,
  }))

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <h1 className="mb-1.5 text-3xl font-extrabold tracking-tight">{t('title')}</h1>
      <p className="mb-8 text-muted-foreground">{t('subtitle')}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {localizedModules.map((module) => (
          <ModuleCard key={module.slug} module={module} order={orderBySlug[module.slug]} />
        ))}
      </div>
    </main>
  )
}
