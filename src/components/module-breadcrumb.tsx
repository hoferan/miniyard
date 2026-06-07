import Link from 'next/link'
import { ModuleCategory } from '@/lib/types'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  utilities: 'Utilities',
  games: 'Games',
}

type Props = { title: string; category: ModuleCategory }

export function ModuleBreadcrumb({ title, category }: Props) {
  return (
    <Breadcrumb className="px-4 pt-4 pb-1">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">miniyard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/${category}`}>{CATEGORY_LABELS[category]}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
