---
name: coderabbit
description: Processes all open CodeRabbit review threads on a PR — classifies each one, replies with a rationale, and resolves it. Also triggered by phrases like "handle the CodeRabbit comments", "process the CodeRabbit review", "respond to CodeRabbit feedback", or "clean up the review threads".
argument-hint: "[PR number, e.g. 1]"
---

# /coderabbit

Processes all open CodeRabbit review threads on a given PR: reads each thread, replies with a clear rationale, and resolves it.

## Natural language triggers

Invoke this workflow when the user says something like:
- "Handle the CodeRabbit comments on PR #1"
- "Process the CodeRabbit review"
- "Respond to and resolve the CodeRabbit threads"
- "Clean up the review feedback"
- "Reply to and close the open CodeRabbit comments"

## Step 1 – Identify the PR

If a PR number was passed as an argument, use it directly.

Otherwise ask: **"Which PR number should I process?"**

## Step 2 – Read all open review threads

Use `mcp__github__pull_request_read` with `method: get_review_comments`.

Filter to threads where `is_resolved: false`. If there are none, report that and stop.

## Step 3 – Classify each thread

For each unresolved thread, determine which category applies:

| Classification | When to use |
|---|---|
| **Fixed** | The issue has already been addressed in a subsequent commit |
| **Intentional skip** | The finding is valid but deliberately not acted on (disproportionate, out of scope, or a conscious trade-off) |
| **Action needed** | The issue is valid, not yet addressed, and should be fixed before the PR merges |

## Step 4 – Handle each thread

### Fixed
Reply: `Fixed in commit [sha].`
Then resolve the thread.

### Intentional skip
Reply with a single clear sentence explaining why the suggestion is not being applied.
Then resolve the thread.

### Action needed
**Do not resolve yet.** Fix the issue first (edit files, commit, push), then reply with the fix summary and resolve.

If a thread is outdated (`is_outdated: true`), note that in the reply before resolving.

## Step 5 – Output a summary

| Thread | File | Classification | Status |
|---|---|---|---|
| … | … | Fixed / Skipped / Fixed after change | Resolved |

## Rules

- Only process threads from `coderabbitai[bot]`
- Never resolve a thread without leaving a reply first
- Keep replies short and factual — no filler phrases
- Replies are made via `mcp__github__add_reply_to_pull_request_comment`, resolved via `mcp__github__resolve_review_thread`
