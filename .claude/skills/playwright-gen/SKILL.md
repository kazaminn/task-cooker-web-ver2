---
name: playwright-gen
description: 'Generate Playwright E2E test skeleton. Use when adding pages/flows or setting up E2E tests'
model: sonnet
allowed-tools: Read, Write, Edit, Grep, Glob
argument-hint: '<scenario> (e.g., auth, task-flow, theme, a11y)'
---

Generate a Playwright E2E test skeleton for TaskCooker Web.

## Predefined Scenarios (from docs/testing-requirements.md)

- `auth` — auth.spec.ts: login, logout, redirect, session persistence
- `task-flow` — task-flow.spec.ts: create, edit, move (kanban DnD via keyboard), delete
- `theme` — theme.spec.ts: tavern-light/dark toggle, persistence, visual regression
- `a11y` — a11y.spec.ts: axe-core scan per page, keyboard-only navigation flow

## Steps

1. **Read existing E2E tests** (if any):

   ```bash
   ls tests/e2e/ 2>/dev/null || echo "No E2E directory yet"
   ```

2. **Read the relevant page/component** to understand the UI structure

3. **Generate using Page Object Model pattern**

## Template

### Page Object (`tests/e2e/pages/{Page}Page.ts`)

```typescript
import { type Page, type Locator } from '@playwright/test';

export class {Page}Page {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: '...' });
  }

  async goto() {
    await this.page.goto('/{path}');
  }
}
```

### Test File (`tests/e2e/{scenario}.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import { {Page}Page } from './pages/{Page}Page';

test.describe('{scenario}', () => {
  test('{description}', async ({ page }) => {
    const pageObj = new {Page}Page(page);
    await pageObj.goto();
    // assertions
  });
});
```

### a11y Test Pattern

```typescript
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test('should have no a11y violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Theme Test Pattern

```typescript
test('theme toggle persists', async ({ page }) => {
  await page.goto('/');
  // Toggle to dark
  await page.getByRole('button', { name: /theme/i }).click();
  await expect(page.locator('[data-theme="tavern-dark"]')).toBeVisible();
  // Reload and verify persistence
  await page.reload();
  await expect(page.locator('[data-theme="tavern-dark"]')).toBeVisible();
});
```

## Rules

- Place all files in `tests/e2e/`
- Use `getByRole` locators (consistent with unit test rules)
- Use Page Object Model for reusable page interactions
- Include keyboard navigation tests for DnD and complex interactions
- Include both tavern-light and tavern-dark in visual tests
