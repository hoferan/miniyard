---
name: add-shadcn
description: Adds a shadcn/ui component to the project by fetching it directly from GitHub (works in cloud and local environments)
argument-hint: "<component-name>"
---

# /add-shadcn

Adds one or more shadcn/ui components to `src/components/ui/`. Uses WebFetch to copy the source directly from the shadcn GitHub repo because `npx shadcn@latest add` fails with a 403 error in the cloud environment.

## Flow

### Step 1 – Resolve the component name

Take the component name from the argument (e.g. `dialog`, `select`, `badge`).

Check whether `src/components/ui/<name>.tsx` already exists. If it does, tell the user and stop — nothing to do.

### Step 2 – Fetch the source

Fetch the raw source file from the shadcn GitHub repo using WebFetch:

```text
https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/registry/new-york/ui/<name>.tsx
```

If the URL returns a 404, browse the directory listing first to find the correct filename:

```text
https://github.com/shadcn-ui/ui/tree/main/apps/www/registry/new-york/ui
```

Then retry the raw URL with the correct filename.

### Step 3 – Write the file

Write the fetched content exactly as-is to:

```text
src/components/ui/<name>.tsx
```

Do not modify the content.

### Step 4 – Resolve registry dependencies

Inspect the written file for a `registryDependencies` array (appears as a comment or in the file header). For each listed shadcn component that is not yet present in `src/components/ui/`, repeat Steps 2–4 recursively.

### Step 5 – Resolve npm dependencies

Inspect the written file for a `dependencies` array or any `import` statements that reference packages not already in `package.json`. For each missing package:

1. Find the current exact version on npm:
   ```bash
   npm info <package> version
   ```
2. Install it with the exact version (no `^` or `~`):
   ```bash
   npm install <package>@<exact-version>
   ```
3. Strip any range prefix from `package.json` immediately after install.

### Step 6 – Verify

Run a TypeScript check to confirm the component compiles cleanly:

```bash
npm run typecheck
```

Fix any type errors before finishing.

### Step 7 – Report

Tell the user:
- Which file(s) were written to `src/components/ui/`
- Which npm packages were installed (if any)
- That the component is ready to import from `@/components/ui/<name>`
