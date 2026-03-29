---
name: handoff-writer
description: 'Generate phase handoff document in docs/handoff/. Use at phase completion or agent-to-agent handoff'
model: sonnet
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
argument-hint: '<phase-id> <title> (e.g., 6a test expansion)'
---

Generate a phase handoff document for TaskCooker Web.

## Usage

`/handoff-writer <phase-id> <title>`

Example: `/handoff-writer 6a テスト拡充`

## Steps

1. **Read existing handoffs** to understand format and get previous phase context:

   ```bash
   ls docs/handoff/
   ```

   Read the most recent phase file to extract "前フェーズからの引き継ぎ" context.

2. **Gather completed work** from git history:

   ```bash
   git log --oneline --since="2 weeks ago"
   gh pr list --state merged --limit 20
   ```

3. **Check coverage** (if available):

   ```bash
   pnpm run test -- --coverage --reporter=text 2>&1 | tail -40
   ```

4. **Write the handoff document** at `docs/handoff/phase-$PHASE_ID.md`

## Template (strict — follow existing format exactly)

```markdown
# Phase {id}: {title}

開始: {YYYY-MM-DD}
status: order

## order (未着手)

- [ ] {item}

## prep (仕込み中)

（なし）

## cook (調理中)

（なし）

## serve (提供済み)

（なし）

## 前フェーズ ({prev_id}) からの引き継ぎ

- {context from previous phase's serve + notes}

## メモ

- {important implementation details, warnings, metrics}
```

## Rules

- Written in Japanese (matching existing handoffs)
- Status uses cooking metaphor: order/prep/cook/serve
- Serve items include the actor: (Code), (Codex), (ユーザー)
- Include issue numbers where applicable (#N)
- Include coverage report if available
- Do NOT invent items — only include what is verified from git log / PRs
