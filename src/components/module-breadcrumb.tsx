import Link from 'next/link'
import { ModuleCategory } from '@/lib/types'

const BACK_LABEL: Record<ModuleCategory, string> = {
  utilities: 'Back to tools',
  games: 'Back to games',
}

const BACK_HREF: Record<ModuleCategory, string> = {
  utilities: '/utilities',
  games: '/games',
}

type Props = { category: ModuleCategory }

export function ModuleBreadcrumb({ category }: Props) {
  return (
    <Link
      href={BACK_HREF[category]}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      ← {BACK_LABEL[category]}
    </Link>
  )
}
