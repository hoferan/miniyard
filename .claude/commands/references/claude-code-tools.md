---
name: claude-code-tools
description: Claude Code tool mapping for superpowers skills. Use when a skill mentions a primitive action and you need to know which Claude Code tool to use.
---

# Claude Code Tool Mapping

When superpowers skills say "dispatch a subagent", "read a file", or "search for a symbol", use these Claude Code tools:

## Core primitives

| Skill action | Claude Code tool |
|---|---|
| Dispatch a subagent | `Agent` tool |
| Read a file | `Read` tool |
| Write a file | `Write` tool |
| Edit a file | `Edit` tool |
| Search for a symbol or pattern | `Grep` tool |
| Find files by name pattern | `Glob` tool |
| Run a shell command | `Bash` tool |
| Fetch a web page | `WebFetch` tool |
| Search the web | `WebSearch` tool |

## Subagent types

| Purpose | subagent_type |
|---|---|
| General implementation or research | `claude` (default) |
| Code review | `claude` |
| Codebase exploration | `Explore` |
| Implementation planning | `Plan` |

## Instructions file

Claude Code reads `CLAUDE.md` in the project root as its instructions file. Project-specific rules, conventions, and workflow definitions go there.

## Skills directory

Slash commands (skills) live in `.claude/commands/`. Each `.md` file in that directory becomes a `/command-name` slash command.

## Context management

Use `/compact` to compress the session when context is getting long (system messages about prior message summarization indicate compression occurred).
