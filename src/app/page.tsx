import { registry } from '@/lib/registry'
import { ModuleCard } from '@/components/module-card'

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">miniyard 🧰</h1>
      <p className="text-muted-foreground mb-10">
        A modular playground for useful tools, mini games, and API explorers.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {registry.map((module) => (
          <ModuleCard key={module.slug} module={module} />
        ))}
      </div>
    </main>
  )
}
