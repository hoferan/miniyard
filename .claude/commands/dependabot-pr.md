---
name: dependabot-pr
description: Triages a Dependabot pull request — investigates why CI is failing (if it is), classifies the root cause, and proposes one concrete resolution to approve before anything is pushed or closed. Also triggered by phrases like "check PR #nr", "handle the dependabot PR", "triage the dependency bump", "what's blocking the next PR".
argument-hint: "[PR number, e.g. 117]"
---

# /dependabot-pr

Investigation-first triage for a single Dependabot PR. This is deliberately **not** the full `/brainstorming` → `/writing-plans` → `/executing-plans` pipeline — a version bump has no product design to explore, only a failure to diagnose and one of a few standard resolutions to pick. The only judgement calls are: what actually broke, and which of the standard resolutions fits.

## Natural language triggers

- "Check PR #117"
- "Handle the dependabot PR"
- "Triage the dependency bump"
- "Why is the Sentry PR failing?"
- "What's blocking PR #42"

---

## Step 1 – Identify the PR and confirm scope

If a PR number was passed as an argument, use it directly. Otherwise ask: **"Which PR number?"**

Fetch it with `pull_request_read` (`method: get`). Confirm the author is `dependabot[bot]` and the head ref starts with `dependabot/`. If it isn't a Dependabot PR, say so and ask whether to continue anyway with this same triage flow, or hand off to `/review-threads` instead (that skill is for review-comment threads, not dependency-update triage).

---

## Step 2 – Gather full context before diagnosing

Run all of the following. Do not propose a fix from the check-run summary alone — the failing check name is rarely the root cause.

1. `pull_request_read` → `get_check_runs` — list every check and its conclusion.
2. For each **failing** check that is a GitHub Actions job, call `get_job_logs` with `failed_only: true` on its run, `return_content: true`. If the result is truncated ("exceeds maximum allowed tokens"), read the saved file from the scratchpad directory and grep for `error|FAIL|npm error|✕|ERESOLVE|Type error` rather than reading it in full — these logs are long and mostly noise.
3. Read enough surrounding lines around each match to see the *first* real error, not just its echo further down the log (npm/build tools often repeat the same failure across multiple steps).
4. Check `mergeable_state` from Step 1 — if `dirty`/conflicting, that's a merge conflict with `main`, not a CI failure; note it separately.
5. Read the PR body's release notes for the version jump (major vs minor/patch) — Dependabot includes them.

---

## Step 3 – Classify the root cause

Pick exactly one:

| Classification | Signal |
|---|---|
| **Peer dependency conflict** | `ERESOLVE`, `Could not resolve dependency` in `npm ci`/`npm install` output |
| **Merge conflict** | `mergeable_state: dirty`, no CI failure needed to diagnose this |
| **Breaking API change** | Type errors, failing unit/E2E tests, or lint errors referencing symbols the bump removed/renamed — check the release notes for a matching breaking-change entry |
| **Unrelated CI flake** | Failure is in a check unrelated to the dependency (e.g. a flaky E2E timing test) and re-running would likely pass |
| **Clean** | All required checks green, `mergeable_state: clean` — nothing to diagnose |

If genuinely ambiguous after Step 2, invoke `/systematic-debugging` before concluding — do not guess.

---

## Step 4 – Propose one resolution, wait for approval

Present findings in this format, then stop:

```text
PR #[n]: [title]
Root cause: [classification] — [one-sentence evidence, with the specific log line or file]

Proposed resolution: [one of the options below]
[2-3 sentence rationale]

Proceed? (yes / pick a different option / something else)
```

**Resolution options by classification:**

- **Peer dependency conflict, no compatible upstream release exists** (checked via `npm view <pkg> versions`) → add the dependency's major-version bumps to `.github/dependabot.yml`'s `ignore` list with a comment naming the blocking package and this PR number, close the PR with a comment explaining the block, commit the ignore-list change to the current working branch.
- **Peer dependency conflict, a compatible release DOES exist but isn't installed** → propose bumping the blocking package alongside this one in the same PR; if that's a same-repo change, apply it on the Dependabot branch (see Step 5).
- **Merge conflict with `main`** → propose rebasing the PR branch onto `main` (via `update_pull_request_branch` or a manual rebase-and-push) — this alone often resolves it without touching dependency code.
- **Breaking API change** → propose the specific call-site fix (name the file/line and what changes), to be applied on the Dependabot branch. Treat this like Workflow B (bug fix): name the root cause, make the minimal fix, run `npm run lint && npm run typecheck && npm run test` before pushing.
- **Unrelated CI flake** → propose re-running the failed job only; do not touch code.
- **Clean** → propose merging (respecting the no-direct-push-to-`main` rule — this still goes through the normal PR merge button/API, never a manual push).

Never propose `--force` / `--legacy-peer-deps` as the resolution — flag it as a workaround that masks the real conflict, not a fix, if the user asks about it directly.

---

## Step 5 – Execute the approved resolution

**If applying a code fix on the Dependabot branch** (breaking API change, or bumping a second package alongside it):
1. `git fetch origin <dependabot-branch>` and check it out.
2. Apply the minimal fix.
3. Run `npm run lint && npm run typecheck && npm run test` — if any fail, stop and report before pushing.
4. Commit and push to the **same Dependabot branch** (`git push origin <branch>`, not a new branch) — this updates the existing PR in place.

**If closing with an ignore-list entry:**
1. Add the `ignore` entry to `.github/dependabot.yml` with a comment explaining the blocker and linking the PR number.
2. Comment on the PR explaining the root cause and the ignore-list addition.
3. Close the PR (`update_pull_request`, `state: closed`).
4. Commit and push the `dependabot.yml` change to the current working branch — do not push directly to `main`.

**If rebasing:** call `update_pull_request_branch`, then re-check CI once it re-runs (do not poll in a sleep loop — wait for the next webhook event if subscribed, or ask the user to check back).

**If merging:** use the normal merge tool/button — never bypass branch protection.

---

## Hard rules

- **Never merge a major version bump without explicit user approval**, even if CI is green — a green check doesn't mean the behavior change is acceptable for this project.
- **Never push a fix directly to `main`** — Dependabot PR fixes go on the Dependabot branch (updates the existing PR); ignore-list changes go on the current working branch and follow the normal PR process.
- **Never use `--force` / `--legacy-peer-deps` as a fix** — surface the underlying conflict instead.
- **Always find the first real error in the logs**, not just the check-run name or a downstream symptom (e.g. a missing coverage report is a symptom of a failed install, not the cause).
- **Verify an ignore-list decision** by checking the blocking package's actual published versions (`npm view <pkg> versions`) before claiming "no compatible release exists."
- **Run lint/typecheck/test before pushing any code fix** — stop and report failures rather than pushing broken code.
- **Wait for explicit approval** before closing a PR, pushing to any branch, or editing `dependabot.yml`.
