---
name: review-threads
description: Interactive review of all open PR threads — works for CodeRabbit, human reviewers, and your own comments. Classifies each thread, proposes concrete reply options, and waits for your selection before posting anything. Also triggered by phrases like "handle the review comments", "process the open threads", "respond to PR feedback", "go through the PR review", "handle the CodeRabbit comments".
argument-hint: "[PR number, e.g. 1]"
---

# /review-threads

Interactive workflow for all open PR review threads regardless of source (CodeRabbit, human reviewer, or your own). Claude reads, classifies, and proposes ready-to-post reply options — you select per thread before anything is posted or resolved.

## Natural language triggers

- "Handle the review comments on PR #1"
- "Process the open threads on PR 3"
- "Respond to the PR feedback"
- "Clean up the review threads"
- "Handle the CodeRabbit comments"
- "Go through the PR review"

---

## Step 1 – Identify the PR

If a PR number was passed as an argument, use it directly. Otherwise ask: **"Which PR number?"**

---

## Step 2 – Load full context before classifying

Run **all** of the following before presenting any proposals. Do not skip any.

**2a. Identify the authenticated user**
Call `get_me` and store the login. This is needed to detect self-authored threads.

**2b. Fetch all unresolved inline threads**
Call `get_review_comments` with `is_resolved: false`. If `hasNextPage: true`, fetch all pages before proceeding.

**2c. Read each thread's full conversation**
For every thread, read all comments in it — not just the first. If the most recent comment in a thread was already posted by the authenticated user (from 2a), mark the thread as **already-responded** and exclude it from the proposal list (mention it in a footnote).

**2d. Detect potentially fixed threads**
For each thread, note the file path, line number, and creation date. Check commits made after that date that touched the same file. If such a commit exists, flag the thread as a **Fixed candidate** and include the short SHA (7 chars) in reply option 1.

**2e. Fetch general PR comments**
Call `get_comments`. These cannot be resolved via `resolve_review_thread` — present them separately at the end for awareness only, not as actionable items in the decision form.

**2f. Determine CodeRabbit severity**
For CodeRabbit threads, extract the severity badge from the comment body:
- `🔴 Critical` — action almost certainly required
- `🟠 Major` — likely action needed or strong skip reason required
- `🟡 Minor` / nitpick — skip is usually acceptable
- ℹ️ Informational — skip or acknowledge

If no badge is found in the comment body, default to 🟡.

If there are no open inline threads (after excluding already-responded ones), report that and stop.

---

## Step 3 – Classify and sort threads

**Sort order** (present in this sequence):
1. 🔴 Critical / blocking
2. 🟠 Major
3. 🟡 Minor / nitpick
4. ℹ️ Informational
5. Your own threads

**Classification logic by author:**

### CodeRabbit (`coderabbitai[bot]`)

| Classification | Criteria |
|---|---|
| **Fixed** | A commit after the thread's creation date touched the same file — include the SHA |
| **Intentional skip** | Valid finding, but a clear one-sentence reason exists not to act on it |
| **Action needed** | Valid, unaddressed — describe the specific fix required |
| **Outdated** | `is_outdated: true` — the code the comment refers to no longer exists |

### Human reviewer

| Classification | Criteria |
|---|---|
| **Agree – already fixed** | Change was made in a recent commit — include the SHA |
| **Agree – will fix** | Valid suggestion, not yet addressed |
| **Disagree** | You have a clear reason not to apply it |
| **Question answered** | Thread was a question; answer is clear from the codebase or context |
| **Acknowledged** | Non-blocking; noted for later |

### Self-authored thread (login matches `get_me`)

| Classification | Criteria |
|---|---|
| **Done** | The thing you noted is resolved |
| **Outdated** | No longer relevant |
| **Still open** | Leave it open — skip this thread |

---

## Step 4 – Present one proposal block per thread

Output **all proposals first**. Do not post or resolve anything yet.

Use this exact format per thread:

---

**Thread [N] / [total]** · [🔴/🟠/🟡/ℹ️] · `[file]:[line]`
**Author:** [coderabbitai[bot] / @username / you] · **Outdated:** [Yes / No]

> [One-sentence summary of the finding]

**Classification:** [label]

**Reply options:**
- `[1]` "[Ready-to-post reply — commit SHA included where relevant]"
- `[2]` "[Alternative — different phrasing or different stance, not just a paraphrase]"
- `[3]` Custom reply (you provide the text)

**Resolve after reply:** Yes (recommended) / No

**For Action needed threads — also show:**
> Fix plan: [concrete description of what needs to change and in which file]
> ⚠️ Fix will be applied and verified before the reply is posted. Approve the fix plan along with the reply.

---

After all blocks, show the **decision form**:

```
Your decisions — one line per thread.
Format is flexible: just include the thread number and your choice.
Examples: "1: option 1, resolve" · "2: skip" · "3: option 2, no resolve" · "4: custom"

Thread 1: ___
Thread 2: ___
…
```

**Available shortcuts:**
- `all fixed: accept` — accept option 1 + resolve for every Fixed thread
- `skip all minor` — skip (no action) all 🟡 threads
- `[N]: skip` — leave thread N open, no action

---

## Step 5 – Wait for all decisions

Do not act until the user has given a decision for **every** thread.

If the user provides decisions for only some threads, ask about the remaining ones before continuing.

If a thread decision is `custom`, ask: **"What should I post for thread [N]?"** before executing.

---

## Step 6 – Execute approved actions

Process threads in this order: Action needed first (requires code changes), then all others.

### For each accepted or modified thread:

**If classified as Action needed / Agree – will fix:**
1. Apply the fix from the approved fix plan
2. Run `npm run lint && npm run typecheck` — if either fails, **stop and report the error to the user before posting anything**. Ask how to proceed.
3. Commit and push the fix
4. Use the new commit SHA (7 chars) in the reply

**For all threads:**
1. Post the reply via `mcp__github__add_reply_to_pull_request_comment`
2. If resolve = Yes: resolve via `mcp__github__resolve_review_thread`

### For skipped threads:
No action. Thread stays open.

---

## Step 7 – Final summary

| Thread | Author | Severity | Classification | Reply | Resolved |
|---|---|---|---|---|---|
| … | … | 🔴/🟠/🟡/ℹ️ | … | Option 1 / 2 / Custom / — | ✅ / ❌ / — |

If general PR comments were found in Step 2e, list them below the table for awareness.

---

## Hard rules

- **Never post or resolve without explicit user approval** — not even for obvious "Fixed" threads
- **Never resolve a thread without a reply**
- **Always read the full thread conversation** before classifying — never classify on the first comment alone
- **Never start a code fix until the fix plan is approved by the user**
- **If lint or typecheck fails after a fix, stop and report** — do not post the reply until the code is clean
- **Fixed reply option 1 must always include the commit SHA** — look it up, do not omit it
- **Outdated threads** (`is_outdated: true`): flag clearly, recommend resolving with a short acknowledgement, do not treat as action needed
- **Already-responded threads** (last comment = authenticated user): exclude from decision form, list in a footnote
- **General PR comments** cannot be resolved via this workflow — present for awareness only
- Keep all replies short and factual — no filler, no "Great point!", no "Thanks for the feedback"
