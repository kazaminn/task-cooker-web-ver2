---
name: coverage-report
description: 'Run coverage and generate handoff-format report. Use to check test coverage status'
model: haiku
allowed-tools: Bash, Read, Grep
disable-model-invocation: true
---

Run test coverage and produce a report in handoff format.

## Steps

1. **Run coverage**:

   ```bash
   pnpm run test -- --coverage --reporter=text 2>&1
   ```

2. **Read target thresholds** from docs/testing-requirements.md

3. **Read previous report** from the most recent `docs/handoff/phase-*.md` that contains a `## coverage report` section

4. **Output report** comparing current vs target vs previous:

```markdown
## Coverage Report ({date})

### Summary

| Metric     | Current | Target | Previous | Delta |
| ---------- | ------- | ------ | -------- | ----- |
| Statements | X%      | 80%    | Y%       | +Z%   |
| Branches   | X%      | -      | Y%       | +Z%   |
| Functions  | X%      | -      | Y%       | +Z%   |
| Lines      | X%      | 80%    | Y%       | +Z%   |

### By Module (vs targets)

| Module      | Current | Target | Status    |
| ----------- | ------- | ------ | --------- |
| api/        | X%      | 80-85% | PASS/FAIL |
| hooks/      | X%      | 75-80% | PASS/FAIL |
| components/ | X%      | 60-70% | PASS/FAIL |
| pages/      | X%      | 50-60% | PASS/FAIL |
| libs/types/ | X%      | 90%    | PASS/FAIL |

### Uncovered Files (0% coverage)

- {list files with 0% if any}
```

5. **Output in handoff-pasteable format** (ready to append to a phase-\*.md file)
