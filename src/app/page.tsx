import { Suspense } from 'react'
import { registry } from '@/lib/registry'
import { HomeSearch } from '@/components/home-search'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1040px] px-4 py-6 sm:px-6">
      <div className="py-10 text-center md:py-14">
        <h1 className="mb-5 text-[4rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[5.5rem]">
          <span className="bg-gradient-to-br from-[#3a2f80] to-primary bg-clip-text text-transparent dark:from-white dark:to-primary">
            miniyard
          </span>
          <span className="ml-1.5 inline-block h-12 w-[10px] translate-y-1 animate-blink bg-primary sm:h-16" />
        </h1>

        <p className="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
          A modular playground for useful tools and mini games.
        </p>
      </div>

      <Suspense>
        <HomeSearch modules={registry} />
      </Suspense>
    </div>
  )
}
