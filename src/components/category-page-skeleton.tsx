import { Skeleton } from '@/components/ui/skeleton'

const SKELETON_CARD_COUNT = 6

export function CategoryPageSkeleton() {
  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <Skeleton className="mb-1.5 h-9 w-44" />
      <Skeleton className="mb-8 h-5 w-64" />
      <div className="mb-6 flex flex-wrap gap-2">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-14 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-[22px]" />
        ))}
      </div>
    </main>
  )
}
