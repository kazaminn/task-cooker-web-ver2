# Current Progress

## Branch / Stable Point

- Current branch: `fix/task-kanban-dnd`
- Latest stable commit: `2f8feef`
- Stable commit message: `🛠️ fix(firebase): stabilize firestore subscriptions and dashboard`

## Current Focus

- Primary issue context on GitHub: `#21` Kanban view + DnD
- Related areas touched during this session:
  - `#30` Dashboard main section
  - `#31` Dashboard activity + Quick Add
  - `#32` Contribution graph
  - `#33` Profile page
- Previous session review context also included:
  - `#3` `useFirestoreSubscription`
  - `#4` auth hook + `AuthGuard`
  - `#7` `TopNav + AppLayout`
  - `#9` Login / Signup

## What Is Stable Now

- Firebase assertion on dashboard route was mitigated enough that obvious runtime errors are no longer surfacing.
- Dashboard data flow was adjusted so personal activity data and global activity feed are separated.
- Project page breadcrumb/header layout was adjusted:
  - breadcrumb remains in `ProjectLayout`
  - project title / slug / status / overview moved into project header
  - right-side metadata cards live in `ProjectOverviewPage`
- `pnpm typecheck` passed
- `pnpm build` passed at the stable commit above

## Uncommitted Changes

There are still local changes after `2f8feef` in these files:

- `src/hooks/useFirestoreSubscription.ts`
- `src/hooks/useFirestoreSubscription.test.ts`

These changes are intended to stabilize shared Firestore listeners further.

### Intent of the local `useFirestoreSubscription` changes

- Share a single Firestore listener per query key
- Fan out `data` and `error` to all hook instances using the same key
- Keep the delayed teardown to reduce unsubscribe/resubscribe churn

### Local verification for the uncommitted changes

- `pnpm typecheck`
- `pnpm vitest run src/hooks/useFirestoreSubscription.test.ts --mode test`

## Remaining Risk

- `useFirestoreSubscription` is still the main technical risk area.
- Current implementation prioritizes runtime stability over ideal TanStack Query architecture.
- Shared subscription behavior is improved locally, but the hook still uses a non-resolving `queryFn`, so future cleanup should revisit the design rather than only patching symptoms.

## Notes For Next Session

- If stability is the priority, start from commit `2f8feef` and decide whether to keep or separately commit the current local `useFirestoreSubscription` changes.
- If dashboard data still appears stale, inspect `useDashboardData` and `useFirestoreSubscription` together before touching UI components.
- `gh pr list` was empty when checked, so work is currently easier to track by issue rather than PR.
