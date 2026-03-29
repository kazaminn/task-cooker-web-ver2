---
name: commit-msg
description: 'Generate English commit message from git diff. Use before committing'
model: haiku
allowed-tools: Bash, Read, Grep
disable-model-invocation: true
---

Generate a commit message from the current changes.

## Steps

1. Read the staged changes:

   ```bash
   git diff --cached --stat
   git diff --cached
   ```

   If nothing is staged, read unstaged changes with `git diff`.

2. Read the commitlint config for allowed types:

   ```bash
   cat commitlint.config.js
   ```

3. Generate a commit message following this format:

```
<emoji> <type>(<scope>): <subject>

<body>
```

### Subject Rules

- English, imperative mood ("add", "fix", "update" — not "added", "fixes")
- Max 50 characters (excluding emoji+type prefix)
- No period at end
- Scope is optional but recommended

### Body Rules

- English
- Explain **why**, not what (the diff shows what)
- Wrap at 72 characters
- Separate from subject with blank line

### Emoji-Type Mapping (from CONTRIBUTING.md)

| Emoji | Type     |
| ----- | -------- |
| 🎉    | init     |
| ✨    | feat     |
| 🛠️    | fix      |
| ♻️    | refactor |
| 🚀    | perf     |
| 🧪    | test     |
| 💄    | style    |
| 📝    | docs     |
| 🧹    | chore    |
| 🚧    | wip      |

4. Output the message in a code block for easy copy-paste, and suggest the git command:

   ```bash
   git commit -m "$(cat <<'EOF'
   <emoji> <type>(<scope>): <subject>

   <body>
   EOF
   )"
   ```
