import Link from 'next/link'
import { Module } from '@/lib/types'

export function ModuleCard({ module }: { module: Module }) {
  return (
    <Link href={`/${module.category}/${module.slug}`}>
      <div className="border rounded-xl p-4 hover:shadow-md transition cursor-pointer">
        <div className="text-3xl mb-2">{module.icon}</div>
        <h2 className="font-semibold text-lg">{module.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
        <span className="inline-block mt-3 text-xs bg-muted px-2 py-1 rounded-full">
          {module.status}
        </span>
      </div>
    </Link>
  )
}
