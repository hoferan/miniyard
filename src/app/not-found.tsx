import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-3 text-[7rem] font-extrabold leading-none tracking-[-0.04em] sm:text-[10rem]">
        <span className="bg-gradient-to-br from-[#3a2f80] to-primary bg-clip-text text-transparent dark:from-white dark:to-primary">
          404
        </span>
      </p>

      <h1 className="mb-2 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mb-8 max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Button asChild>
        <Link href="/">
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </Button>
    </main>
  )
}
