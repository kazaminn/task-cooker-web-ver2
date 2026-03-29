---
name: codex-review
description: 'Build and run Codex CLI command for code review. Manual invocation only'
model: haiku
allowed-tools: Bash, Read, Grep, Glob
disable-model-invocation: true
---

Build a Codex CLI command to review current changes.

## Steps

1. **Identify changed files**:

   ```bash
   git diff --name-only HEAD~1
   ```

   Or if uncommitted:

   ```bash
   git diff --name-only
   ```

2. **Build the review prompt** based on changed file types:
   - `.tsx` files -> check CODINGRULE.md compliance, a11y, react-aria usage
   - `.test.tsx` files -> check testing rules (getByRole, userEvent.setup)
   - `.css` / theme files -> check tavern-theme.md compliance
   - `src/api/` files -> check Firebase boundary rules

3. **Output the Codex command** (ready to copy-paste or execute):

```bash
codex --approval-mode plan \
  --prompt "Review the following changed files against the project coding standards.

Rules to check:
- CODINGRULE.md: null forbidden (use undefined), as any forbidden, 3-file rule, react-aria-components preferred
- Testing: getByRole only, userEvent.setup() only, colocated test files
- a11y: semantic HTML, keyboard navigation, ARIA attributes
- Firebase boundary: convert Timestamp/null at boundary layer only

Changed files:
$(git diff --name-only HEAD~1 | tr '\n' ', ')

Report format:
For each file, report PASS / WARN / FAIL with specific line references.
End with overall verdict."
```

4. **Ask the user** whether to execute the command or just display it.

## Notes

- This skill does NOT auto-execute Codex. It prepares the command for the user.
- The user can execute it with `! codex ...` in the Claude Code prompt, or copy-paste to a terminal.
- Codex reads CLAUDE.md and AGENTS.md automatically, so project context is included.
