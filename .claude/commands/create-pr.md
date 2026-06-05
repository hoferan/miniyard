---
name: create-pr
description: Creates a pull request by reading the current diff, filling the PR template, asking only the questions that can't be inferred, and creating it only after explicit approval. Also triggered by phrases like "open a PR", "create a pull request", "make a PR", "submit a PR", "open a pull request".
argument-hint: "[optional context or notes]"
---

# /create-pr

Guided pull request creation. Claude reads the current branch diff, fills in everything it can infer, asks only about what it cannot, proposes the complete PR for approval, and creates it only after you confirm.

## Natural language triggers

- "Open a PR for this branch"
- "Create a pull request"
- "Make a PR — the related issue is #42"
- "Submit this as a PR, it fixes #7"
- "Open a pull request, here are my reviewer notes: ..."

---

## Step 1 – Read the branch context

Run all of the following before asking anything. Do not skip any.

**1a. Identify branches**
Run `git branch --show-current` to get the current branch. The base branch is `main`.

**1b. Check for unpushed changes**
Run `git status` and `git log main..HEAD --oneline`. If the working tree has uncommitted changes, warn the user:
> "There are uncommitted changes. These will not be included in the PR. Commit them first or proceed without them."
> Wait for the user to confirm before continuing.

If the branch has no commits ahead of main, stop and report:
> "There are no commits ahead of main on this branch — nothing to pull request."

**1c. Read the diff**
Run `git diff main...HEAD` and `git log main..HEAD --oneline` to understand what changed.

**1d. Read the PR template**
Read `.github/PULL_REQUEST_TEMPLATE.md` in full.

---

## Step 2 – Infer what you can

From the diff, determine:

### PR type (checkboxes)

| Changed files | Type(s) to check |
|---|---|
| `src/modules/utilities/` | 🔧 New Utility Tool |
| `src/modules/games/` | 🎮 New Minigame |
| `src/app/[new-category]/` + `src/lib/types.ts` | 🗂️ New Category |
| Existing module files modified | ✨ Improvement / Feature |
| Commit messages starting with `fix:` | 🐛 Bug fix |
| Refactor / rename / restructure commits | 🧹 Refactor / Cleanup |
| `*.md`, `*.yml`, config files only | 📚 Docs / Config |

Check all types that apply. When in doubt, check the most specific match.

### Checklist items

Evaluate each item from the template against the diff:

| Item | Check if… |
|---|---|
| `meta.ts` created | a `meta.ts` file appears in the diff |
| Registered in `registry.ts` | `src/lib/registry.ts` appears in the diff |
| Added to `componentMap` | an `app/[category]/[slug]/page.tsx` file was modified |
| Tests written and green | a `logic.test.ts` file appears in the diff AND `npm run test` passes |
| TypeScript check passes | `npm run typecheck` exits 0 |
| Build passes | `npm run build` exits 0 |
| Netlify preview checked | never auto-check — always leave unchecked |
| No secrets / API keys | leave unchecked — cannot be verified automatically |
| Documentation updated | `README.md` or `docs/` appears in the diff |

Run `npm run test`, `npm run typecheck`, and `npm run build` now and record the results. If any fail, warn the user before continuing:
> "⚠️ [test / typecheck / build] failed. Fix this before the PR is merged. Continue anyway or stop?"
> Wait for confirmation.

### PR description (first draft)

Write a 2–4 sentence description for "What does this PR change?" based on:
- The commit messages
- Which files changed
- What the module/fix/feature does

Focus on WHAT changed and WHY. Do not describe individual files — describe the user-visible change.

### Conventional Commits title

Derive a title that follows the convention:

| Type | Prefix |
|---|---|
| New module | `feat: add [module name] ([category])` |
| Bug fix | `fix: [short description]` |
| Improvement | `feat: [short description]` |
| Refactor | `refactor: [short description]` |
| Docs/config | `chore: [short description]` or `docs: [short description]` |

Keep the title under 72 characters.

---

## Step 3 – Ask only what cannot be inferred

After reading the diff, ask these questions in a single message:

