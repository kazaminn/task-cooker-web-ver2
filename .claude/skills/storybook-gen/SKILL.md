---
name: storybook-gen
description: 'Auto-generate .stories.tsx from components. Use when adding/updating components or setting up Storybook'
model: sonnet
allowed-tools: Read, Write, Edit, Grep, Glob
argument-hint: '<path-to-component> (e.g., src/features/tasks/components/TaskCard.tsx)'
---

Generate a Storybook story file for the given component.

## Steps

1. **Read the component** at `$ARGUMENTS` to extract:
   - Props interface / type
   - `tv()` variant definitions (slots, variants, defaultVariants)
   - react-aria render props usage
   - Internal state and interactions

2. **Read existing stories** for pattern reference:

   ```bash
   find src -name "*.stories.tsx" | head -5
   ```

3. **Generate `{Component}.stories.tsx`** colocated with the source file.

## Required Variants

Every story file must include these stories:

- **Default**: default props, tavern-light theme
- **DarkTheme**: same props, wrapped with `data-theme="tavern-dark"`
- **Empty**: empty/no-data state
- **Loading**: loading/skeleton state (if applicable)
- **Error**: error state (if applicable)

## Template

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';

const meta = {
  component: Component,
  decorators: [
    (Story, context) => (
      <div data-theme={context.globals.theme || 'tavern-light'}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    /* ... */
  },
};

export const DarkTheme: Story = {
  args: {
    /* ... */
  },
  globals: { theme: 'tavern-dark' },
};
```

## Rules

- Colocate: place story file next to source (`{Component}.stories.tsx`)
- Use `satisfies Meta<typeof Component>` for type safety
- Generate `tv()` variant stories from the component's variant definitions
- Handle react-aria render props correctly in args
- Do NOT add JSDoc or excessive comments
