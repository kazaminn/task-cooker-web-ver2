#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="${ROOT_DIR}/.claude"
CODEX_DIR="${ROOT_DIR}/.codex"

readonly ROOT_DIR
readonly CLAUDE_DIR
readonly CODEX_DIR

SKILLS=(
  "a11y-audit"
  "commit-msg"
  "component-scaffold"
  "coverage-report"
  "handoff-writer"
  "playwright-gen"
  "project-manager"
  "storybook-gen"
  "tailwindcss-v4"
)

log() {
  printf '[sync-codex] %s\n' "$1"
}

require_dir() {
  local path="$1"

  if [[ ! -d "$path" ]]; then
    printf 'Missing directory: %s\n' "$path" >&2
    exit 1
  fi
}

rewrite_skill_files() {
  local skill_dir

  skill_dir="${CODEX_DIR}/skills/a11y-audit/SKILL.md"
  if [[ -f "$skill_dir" ]]; then
    sed -i "s|@\\.claude/rules/a11y\\.md|\\./.codex/rules/a11y.md|g" "$skill_dir"
  fi

  skill_dir="${CODEX_DIR}/skills/component-scaffold/SKILL.md"
  if [[ -f "$skill_dir" ]]; then
    sed -i \
      -e '/^## Usage$/,/^## Steps$/{s|`/component-scaffold <feature>/<ComponentName>`|Task input: `<feature>/<ComponentName>`|g; s|Example: `/component-scaffold tasks/TaskPriorityBadge`|Example: `tasks/TaskPriorityBadge`|g;}' \
      "$skill_dir"
  fi

  skill_dir="${CODEX_DIR}/skills/handoff-writer/SKILL.md"
  if [[ -f "$skill_dir" ]]; then
    sed -i \
      -e '/^## Usage$/,/^## Steps$/{s|`/handoff-writer <phase-id> <title>`|Task input: `<phase-id> <title>`|g; s|Example: `/handoff-writer 6a テスト拡充`|Example: `6a テスト拡充`|g;}' \
      "$skill_dir"
  fi

  skill_dir="${CODEX_DIR}/skills/tailwindcss-v4/SKILL.md"
  if [[ -f "$skill_dir" ]]; then
    sed -i "s|人間が読んでも AI が読んでも|人間が読んでも Codex が読んでも|g" "$skill_dir"
  fi
}

write_readme() {
  cat > "${CODEX_DIR}/README.md" <<'EOF'
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
2. Run `scripts/sync-codex.sh`.
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
EOF
}

main() {
  local skill

  require_dir "$CLAUDE_DIR"
  require_dir "${CLAUDE_DIR}/rules"
  require_dir "${CLAUDE_DIR}/skills"

  rm -rf "$CODEX_DIR"
  mkdir -p "${CODEX_DIR}/rules" "${CODEX_DIR}/skills"

  log "Copying rules"
  cp -R "${CLAUDE_DIR}/rules/." "${CODEX_DIR}/rules/"

  log "Copying skills"
  for skill in "${SKILLS[@]}"; do
    require_dir "${CLAUDE_DIR}/skills/${skill}"
    cp -R "${CLAUDE_DIR}/skills/${skill}" "${CODEX_DIR}/skills/"
  done

  rewrite_skill_files
  write_readme

  log "Rebuilt ${CODEX_DIR}"
}

main "$@"
