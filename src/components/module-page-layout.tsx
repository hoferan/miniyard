import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { Module } from '@/lib/types'

interface Props {
  mod: Module
  children: React.ReactNode
}

export function ModulePageLayout({ mod, children }: Props) {
  const categoryLabel = mod.category === 'utilities' ? 'Utilities' : 'Games'
  const categoryHref = `/${mod.category}`

  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-6 pb-2 sm:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={categoryHref}>{categoryLabel}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{mod.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mt-5 text-[1.75rem] font-extrabold tracking-tight text-foreground">{mod.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
      </div>
      {children}
    </>
  )
}
