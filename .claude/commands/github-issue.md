---
name: github-issue
description: Create a GitHub issue by answering a few questions. Detects the right template from natural language, asks only the relevant questions, proposes the full issue for approval, and creates it. Also triggered by phrases like "open an issue", "file a bug", "create a feature request", "add an issue for", "report a bug", "log an issue".
argument-hint: "[describe what the issue is about]"
---

# /github-issue

Guided GitHub issue creation. Claude detects the right template from natural language, asks only the questions that template requires, proposes the complete issue content, and creates it only after explicit approval.

## Natural language triggers

- "Open an issue for a new snake game"
- "File a bug — the BMI calculator crashes on negative input"
- "Create a feature request to add dark mode"
- "Log an issue: the CI build fails on Node 20"
- "I want to report a bug"
- "Add an issue for a new utility tool"
- "Create an issue about improving the deploy pipeline"

---

## Step 1 – Detect template

Read the user's argument or message and map it to one of the five templates below using keyword signals:

| Template | Key signals |
|---|---|
| **Bug Report** | bug, broken, crash, error, not working, wrong output, unexpected, fails, issue with existing |
| **New Utility Tool** | utility, tool, calculator, converter, encoder, decoder, formatter, generator, parser |
| **New Minigame** | game, minigame, snake, tetris, memory, puzzle, arcade, play |
| **Feature Request** | feature, enhancement, improvement, add to existing, extend, upgrade, missing, wish |
| **CI/CD Improvement** | ci, cd, workflow, pipeline, build, deploy, lint, typecheck, action, github action, automation |

If the input clearly matches one template, state it and proceed to Step 2.

If the input is ambiguous or no clear match, present the menu and ask:

```text
Which type of issue is this?

  [1] 🐛 Bug Report — something is not working
  [2] 🔧 New Utility Tool — idea for a calculator, converter, text tool, etc.
  [3] 🎮 New Minigame — idea for a browser game
  [4] ✨ Feature Request — improvement to an existing module or the app
  [5] ⚙️ CI/CD Improvement — workflows, pipelines, build, deploy, tooling
```

Wait for the user's selection before proceeding.

---

## Step 2 – Ask clarifying questions

Ask **all required fields** for the detected template. Ask them in a single message, grouped clearly. Include optional fields but mark them with "(optional — skip if unsure)".

Use the exact field labels from the template so the proposal maps cleanly to the GitHub form.

### Bug Report fields

```text
1. Area — which part of the app?
   Options: Utility Tool | Minigame | Navigation / Layout | Other

2. What happened?
   (describe the unexpected behaviour — "When I do X, Y happens instead of Z")

3. Steps to reproduce
   (numbered list)

4. Expected behaviour
   (what should have happened?)

5. Browser / Device / OS (optional — skip if unsure)
   (e.g. Safari iOS 17, iPhone 15)
```

### New Utility Tool fields

```text
1. Tool name
   (e.g. BMI Calculator, Unit Converter, Base64 Encoder)

2. What should the tool do?
   (1–3 sentences)

3. Inputs
   (list each input with its type, e.g. "Weight — number, kg or lbs")

4. Output / Result
   (what does the user see after calculating?)

5. Formula / Logic (optional — skip if unsure)
   (e.g. BMI = weight (kg) / height (m)²)

6. Estimated complexity
   Options: Small (< 1h) | Medium (1–4h) | Large (> 4h)
```

### New Minigame fields

```text
1. Game name
   (e.g. Snake, Memory, Reaction Time Test)

2. Game idea
   (what is the objective? how does it work?)

3. Game mechanics
   (controls, win condition, lose condition)

4. Primary controls
   Options: Touch / Swipe (mobile-first) | Click / Tap | Keyboard | Mixed

5. Scoring / High score (optional — skip if unsure)
   (are there points? a timer? a high score?)

6. Estimated complexity
   Options: Small (< 2h) | Medium (2–6h) | Large (> 6h)
```

### Feature Request fields

```text
1. Area — which part of the app does this affect?
   Options: Existing Utility Tool | Existing Minigame | UI / UX | Performance | Other

2. What is missing or annoying?
   ("I wish I could..." / "Currently there is no...")

3. Desired solution
   (what should the end result look like?)
```

### CI/CD Improvement fields

```text
1. Area
   Options: Workflows | Testing | Linting & Type Checking | Security | Build & Deploy | Monitoring & Reporting | Other

2. What is the problem or gap?
   (e.g. "Currently there is no..." / "The pipeline fails when...")

3. Proposed solution
   (e.g. "Add X to the PR workflow... / Configure Y to...")

4. Estimated effort
   Options: Small (< 1h) | Medium (1–4h) | Large (> 4h)
```

---

## Step 3 – Propose the complete issue

After receiving all answers, construct the full issue and present it for approval. Do not create anything yet.

Format the proposal exactly like this:

```text
---
PROPOSED ISSUE
---

Title:    [derived title — e.g. "🐛 Bug: BMI Calculator crashes on negative weight"]
Labels:   [labels from the template, e.g. "bug, needs-triage"]

Body:
─────────────────────────────────────────────
### [Field label 1]

[User's answer]

### [Field label 2]

[User's answer]

…
─────────────────────────────────────────────

Reply with:
  yes        — create this issue as-is
  edit       — tell me what to change (e.g. "edit title: …" or "edit steps: …")
  cancel     — abort
```

### Title format per template

| Template | Title pattern |
|---|---|
| Bug Report | `🐛 Bug: [short description of what is broken]` |
| New Utility Tool | `🔧 New Tool: [Tool name]` |
| New Minigame | `🎮 New Game: [Game name]` |
| Feature Request | `✨ Feature: [short description of the desired improvement]` |
| CI/CD Improvement | `⚙️ CI/CD: [short description of the improvement]` |

The title should be concise (under 72 characters), descriptive, and derived from the user's answers — not copied verbatim.

### Body format

Use the GitHub form body format — each field becomes a `### Heading` followed by the answer on the next line. For dropdown fields, use the exact option text. For optional fields left blank, omit the section entirely.

---

## Step 4 – Handle edits

If the user replies with `edit`, accept corrections in any natural form:

- `"edit title: BMI Calculator divide by zero error"`
- `"change steps: 1. Open calculator 2. Enter -5 3. See crash"`
- `"the area should be Utility Tool"`

Apply the correction, regenerate the full proposal, and show it again for approval. Repeat until the user confirms.

---

## Step 5 – Create the issue

Once the user confirms with `yes` (or equivalent: "looks good", "create it", "go ahead", "ship it"):

1. Call `mcp__github__issue_write` with:
   - `owner`: `hoferan`
   - `repo`: `miniyard`
   - `title`: the approved title
   - `body`: the approved body
   - `labels`: the template labels as an array

2. Report back with the issue URL and number:

```text
Issue created: #[number] — [title]
[URL]
```

---

## Hard rules

- **Never create the issue without explicit user approval** — not even if the input is complete and unambiguous
- **Never skip required fields** — if a required field is missing, ask again before proposing
- **Always use `mcp__github__issue_write`** — do not use the GitHub CLI or any other tool
- **Do not invent field values** — only use what the user explicitly provided; leave optional fields blank if the user skips them
- **Keep the body clean** — no extra commentary, no "Created by Claude", no section headers beyond the template fields
