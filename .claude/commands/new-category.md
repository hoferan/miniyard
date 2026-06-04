---
name: new-category
description: Adds a new module category to miniyard (creates all required files and updates all references)
argument-hint: "[category name, e.g. swiss, apis, science]"
---

# /new-category

Adds a new top-level category to miniyard. Follow every step — partial category setup causes routing and type errors.

## Step 1 – Confirm with user (required)

Ask before writing any code:
1. What is the category name? (lowercase, URL-safe slug, e.g. `swiss`)
2. What is the display label? (e.g. `Swiss`)
3. Short description for the listing page? (1 sentence)
4. Icon emoji?
5. What kind of modules will go here — utility-like (`logic.ts`) or API-based (`api.ts`)?

Wait for confirmation.

## Step 2 – Create app pages

`src/app/[category]/page.tsx` — listing page:
```tsx
import { getModulesByCategory } from '@/lib/registry'
import { ModuleCard } from '@/components/module-card'

export default function [Label]Page() {
  const modules = getModulesByCategory('[category]')
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">[Label]</h1>
      <p className="text-muted-foreground mb-8">[Description]</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.slug} module={module} />
        ))}
      </div>
    </main>
  )
}
```

`src/app/[category]/[slug]/page.tsx` — module detail page:
```tsx
import { getModuleBySlug } from '@/lib/registry'
import { notFound } from 'next/navigation'

const componentMap: Record<string, React.ComponentType> = {
  // Add module components here as they are created
}

export default async function [Label]ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const module = getModuleBySlug(slug)
  const Component = componentMap[slug]
  if (!module || !Component) return notFound()
  return <Component />
}
```

## Step 3 – Update types

`src/lib/types.ts` — add the new category to the union:
```ts
export type ModuleCategory = 'utilities' | 'games' | '[category]'
```

## Step 4 – Update navigation

`src/components/layout/nav.tsx` — add a link for the new category.

## Step 5 – Create slash command

`.claude/commands/new-[category]-module.md` — copy the structure from `new-utility-tool.md` and adapt paths and brainstorm questions for the new category.

## Step 6 – Create GitHub issue template

`.github/ISSUE_TEMPLATE/new_[category]_module.yml` — copy structure from `new_utility_tool.yml`, update name, description, labels, and any category-specific fields.

## Step 7 – Update issue templates and PR template

Add the new category to the `Area` dropdown in:
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`

Add a new type checkbox in `.github/PULL_REQUEST_TEMPLATE.md`.

## Step 8 – Update docs

- `README.md` — add new category section with empty module table
- `CLAUDE.md` — update categories table, project structure, slash commands list

## Step 9 – Verify

```bash
npm run typecheck   # ModuleCategory type change must be valid
npm run build       # New pages must compile without errors
npm run test        # No regressions
```

## Step 10 – PR

Open a PR with description: what category was added and why.
