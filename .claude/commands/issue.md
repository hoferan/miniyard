---
name: issue
description: Takes a GitHub issue number, brainstorms it, creates a plan, implements it, and opens a PR that closes the issue. Also triggered by phrases like "work on issue #", "implement issue", "pick up issue", "resolve issue #".
argument-hint: "#[issue-number]"
---

# /issue

End-to-end workflow: read a GitHub issue → classify it → run the right sub-workflow → open a PR that closes it.

## Natural language triggers

- `/issue #42`
- "Work on issue #42"
- "Implement issue #7"
- "Pick up issue #15 and build it"
- "Resolve issue #3"

---

## Step 1 – Read the issue

Parse the issue number from the argument (strip the leading `#` if present).

Call `mcp__github__issue_read` with:
- `owner`: `hoferan`
- `repo`: `miniyard`
- `issue_number`: [parsed number]

Read the **full body** — do not rely on the title alone.

If the issue does not exist or is already closed, stop and report:
> "Issue #[n] is [not found / already closed]. Nothing to implement."

Print a one-line summary before proceeding:
> **Issue #[n]:** [title] · Labels: [labels or "none"]

---

## Step 2 – Classify the issue

Map the issue's labels and title keywords to one of these workflow types:

| Labels / keywords | Workflow |
|---|---|
| `new-module`, `utility`, `calculator`, `converter`, `tool`, `encoder`, `formatter`, `generator`, `parser` | **Workflow A** – `/new-module` |
| `new-game`, `game`, `minigame`, `snake`, `tetris`, `memory`, `puzzle` | **Workflow A** – `/new-module` |
| `bug`, `fix`, `crash`, `error`, `broken`, `wrong output` | **Workflow B** – `/bugfix` |
| `enhancement`, `feature`, `improvement`, `ui`, `ux` | **Workflow C** – direct change |
| `ci`, `cd`, `workflow`, `pipeline`, `build`, `deploy`, `lint`, `typecheck` | **Workflow C** – direct change |
| `new-category` | **Blocked** – `/new-category` required first |

State the detected type and wait briefly — if anything seems ambiguous, ask:
> "This looks like a **[type]** — I'll follow **Workflow [A/B/C]**. Does that sound right?"

If the user disagrees, ask which workflow to use instead before proceeding.

---

## Step 3 – Create a feature branch

Derive a short slug from the issue title: kebab-case, max 5 words, lowercase, no special characters.

Example: issue #42 "Add BMI Calculator to utilities" → `issue-42-bmi-calculator`

Run:

```bash
git checkout main
git pull origin main
git checkout -b issue-[n]-[slug]
```

Confirm the branch is active before writing any code.

---

## Step 4 – Run the appropriate workflow

### Workflow A — New module (`/new-module`)

Follow the full `/new-module` workflow:

1. **Read the category README** — determine category from the issue (utilities, games, etc.). Read `src/modules/[category]/README.md` in full.
2. **Brainstorm** — ask every category-specific question from the README plus any issue-specific details not already answered in the issue body. Derive answers from the issue body where possible; only ask for what is genuinely missing.
3. **Spec** — write the spec block and wait for explicit confirmation before writing any code:

```text
## Spec: [Module Name]
Category: [category]
Function: [1–2 sentences]
Inputs: [list with type and validation]
Outputs: [list]
Logic / Algorithm: [core formula or flow]
Edge Cases: [list]
New files:
  - src/modules/[category]/[name]/meta.ts
  - src/modules/[category]/[name]/logic.ts
  - src/modules/[category]/[name]/logic.test.ts
  - src/modules/[category]/[name]/index.tsx
Registration:
  - src/lib/registry.ts
  - src/app/[category]/[slug]/page.tsx  (componentMap)
```

**No implementation without explicit spec confirmation.**

1. **Tests first (TDD)** — write `logic.test.ts` completely before `logic.ts` exists. Tests must be red. Cover: happy path, edge cases, boundary values, invalid inputs.
2. **Implementation** — `meta.ts` → `logic.ts` (until green) → `index.tsx` → register in `registry.ts` → add to `componentMap`.
3. **Documentation** — run `/update-docs`.

### Workflow B — Bug fix (`/bugfix`)

Follow the full `/bugfix` workflow:

1. Read the affected file(s) and name the root cause explicitly before touching anything.
2. Write a failing Vitest test that reproduces the bug (if `logic.ts` or `api.ts` is involved).
3. Apply the minimal fix — no unrelated changes.
4. Run `/update-docs`.

### Workflow C — Feature / Improvement / CI/CD

1. Read every relevant file mentioned in the issue.
2. Summarise what needs to change in a short plan and confirm with the user before editing anything.
3. Implement the change.
4. Run `/update-docs`.

### Blocked — New category required

Stop and report:
> "This issue requires a new category. Run `/new-category` first to create the category scaffolding, then re-run `/issue #[n]`."

Do not continue.

---

## Step 5 – Verify

Run all checks and record results:

```bash
npm run test        # always
npm run typecheck   # always
npm run build       # always for Workflow A and C; for Workflow B when the fix touches non-logic files
```

If any check fails, fix the root cause before opening the PR. Do not open a PR with broken checks.

---

## Step 6 – Open the PR

Run `/create-pr` with the following pre-filled context so it does not ask redundant questions:
- Related issue: `#[n]` (the PR body **must** contain `Closes #[n]`)
- The PR title should follow Conventional Commits convention

The PR body **must** include `Closes #[n]` in the "Related Issue" section so the issue closes automatically on merge.

---

## Hard rules

- **Never skip spec confirmation for Workflow A** — no code before the user confirms the spec
- **Never skip TDD for Workflow A** — `logic.test.ts` must exist and be red before `logic.ts` is written
- **Never skip the branch step** — always work on a dedicated `issue-[n]-[slug]` branch, never on `main`
- **Always include `Closes #[n]` in the PR body** — the issue must close on merge
- **Never push to `main`** — branch strategy is mandatory
- **Read the full issue body** — do not summarise or skip sections; the details matter
- **Delegate correctly** — do not reinvent the wheel; follow the exact steps of the matched workflow
