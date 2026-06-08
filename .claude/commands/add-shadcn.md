---
name: add-shadcn
description: Adds a shadcn/ui component to the project by fetching it directly from GitHub (works in cloud and local environments). Also triggered by phrases like "add a [name] component", "I need a shadcn [name]", "install the [name] component", "use shadcn's [name]", "can you add [name] from shadcn", "we need a [name] picker/dialog/dropdown".
argument-hint: "<component-name>"
---

# /add-shadcn

Adds one or more shadcn/ui components to `src/components/ui/`. Uses WebFetch to copy the source directly from the shadcn GitHub repo because `npx shadcn@latest add` fails with a 403 error in the cloud environment.

## Natural language triggers

Invoke this command whenever the user's message matches any of these patterns — even without typing `/add-shadcn`:

- "Add a dialog component"
- "I need a select / dropdown / combobox"
- "Can you install the shadcn badge?"
- "Use a calendar picker from shadcn"
- "We need a date picker"
- "Add the accordion and tabs components"
- "Install shadcn's tooltip"
- "Can you add a toast / sonner notification?"
- "I want to use a popover here"
- "We're missing a skeleton loader"

When the user names a UI concept rather than an exact shadcn component name (e.g. "dropdown", "toast", "date picker"), map it to the closest shadcn component before fetching:

| User says | shadcn component |
|---|---|
| dropdown, dropdown menu | `dropdown-menu` |
| toast, notification | `sonner` |
| date picker | `calendar` + `popover` |
| combobox | `command` + `popover` |
| modal | `dialog` |
| tooltip | `tooltip` |
| loading skeleton | `skeleton` |
| progress bar | `progress` |
| notification badge | `badge` |
| tabs | `tabs` |

If the mapping is ambiguous, state the assumed component name and proceed — do not ask for confirmation.

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

If the fetch fails for any other reason (network error, timeout, 5xx), report:
> "Failed to fetch `<name>` from GitHub — check your connection or try again."

Then stop. Do not write a partial file.

### Step 3 – Write the file

Write the fetched content exactly as-is to:

```text
src/components/ui/<name>.tsx
```

Do not modify the content.

### Step 4 – Resolve shadcn component dependencies

Inspect the written file for `import` statements that reference other `@/components/ui/<x>` paths. For each referenced component where `src/components/ui/<x>.tsx` does not yet exist, repeat Steps 2–4 recursively to install it.

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
