import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  cta?: { label: string; href: string }
  className?: string
}

export function EmptyState({ icon, title, description, cta, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center border rounded-xl px-6 py-16 gap-4',
        className,
      )}
    >
      <span className="text-5xl" aria-hidden="true">{icon}</span>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground max-w-sm">{description}</p>
      {cta && (
        <Button asChild className="mt-2">
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${cta.label} (opens in new tab)`}
          >
            {cta.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </Button>
      )}
    </div>
  )
}
