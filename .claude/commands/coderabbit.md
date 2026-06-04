---
name: coderabbit
description: Reviews all open CodeRabbit threads on a PR — presents a proposed classification and reply for each one, waits for user approval per thread, then acts. Also triggered by phrases like "handle the CodeRabbit comments", "process the CodeRabbit review", "respond to CodeRabbit feedback", or "clean up the review threads".
argument-hint: "[PR number, e.g. 1]"
---

# /coderabbit

Interactive workflow for handling CodeRabbit review threads. Claude analyses every open thread and proposes an action — you decide per thread before anything is posted or resolved.

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

## Step 3 – Present proposals (no action yet)

For each unresolved thread, output one proposal block — **do not post or resolve anything yet**:

---

**Thread [N] of [total]**
**File:** `[path]` · line [line]
**CodeRabbit says:** [one-sentence summary of the finding]

**Proposed classification:** Fixed / Intentional skip / Action needed
**Proposed reply:** "[exact reply text Claude would post]"
**Resolve after reply:** Yes / No

**Your options:**
- `accept` — post the reply and resolve as proposed
- `modify` — provide a different reply text (and optionally change resolve)
- `skip` — leave this thread open, take no action

---

Repeat this block for every open thread, then ask:

> **Ready to decide. Reply with your decisions — one per thread (accept / modify [new text] / skip).**

## Step 4 – Wait for user decisions

Do not take any action until the user has responded with a decision for each thread.

Accept partial responses: if the user replies for only some threads, ask about the remaining ones before proceeding.

## Step 5 – Execute approved actions

For each thread where the user chose **accept** or **modify**:

1. Post the reply via `mcp__github__add_reply_to_pull_request_comment`
2. If resolve is Yes: resolve via `mcp__github__resolve_review_thread`
3. If classification was **Action needed**: apply the fix (edit files, commit, push) before posting the reply

For threads where the user chose **skip**: leave them open, no action.

## Step 6 – Summary

| Thread | File | Decision | Action taken |
|---|---|---|---|
| … | … | Accepted / Modified / Skipped | Replied + resolved / Replied / No action |

## Rules

- Only process threads from `coderabbitai[bot]`
- Never post a reply or resolve without explicit user approval
- Never resolve a thread without leaving a reply first
- Keep proposed replies short and factual — no filler phrases
- If a thread is outdated (`is_outdated: true`), mention it in the proposal
