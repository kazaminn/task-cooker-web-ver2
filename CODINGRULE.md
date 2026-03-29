# Task Cooker Code Style Guide

All code generated must strictly adhere to the following rules. This guide covers decisions that require human or AI judgment — formatting enforced by tooling (Prettier, ESLint) is intentionally omitted.

## 1. Code Formatting

All code must be formatted with Prettier before commit. Run `pnpm format` or rely on the pre-commit hook. Do not manually enforce formatting rules — let the toolchain handle it.

## 2. Core Principles

- **SRP (Single Responsibility Principle)**: Each function, component, or file must have a single, well-defined purpose. But see §4 on colocation — SRP does not mean "split everything into separate files."

- **DRY (Don't Repeat Yourself)**: Abstract repetitive code into reusable components, custom hooks, or utility functions. Prioritize reuse over duplication.

- **KISS (Keep It Simple, Stupid)**: Code must be simple, direct, and easy to understand at a glance. If the code needs a comment to explain what it does, simplify the code first. Comments are for "why," not "what."

## 3. TypeScript Rules

- **Strict Mode**: Explicitly handle `null`, `undefined`, and all strict type checks.

- **Prefer `undefined` over `null`**: Do not use `null` in application-level code. Use `undefined` to represent "not yet fetched," "empty," or "does not exist." When an external API (e.g., Firebase SDK) returns `null`, convert it to `undefined` at the boundary layer (converters, API wrappers).

- **Explicit Types**: Use explicit type annotations for function arguments, return values, and complex variables. Rely on type inference only for simple, obvious cases.

- **`any` is forbidden**: Use `unknown` for data of uncertain type and narrow it with type guards.

- **Union Types**: Use union types and discriminated unions to represent values that can be one of several types.

- **Type Guards**: Use `typeof`, `instanceof`, and assertion functions to narrow types within conditional blocks.

## 4. File Structure and Colocation

- **Colocate by feature**: Keep related logic (component, hook, types) in the same directory. Do not extract `utils.ts`, `hooks.ts`, `types.ts`, `constants.ts` into separate files unless they are genuinely shared across multiple features.

- **3-file rule**: A single feature should not force the reader to open more than 3 files to understand its flow. The reader may have low vision — every file hop is cognitive load.

- **JSDoc is not required**: Do not add JSDoc to functions whose name, parameters, and return type already explain what they do.

## 5. React Components

- **Logic Separation**: Use **Zustand** for client state, **TanStack Query** for server state, and **React Hook Form + Zod** for form validation. Do not embed complex business logic or data fetching directly inside presentational components.

- **TanStack Query is mandatory**: All data fetching and mutations must go through `useQuery` and `useMutation`. Do not use raw Firebase SDK calls (`getDoc`, `setDoc`, `updateDoc`) directly in components or hooks outside of TanStack Query's `queryFn` / `mutationFn`.

- **react-aria-components first**: When `react-aria-components` provides a component for the required interaction (DnD, Dialog, Menu, ComboBox, etc.), use it instead of native HTML5 APIs or third-party alternatives. Native HTML5 drag-and-drop does not provide keyboard accessibility.

## 6. Tailwind CSS

- **Utility-first**: The primary method for styling is Tailwind utility classes.

- **Use the project's `tv` function**: Import `tv`, `composeProps`, and `resolveRenderPropsChildren` from the nearest `tv.ts` or the shared package. Do not call `createTV` or `twMerge` directly in components.
  - `composeProps()` merges Tailwind variant classes with consumer-provided `className`, handling React Aria render props.
  - `resolveRenderPropsChildren()` handles children that may be a ReactNode or a render props function.

- **`tailwind-variants`**: Use it to create reusable component variants. Avoid overly granular variants that are just aliases for single utility classes.

- **Readability**: Break long lists of Tailwind classes into multiple lines to prevent horizontal scrolling.

- **No inline styles**: Do not use the `style` prop for decoration. Use `@theme`-registered design tokens via Tailwind utility classes instead. The only exception is decorative pseudo-element patterns accompanied by `aria-hidden="true"`.

## 7. Accessibility

All components must be accessible by default.

- **Semantic HTML**: Use `<button>`, `<nav>`, `<form>`, etc. instead of generic `div` and `span`.

- **Keyboard Navigation**: All interactive elements must be fully operable using only the keyboard. Do not manipulate `tabindex` in a way that breaks natural tab order.

- **Image and Icon Accessibility**: Provide meaningful `alt` for informational images, empty `alt=""` for decorative ones. Use `aria-label` for icons without visible text labels.

- **ARIA**: Use appropriate ARIA attributes when semantic HTML alone is insufficient (`aria-expanded`, `aria-live`, `role`, etc.).

- **Contrast and Readability**: Ensure sufficient color contrast. Text must be legible and font sizes scalable.

## 8. Firebase Boundary Rules

- **Convert at the boundary**: Firestore `DocumentSnapshot`, `Timestamp`, and nullable fields must be converted in the converter/API layer. Components and hooks must never receive raw Firebase types.

- **Type conversions**: `Timestamp` → `Date`, `null` → `undefined`, strip Firestore metadata.

- **Error handlers are not optional**: Every `onSnapshot()` must have an `onError` callback. Every `Promise` chain must have `.catch()` or be in try/catch. Swallowing errors causes cascade crashes.

## 9. Testing

- **Every feature must have at least one test**: Zero-test CI passes are false greens. Each feature directory must contain at least one `.test.ts(x)` file that verifies primary behavior.

- **CI must be verified by a human**: After push, check GitHub Actions results manually. Confirm the test count is not zero.

## 10. Working with AI Agents

- **Read skill files before writing code**: Before implementing with any library or service, read the corresponding skill file if one exists. "Knowing" a library and "using it correctly in this project" are different things.

- **Formatting is the toolchain's job**: Do not ask AI to follow formatting rules manually. Let Prettier and ESLint enforce them.

## 11. Exception Handling

- **ESLint ignore**: Respect existing `// eslint-disable-next-line` comments.

- **New exceptions**: When adding new exception rules, clearly describe the reason and indicate whether they are temporary or permanent.
