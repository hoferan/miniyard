import Link from 'next/link'

type Props = { label: string; href: string }

export function ModuleBreadcrumb({ label, href }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      ← {label}
    </Link>
  )
}
