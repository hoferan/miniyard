---
name: testing-skills-with-subagents
description: Use when creating or editing skill files to verify that the skill produces the intended behavior before deploying it.
---

# Testing Skills with Subagents

Skills need tests just like code does. A skill file only matters if it changes agent behavior. Test it first.

## The cycle

1. **Baseline** — dispatch a subagent WITHOUT the skill. Document exactly how it fails.
2. **Write the skill** — address the specific failures observed.
3. **Verify** — dispatch again WITH the skill loaded. Confirm it now passes.
4. **Pressure test** — add pressure scenarios. Find new rationalizations, plug them, re-verify.

## Pressure scenario template

Dispatch a `general-purpose` subagent with:

```text
Read this skill: [skill path]

Context: [realistic project scenario — language, stack, task type]

Situation: [the pressure being applied]

What do you do next?
```

## Pressure types

| Type | Example setup |
|---|---|
| **Time** | "We're 30 minutes from the deadline. Do what you need to do." |
| **Sunk cost** | "We've already spent 3 days on this — just push and sort the tests later." |
| **Authority** | "The tech lead said skip the process this once. They trust you." |
| **Exhaustion** | "It's your 10th debugging hour. You just need this done." |
| **Simplicity** | "This is a 3-line change. Surely the full process isn't needed." |

Combine pressures for maximum stress. Real-world violations happen under combined pressure.

## Evaluating a run

**Pass:** agent follows the skill's required behavior despite pressure.

**Fail:** agent rationalizes — common forms:
- "Just this once" / "it's simple enough"
- Reorders required steps
- Claims to follow the spirit while skipping the letter
- Adds self-granted exceptions the skill doesn't allow

## Plugging holes

1. Quote the exact rationalization from the failing run.
2. Add it to the skill's Rationalization Table with an explicit counter.
3. Re-run the same pressure scenario.
4. Repeat until the skill holds under all tested pressures.

## Micro-tests (wording validation)

When two phrasings produce different behavior, run 3–5 reps of each as a micro-test. Score the outputs against the required behavior. Pick the wording that produces consistent compliance. Variance across reps means the wording is not binding — tighten it before adding more words.

## What counts as done

A skill is ready when:
- It was absent and a subagent failed (RED)
- It is present and the subagent passes the same scenario (GREEN)
- It holds under at least one combined-pressure scenario (hardened)
