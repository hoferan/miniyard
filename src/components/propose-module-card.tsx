import { ExternalLink } from 'lucide-react'
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
        'group relative flex h-full cursor-pointer flex-col justify-center rounded-[22px] p-6',
        'border border-white/90 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]',
        'shadow-[0_10px_26px_-14px_rgba(90,70,160,.45)] dark:shadow-[0_18px_40px_-20px_rgba(0,0,0,.6)]',
        'transition-all duration-300',
        'hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_26px_52px_-22px_rgba(124,108,255,.5)]',
      )}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 dark:bg-primary/15">
        <ExternalLink className="h-5 w-5" />
      </div>
      <div className="mb-1.5 text-[18px] font-bold text-foreground">{label}</div>
      <p className="text-[13.5px] leading-[1.5] text-muted-foreground">Suggest it as a GitHub issue.</p>
    </a>
  )
}
