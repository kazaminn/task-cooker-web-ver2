# Current Progress

## Branch / Stable Point

- Current branch: `fix/task-kanban-dnd`
- Latest stable commit: `2f8feef`
- Stable commit message: `🛠️ fix(firebase): stabilize firestore subscriptions and dashboard`

## Current Focus

- Primary issue context on GitHub: `#21` Kanban view + DnD
- Current implementation follow-up: `#20` Task list view and `#22` FilterBar/ViewToggle/SearchField
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
- `src/features/tasks/components/TaskListView.tsx`
- `src/features/tasks/components/FilterBar.tsx`
- `src/features/tasks/components/ViewToggle.tsx`
- `src/features/projects/pages/ProjectTasksPage.tsx`
- `src/features/tasks/components/TaskListView.test.tsx`
- `src/features/tasks/components/TaskFilters.test.tsx`
- `src/types/constants.ts`

These changes are intended to stabilize shared Firestore listeners further.

### Intent of the local task UI changes

- Replace list-mode `TaskCard` reuse with issue-specific `TaskRow` rendering in `TaskListView`
- Move task title search into `FilterBar` so filters/search live in one feature-level control group
- Keep `ViewToggle` wired to Zustand with explicit accessibility labeling
- Add focused tests for list rows and filter/view state wiring

### Intent of the local `useFirestoreSubscription` changes

- Share a single Firestore listener per query key
- Fan out `data` and `error` to all hook instances using the same key
- Keep the delayed teardown to reduce unsubscribe/resubscribe churn

### Local verification for the uncommitted changes

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm vitest run src/hooks/useFirestoreSubscription.test.ts --mode test`
- `pnpm vitest run src/features/tasks/components/TaskListView.test.tsx src/features/tasks/components/TaskFilters.test.tsx --mode test`

## Remaining Risk

- `useFirestoreSubscription` is still the main technical risk area.
- Current implementation prioritizes runtime stability over ideal TanStack Query architecture.
- Shared subscription behavior is improved locally, but the hook still uses a non-resolving `queryFn`, so future cleanup should revisit the design rather than only patching symptoms.

## Notes For Next Session

- If stability is the priority, start from commit `2f8feef` and decide whether to keep or separately commit the current local `useFirestoreSubscription` changes.
- If dashboard data still appears stale, inspect `useDashboardData` and `useFirestoreSubscription` together before touching UI components.
- `gh pr list` was empty when checked, so work is currently easier to track by issue rather than PR.
