---
description: 'Firebase SDK boundary rules — convert at the edge, never leak raw types'
globs:
  - 'src/api/**'
  - 'src/features/**/api/**'
---

## Conversion Rules

- `Timestamp` -> `Date` at the converter layer
- `null` -> `undefined` at the converter layer
- Strip Firestore metadata before returning to hooks/components
- Components and hooks must never receive raw Firebase types (`DocumentSnapshot`, `Timestamp`, etc.)

## Error Handling

- Every `onSnapshot()` must have an `onError` callback
- Every `Promise` chain must have `.catch()` or be wrapped in try/catch
- Swallowing errors silently is forbidden — it causes cascade crashes

## StorageService (Phase 5+7)

- Define types and interfaces only — do not write implementation
- See @docs/data-models-v2.md for StorageService interface spec
