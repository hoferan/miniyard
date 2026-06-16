import { getModulesByCategory } from '@/lib/registry'
import { ModuleCard } from '@/components/module-card'
import { EmptyState } from '@/components/empty-state'
import { ModuleBreadcrumb } from '@/components/module-breadcrumb'

export default function GamesPage() {
  const modules = getModulesByCategory('games')
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <ModuleBreadcrumb category="games" />
      <h1 className="text-3xl font-bold mb-2">Games</h1>
      <p className="text-muted-foreground mb-8">Mini games to pass the time.</p>
      {modules.length === 0 ? (
        <EmptyState
          icon="🎮"
          title="No games yet"
          description="Games are on the way. Check the open issues to see what's coming or suggest a new one."
          cta={{
            label: 'View open game issues',
            href: 'https://github.com/hoferan/miniyard/issues?q=label%3Aminigame+is%3Aopen',
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {modules.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      )}
    </main>
  )
}
