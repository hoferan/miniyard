import Link from 'next/link'

const NAV_LINKS = [
  { href: '/utilities', label: 'Utilities' },
  { href: '/games', label: 'Games' },
]

export function Nav() {
  return (
    <nav className="flex gap-4 px-4 py-2 border-b text-sm">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
