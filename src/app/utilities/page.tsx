import { Suspense } from 'react'
import { getModulesByCategory } from '@/lib/registry'
import { TagFilter } from '@/components/tag-filter'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Utilities' }

export default function UtilitiesPage() {
  const modules = getModulesByCategory('utilities')

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <div className="mb-1.5 flex items-baseline gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Utilities</h1>
        <span className="text-sm text-muted-foreground">{modules.length}</span>
      </div>
      <p className="mb-8 text-muted-foreground">Handy tools for everyday tasks.</p>
      <Suspense>
        <TagFilter
          modules={modules}
          proposeHref="https://github.com/hoferan/miniyard/issues/new?template=new_utility_tool.yml"
          proposeLabel="Propose a new utility"
        />
      </Suspense>
    </main>
  )
}
