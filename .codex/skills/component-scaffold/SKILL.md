---
name: component-scaffold
description: 'Generate feature component scaffold (3-file set). Use when creating new components'
model: haiku
allowed-tools: Read, Write, Bash, Glob
disable-model-invocation: true
argument-hint: '<feature>/<ComponentName> (e.g., tasks/TaskPriorityBadge)'
---

Generate a 3-file component scaffold following project conventions.

## Usage

Task input: `<feature>/<ComponentName>`

Example: `tasks/TaskPriorityBadge`

## Steps

1. **Verify directory exists**:

   ```bash
   ls src/features/$FEATURE/components/
   ```

2. **Read existing components** in the same feature for pattern reference:

   ```bash
   ls src/features/$FEATURE/components/*.tsx | head -3
   ```

   Read one to understand the local patterns (tv usage, imports, etc.)

3. **Generate 3 files**:

### `{Component}.tsx`

```tsx
import { composeProps, tv } from '@/libs/tv';

const styles = tv({
  base: '',
  variants: {},
});

interface {Component}Props {
  // props here
}

export function {Component}({ ...props }: {Component}Props) {
  return (
    <div className={styles()}>
      {/* implementation */}
    </div>
  );
}
```

### `{Component}.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { {Component} } from './{Component}';

describe('{Component}', () => {
  it('renders correctly', () => {
    render(<{Component} />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
});
```

### `{Component}.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { {Component} } from './{Component}';

const meta = {
  component: {Component},
} satisfies Meta<typeof {Component}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

## Rules

- Place all files in `src/features/{feature}/components/`
- Use `getByRole` in tests, never `getByTestId`
- Use `userEvent.setup()`, never `fireEvent`
- Import `tv` from `@/libs/tv`
- Use semantic HTML elements (not div soup)
