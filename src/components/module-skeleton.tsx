import { Skeleton } from '@/components/ui/skeleton'

export function ModuleSkeleton() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-2 sm:px-6 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-6 w-5/6" />
    </div>
  )
}
