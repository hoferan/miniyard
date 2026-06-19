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

## Step 0 – Bootstrap superpowers

Invoke `/using-superpowers` before anything else. This ensures all skills are loaded and available for the sub-workflows that follow.

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

Invoke `/new-module`. Pass the issue body as context so brainstorm questions can be pre-answered from the issue where possible — but still run the full workflow (brainstorming, planning, TDD, implementation, docs, verification).

Context to pass from the issue:
- Module name / idea: from issue title
- Category: from issue labels or body
- Functional requirements, inputs, outputs: from issue body
- Any specified algorithms or constraints: from issue body

Do not skip or shortcut any `/new-module` step — the issue provides answers, not exemptions.

### Workflow B — Bug fix (`/bugfix`)

Invoke `/bugfix` with the following context from the issue:
- Problem: from issue title and body
- File / Component: if specified in the issue
- Expected behaviour: from issue body
- Actual behaviour: from issue body

The `/bugfix` workflow handles root-cause investigation, TDD, the minimal fix, docs update, and verification.

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
