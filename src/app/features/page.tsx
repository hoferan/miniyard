'use client'

import { FEATURES } from '@/lib/features'
import { useFeatures } from '@/components/features-provider'
import { Switch } from '@/components/ui/switch'

export default function FeaturesPage() {
  const { flags, setFlag } = useFeatures()

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
      <h1 className="mb-1.5 text-3xl font-extrabold tracking-tight">Labs</h1>
      <p className="mb-8 text-muted-foreground">
        Experimental features you can try out. Settings are saved in this browser.
      </p>

      <div className="flex flex-col gap-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="flex items-start justify-between gap-6 rounded-[18px] border border-white/90 bg-white/70 p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div>
              <p className="font-semibold text-foreground">{feature.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{feature.description}</p>
            </div>
            <Switch
              checked={flags[feature.id] ?? feature.defaultEnabled}
              onCheckedChange={(checked) => setFlag(feature.id, checked)}
              aria-label={`Toggle ${feature.title}`}
            />
          </div>
        ))}
      </div>
    </main>
  )
}
