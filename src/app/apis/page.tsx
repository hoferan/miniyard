import { Suspense } from 'react'
import { getModulesByCategory } from '@/lib/registry'
import { TagFilter } from '@/components/tag-filter'
import { EmptyState } from '@/components/empty-state'
import { Plug } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'APIs' }

export default function ApisPage() {
  const modules = getModulesByCategory('apis')

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <div className="mb-1.5 flex items-baseline gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">APIs</h1>
        <span className="text-sm text-muted-foreground">{modules.length}</span>
      </div>
      <p className="mb-8 text-muted-foreground">Fun and useful mini-apps powered by public APIs.</p>
      <Suspense>
        <TagFilter
          modules={modules}
          proposeHref="https://github.com/hoferan/miniyard/issues/new?template=new_apis_module.yml"
          proposeLabel="Propose a new API module"
          emptyState={
            <EmptyState
              icon={<Plug className="h-12 w-12" />}
              title="No API modules yet"
              description="API-powered tools are on the way. Check the open issues to see what's coming or suggest a new one."
              cta={{
                label: 'View open API issues',
                href: 'https://github.com/hoferan/miniyard/issues?q=label%3Aapis+is%3Aopen',
              }}
            />
          }
        />
      </Suspense>
    </main>
  )
}
