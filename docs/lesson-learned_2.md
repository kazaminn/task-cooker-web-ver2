# Task Cooker — Lessons Learned 2 (2026-03-22)

Additional rules derived from the Firebase stabilization pass, the page refactor, and the test hardening work.

## 1. A page is not a dumping ground

A route page should orchestrate data, navigation, and section composition. It should not own every edit state, mutation flow, and UI branch itself. When a page grows into a mixed blob of fetching, derived state, form state, and rendering, bugs hide in the seams and tests become broad but shallow.

Rule:

- Pages compose
- Hooks coordinate logic
- Components render and handle local UI state

## 2. Do not make one feature depend on another feature's UI

Feature boundaries become blurry when one feature imports another feature's visual components just because the data shape happens to fit.

Example:

- Dashboard should not directly depend on a task feature card component unless that component is intentionally promoted to shared UI.

Preferred direction:

- Cross-feature data sharing: hooks, query cache, stores, or typed contracts
- Cross-feature UI sharing: only through explicitly shared components

## 3. Local state is cheaper than global state

Do not reach for Zustand when the state only lives inside one page subtree or one form.

Use local state for:

- edit toggles
- draft text
- delete confirmation
- temporary input values

Use Zustand only when client state must be shared across distant parts of the app or across route boundaries.

## 4. Raw API calls inside pages are architectural debt

If a page directly calls a Firebase-backed API function, the page is now responsible for mutation wiring, invalidation expectations, and failure handling. That is the wrong level of abstraction.

Rule:

- Server mutations should enter through feature hooks such as `useTaskMutations`
- Pages and sections should call those hooks, not raw API functions

## 5. Shared Firestore subscriptions need an explicit ownership model

The Firestore assertion issue was not just "Firebase being flaky." It exposed an ownership bug in the subscription layer.

If subscriptions are shared by query key, the implementation must define:

- who owns the underlying listener
- how data fans out
- how errors fan out
- how teardown is delayed or cancelled

Without that, the first subscriber and the second subscriber do not observe the same truth, and transient mount/unmount churn can corrupt the runtime state.

## 6. "The test suite passes" is not the same as "the feature is covered"

The repository had a green test suite while key areas had zero direct tests:

- task API
- activity API
- task hook
- dashboard sections
- task detail sections

Rule:

- Every major feature needs at least one test at the level where the feature's intent is visible
- A green aggregate suite is meaningless if the changed area has no dedicated test

## 7. Test names must explain intent, not mechanics

A test file should be understandable even to someone who cannot quickly scan implementation details.

Prefer names like:

- "submits quick add through the dashboard hook instead of calling raw api code"
- "confirms deletion before calling the destructive action"

Avoid names that only describe the click sequence or internal implementation detail.

## 8. Stabilize runtime behavior before chasing ideal architecture

There are times when the right move is not the cleanest end-state architecture, but the safest runtime stabilization step.

That happened with:

- Firestore subscription churn
- dashboard loading state
- shared listener behavior

Rule:

- First remove the crash and restore deterministic behavior
- Then refactor toward cleaner abstractions

Do not confuse a temporary stabilization layer with the final design, but do not reject it just because it is not perfect.

## 9. Refactoring without tests is just moving risk around

Once page responsibilities were split into sections and hooks, the new components needed their own tests immediately. Otherwise the refactor would improve readability while silently increasing regression risk.

Rule:

- If you split a large page into smaller units, add tests for the new units in the same change
- The refactor is not complete until the new boundaries are observable in tests
