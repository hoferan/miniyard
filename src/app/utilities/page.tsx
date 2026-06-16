import { getModulesByCategory } from '@/lib/registry'
import { ModuleCard } from '@/components/module-card'
import { ModuleBreadcrumb } from '@/components/module-breadcrumb'

export default function UtilitiesPage() {
  const modules = getModulesByCategory('utilities')
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <ModuleBreadcrumb category="utilities" />
      <h1 className="text-3xl font-bold mb-2">Utilities</h1>
      <p className="text-muted-foreground mb-8">Handy tools for everyday tasks.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.slug} module={module} />
        ))}
      </div>
    </main>
  )
}
