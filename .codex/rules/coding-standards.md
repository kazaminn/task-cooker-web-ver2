---
description: 'TypeScript/React coding constraints for TaskCooker Web'
alwaysApply: true
---

Full details: @CODINGRULE.md

## Must

- Use `undefined` for empty/missing values. Convert `null` at Firebase boundary only
- Use brand types for IDs (`TaskId`, `ProjectId`, etc.). Exception: `Note.tags` is `string[]`
- Use explicit type annotations for function args, return values, and complex variables
- Use `unknown` + type guards for uncertain types
- Use `react-aria-components` over native HTML5 APIs for interactive patterns
- Use TanStack Query (`useQuery` / `useMutation`) for all data fetching
- Use the project's `tv` function from `tv.ts` for Tailwind variants
- Use `@theme`-registered design tokens via Tailwind utility classes
- Use Zustand for client state, React Hook Form + Zod for forms
- Colocate related logic (component, hook, types) in the same directory
- Limit a single feature to max 3 files: `.tsx` / `.test.tsx` / `.stories.tsx`

## Must Not

- `null` in application code
- `as any` — ever
- Extract `types.ts`, `utils.ts`, `constants.ts`, `hooks.ts` unless genuinely shared across features
- Place files in `src/components/` — use `src/features/` instead
- Use inline `style` prop for decoration (exception: `aria-hidden="true"` pseudo-elements)
- Call `createTV` or `twMerge` directly in components
- Use raw Firebase SDK calls outside of TanStack Query's `queryFn` / `mutationFn`
