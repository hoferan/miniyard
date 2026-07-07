import { Skeleton } from '@/components/ui/skeleton'
import { ModuleSkeleton } from '@/components/module-skeleton'

export function ModulePageSkeleton() {
  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 pb-2 sm:px-6">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-5 h-8 w-2/3" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>
      <ModuleSkeleton />
    </>
  )
}
