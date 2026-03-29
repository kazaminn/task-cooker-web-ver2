# .codex

`.claude/` is the source of truth. This directory is a Codex-oriented mirror of the parts that are still useful here.

## What Is Kept

- `rules/`: direct mirrors of the canonical project rules
- `skills/`: reusable task workflows that still make sense in Codex

## What Was Removed

- `agents/`: Claude-specific agent manifests were removed
  - Codex already has built-in exploration, implementation, review, and execution flows
  - keeping parallel agent prompts here would duplicate built-in behavior and drift quickly
- `skills/codex-review/`: removed
  - it existed only to make Claude generate a Codex CLI command
  - inside Codex, that indirection is pointless

## How To Maintain This Mirror

1. Update `.claude/` first.
2. Mirror only assets that still help Codex directly.
3. Prefer deletion over stale duplication when a Codex built-in feature already covers the workflow.

## Current Skill Set

- `a11y-audit`
- `commit-msg`
- `component-scaffold`
- `coverage-report`
- `handoff-writer`
- `playwright-gen`
- `project-manager`
- `storybook-gen`
- `tailwindcss-v4`
