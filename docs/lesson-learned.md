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
