---
description: 'Testing rules and conventions for TaskCooker Web'
alwaysApply: true
---

Full details: @docs/testing-requirements.md

## Rules

- 1 feature = tests in the same PR. No deferral
- Zero-test completion reports are forbidden
- Completion format: "テスト N 件追加、全 M 件パス、カバレッジ X%"
- File placement: `*.test.tsx` colocated with source (NO `__tests__/` directories)
- Use `getByRole` exclusively. `getByTestId` is forbidden
- Use `userEvent.setup()` exclusively. `fireEvent` is forbidden
- Test DnD via keyboard: Tab, Space, ArrowRight
- Firestore: use emulator in api tests, mock api layer in hooks tests
- "I checked visually" is not a valid review

## Coverage Targets

- api/: 80-85%
- hooks/: 75-80%
- components/: 60-70%
- pages/: 50-60%
- libs/ + types/: 90%
- Overall: 80% minimum

## Tools

- Vitest (unit/integration), React Testing Library, Playwright (E2E)
- @storybook/addon-a11y (axe-core) for accessibility in stories
