import { Suspense } from 'react'
import { getModulesByCategory } from '@/lib/registry'
import { TagFilter } from '@/components/tag-filter'

export default function UtilitiesPage() {
  const modules = getModulesByCategory('utilities')

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <h1 className="mb-1.5 text-3xl font-extrabold tracking-tight">Tools</h1>
      <p className="mb-8 text-muted-foreground">Handy tools for everyday tasks.</p>
      <Suspense>
        <TagFilter modules={modules} />
      </Suspense>
    </main>
  )
}
