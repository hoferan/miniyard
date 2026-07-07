import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { href: string; label: string }

export function ProposeModuleCard({ href, label }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      className={cn(
        'group relative flex h-full cursor-pointer flex-col justify-center rounded-[22px] border-2 border-dashed p-6',
        'border-primary/30 bg-primary/5 dark:border-primary/25 dark:bg-primary/[0.06]',
        'transition-all duration-300',
        'hover:-translate-y-2 hover:border-primary/60 hover:bg-primary/10 dark:hover:bg-primary/10',
      )}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
        <Lightbulb className="h-5 w-5" />
      </div>
      <div className="mb-1.5 text-[18px] font-bold text-primary">{label}</div>
      <p className="text-[13.5px] leading-[1.5] text-muted-foreground">
        Got an idea? Open a GitHub issue and we&apos;ll take a look.
      </p>
    </a>
  )
}
