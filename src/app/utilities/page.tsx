import { registry, getModulesByCategory } from '@/lib/registry'
import { ModuleCard } from '@/components/module-card'

export default function UtilitiesPage() {
  const modules = getModulesByCategory('utilities')
  const orderBySlug = Object.fromEntries(registry.map((m, i) => [m.slug, i]))
  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <h1 className="mb-1.5 text-3xl font-extrabold tracking-tight">Tools</h1>
      <p className="mb-8 text-muted-foreground">Handy tools for everyday tasks.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard key={module.slug} module={module} order={orderBySlug[module.slug]} />
        ))}
      </div>
    </main>
  )
}