```text
I've read the diff. Here's what I still need from you:

1. Related issue — is this linked to a GitHub issue?
   (Enter the number, e.g. "42", or "none")

2. Notes for reviewer — any non-obvious trade-offs, alternatives considered,
   known limitations, or areas you want reviewed closely?
   (Optional — skip if the code speaks for itself)

3. Quick review — I'll propose the full PR in the next step.
   Is there anything about the description or title I should know in advance?
   (Optional — skip to proceed)
```

If the user passed context as an argument (e.g. `/create-pr fixes #42, reviewer note: chose X over Y`), extract the relevant values from it and skip asking for those.

Wait for the answers before proceeding.

---

## Step 4 – Propose the complete PR

Construct the full PR using the template and present it for approval. Do not create anything yet.

Format:

```text
---
PROPOSED PULL REQUEST
---

Title:    [conventional commits title]
Base:     main ← [current-branch]

Body:
─────────────────────────────────────────────
## What does this PR change?

[2–4 sentence description]

## Type

- [x] 🔧 New Utility Tool       ← checked if applicable
- [ ] 🎮 New Minigame
- [ ] 🗂️ New Category
- [x] ✨ Improvement / Feature   ← checked if applicable
- [ ] 🐛 Bug fix
- [ ] 🧹 Refactor / Cleanup
- [ ] 📚 Docs / Config

## Related Issue

Closes #[number]    ← or "N/A" if none

## Notes for reviewer

[user's reviewer notes, or section omitted if skipped]

## Checklist

- [x] `meta.ts` created with correct metadata
- [x] Module registered in `src/lib/registry.ts`
- [x] Module added to `componentMap` in `src/app/[category]/[slug]/page.tsx`
- [x] Tests written and all green (`npm run test`)
- [x] TypeScript check passes (`npm run typecheck`)
- [x] Build passes (`npm run build`)
- [ ] Netlify preview checked
- [ ] No secrets / API keys in code
- [x] Documentation updated (README, `docs/` if relevant)
─────────────────────────────────────────────

Reply with:
  yes        — create this PR as-is
  edit       — tell me what to change (e.g. "edit title: …" or "edit description: …")
  cancel     — abort
```

When "Related Issue" is "N/A", render the section as:

```text
## Related Issue

N/A
```

When "Notes for reviewer" was skipped, omit the section header and body entirely (leave the section blank as per the template comment).

---

## Step 5 – Handle edits

Accept corrections in any natural form:

- `"edit title: fix: prevent crash on negative weight input"`
- `"change description: This PR adds..."`
- `"uncheck the build checkbox — build is broken upstream"`
- `"the type should be bug fix, not improvement"`
- `"add reviewer note: I tried approach X first but it caused Y"`

Apply the correction, regenerate the full proposal, and show it again. Repeat until the user confirms.

---

## Step 6 – Create the PR

Once the user confirms with `yes` (or equivalent: "looks good", "create it", "go ahead", "ship it"):

1. Push the branch if it has no remote tracking branch yet:
   Run `git push -u origin [branch-name]`

2. Call `mcp__github__create_pull_request` with:
   - `owner`: `hoferan`
   - `repo`: `miniyard`
   - `title`: the approved title
   - `body`: the approved body (including all HTML comments from the template, preserving the original template structure)
   - `head`: current branch name
   - `base`: `main`

3. Report back with the PR URL and number:

```text
PR created: #[number] — [title]
[URL]
```

Then ask: "Would you like me to watch this PR for review comments and CI results?" (mention that you can auto-respond to CodeRabbit and re-kick failing CI).

---

## Hard rules

- **Never create the PR without explicit user approval**
- **Never push or create anything if the branch is already up to date with main** — report and stop
- **Never skip running test / typecheck / build** — these determine the checklist state
- **Always use `mcp__github__create_pull_request`** — do not use the GitHub CLI
- **Never check "Netlify preview checked"** — this requires human verification
- **Never check "No secrets / API keys"** — this requires human verification
- **If the branch has no remote, push it first** before calling `create_pull_request`
- **Preserve HTML template comments in the body** — they appear in the GitHub editor and help future contributors
- **Base branch is always `main`** — never use a different base without explicit user instruction
