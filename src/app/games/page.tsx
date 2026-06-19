import { getModulesByCategory } from '@/lib/registry'
import { ModuleCard } from '@/components/module-card'
import { EmptyState } from '@/components/empty-state'

export default function GamesPage() {
  const modules = getModulesByCategory('games')

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <h1 className="mb-1.5 text-3xl font-extrabold tracking-tight">Games</h1>
      <p className="mb-8 text-muted-foreground">Mini games to pass the time.</p>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      )}
    </main>
  )
}
