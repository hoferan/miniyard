export function Footer() {
  return (
    <footer className="border-t px-4 py-3 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between">
        <span>© {new Date().getFullYear()} miniyard</span>
        <a
          href="https://github.com/hoferan/miniyard"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          GitHub ↗
        </a>
      </div>
    </footer>
  )
}
