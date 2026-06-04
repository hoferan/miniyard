---
name: new-api-explorer
description: Starts the full workflow for a new API Explorer (Brainstorm → Spec → TDD → Implement → Register → Docs)
argument-hint: "[API name or URL]"
---

# /new-api-explorer

Starts Workflow A for a new **API Explorer**.

## Flow

**Step 1 – Brainstorm**
Claude asks the following questions:
1. Which API? URL to the documentation?
2. Which endpoints will be used?
3. Does it need an API key? (→ `.env.local` + Netlify env variable + `.env.example`)
4. What does the user see? (data, visualisation, interactive query?)
5. Error case: what happens if the API does not respond?
6. Any rate limits or costs to consider?

**Step 2 – Spec**
Endpoints, request/response structure, error handling, UI concept.
Waits for confirmation.

**Step 3 – Tests first**
`src/modules/apis/<name>/api.test.ts` – response parsing, error handling, edge cases.
Real API calls are mocked. Uses Vitest.

**Step 4 – Implementation**
1. `src/modules/apis/<name>/meta.ts` → module metadata
2. `src/modules/apis/<name>/api.ts` → fetching, parsing, Sentry integration, all tests green
3. `src/modules/apis/<name>/index.tsx` → UI, loading state, error state, shadcn/ui
4. Register in `src/lib/registry.ts`
5. Add to `componentMap` in `src/app/apis/[slug]/page.tsx`

**Step 5 – Documentation**
- Update README.md API Explorers list
- `docs/apis/<name>.md` with API reference, required ENV variables, rate limits
- `.env.example` if a new API key is needed

**Step 6 – PR description**
Output finished PR description from template.
