---
description: 'Branch and PR workflow enforcement for AI agents'
alwaysApply: true
---

Full details: @CONTRIBUTING.md

## Rules

- AI agents (Claude Code / Codex) are **forbidden from pushing directly to main**
- Create a feature branch before starting work: `<type>/<short-description>` (e.g., `feat/tavern-dark-theme`)
- PR title must follow commitlint format: `<emoji> <type>(<scope>): <subject>`
- Create PR with `gh pr create` and wait for user to merge
- Keep PRs small and reviewable: 1 PR = 1 feature + tests

## Commit Format

`<emoji> <type>(<scope>): <subject>`

Allowed types: init, feat, fix, refactor, perf, test, style, docs, chore, wip

See CONTRIBUTING.md for emoji mapping.

## Pre-commit / Pre-push

- commit-msg hook: `commitlint --edit`
- pre-commit hook: `pnpm run precommit` (lint-staged)
- pre-push hook: `pnpm run test`
