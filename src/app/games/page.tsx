import { Suspense } from 'react'
import { getModulesByCategory } from '@/lib/registry'
import { TagFilter } from '@/components/tag-filter'
import { EmptyState } from '@/components/empty-state'
import { Gamepad2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Games' }

export default function GamesPage() {
  const modules = getModulesByCategory('games')

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <div className="mb-1.5 flex items-baseline gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Games</h1>
        <span className="text-sm text-muted-foreground">{modules.length}</span>
      </div>
      <p className="mb-8 text-muted-foreground">Mini games to pass the time.</p>
      <Suspense>
        <TagFilter
          modules={modules}
          proposeHref="https://github.com/hoferan/miniyard/issues/new?template=new_minigame.yml"
          proposeLabel="Propose a new game"
          emptyState={
            <EmptyState
              icon={<Gamepad2 className="h-12 w-12" />}
              title="No games yet"
              description="Games are on the way. Check the open issues to see what's coming or suggest a new one."
              cta={{
                label: 'View open game issues',
                href: 'https://github.com/hoferan/miniyard/issues?q=label%3Aminigame+is%3Aopen',
              }}
            />
          }
        />
      </Suspense>
    </main>
  )
}
