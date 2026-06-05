import { getModulesByCategory } from '@/lib/registry'
import { ModuleCard } from '@/components/module-card'

export default function GamesPage() {
  const modules = getModulesByCategory('games')
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Games</h1>
      <p className="text-muted-foreground mb-8">Mini games to pass the time.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.slug} module={module} />
        ))}
      </div>
    </main>
  )
}
