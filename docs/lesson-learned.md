# Task Cooker — Lessons Learned (2026-03-21)

Rules derived from actual incidents. Every item below was missing from the codebase rules and caused real damage.

## 1. Prefer `undefined` over `null`

Do not use `null` in application-level code. Use `undefined` to represent "not yet fetched," "empty," or "does not exist." When an external API (e.g., Firebase SDK) returns `null`, convert it to `undefined` at the boundary layer (converters, API wrappers). This ensures consistent state transitions and prevents `null`/`undefined` mix that makes type narrowing unreliable.

## 2. Use the project's `tv` function for Tailwind Variants

Import `tv`, `composeProps`, and `resolveRenderPropsChildren` from the nearest `tv.ts` or the shared package. Do not call `createTV` or `twMerge` directly in components. `composeProps()` handles React Aria render props merging. `resolveRenderPropsChildren()` handles children that may be a function.

## 3. Colocate files — do not over-split

A single feature should not force the reader to open more than 3 files to understand its flow. Keep related logic (component, hook, types) colocated. Do not extract `utils.ts`, `hooks.ts`, `types.ts`, `constants.ts` into separate files unless they are genuinely shared across multiple features. The reader may have low vision — every file hop is cognitive load.

## 4. Every feature must have at least one test

Zero-test CI passes are false greens. Each feature directory must contain at least one `.test.ts(x)` file that verifies the primary behavior. If Vitest config changes break test discovery, the CI must fail, not silently pass with 0 tests.

## 5. Convert Firebase SDK types at the boundary

Firestore `DocumentSnapshot`, `Timestamp`, and nullable fields must be converted in the converter/API layer. Components and hooks must never receive raw Firebase types. This includes converting `Timestamp` to `Date`, `null` to `undefined`, and stripping Firestore metadata.

## 6. Error handlers are not optional

Every `onSnapshot()` must have an `onError` callback. Every `Promise` chain must have `.catch()` or be wrapped in try/catch. Swallowing errors causes cascade crashes (e.g., Firestore "Unexpected state" from unhandled permission-denied).

## 7. Read skill files before writing code

Before implementing with any library or service, read the corresponding skill file if one exists in the global agents skill directory. "Knowing" a library and "using it correctly in this project" are different things. Skill files contain project-specific patterns and constraints.

## 8. Use react-aria-components over native HTML5 APIs

When react-aria-components provides a component for the required interaction (DnD, Dialog, Menu, etc.), use it instead of native HTML5 APIs. Native HTML5 drag-and-drop does not provide keyboard accessibility. React Aria components are accessible by default and align with the project's a11y-first principle.

## 9. Format with tooling, not discipline

Code formatting (semicolons, quotes, indentation, import order) is enforced by Prettier and ESLint. Do not rely on developers or AI to manually follow formatting rules. Run `pnpm format` or let the pre-commit hook handle it. The CodeStyle Doc should not duplicate what `.prettierrc` and `.eslintrc` already enforce.

## 10. JSDoc is not required — code should speak for itself

Do not add JSDoc comments to functions whose name, parameters, and return type already explain what they do. Comments are for "why," not "what." If the code needs a comment to explain what it does, simplify the code first.

---

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
