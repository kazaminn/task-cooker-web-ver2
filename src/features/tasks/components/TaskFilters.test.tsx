import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('@/ui/components/Select', () => ({
  Select: ({
    children,
    selectedKey,
    onSelectionChange,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    selectedKey?: string;
    onSelectionChange?: (key: string) => void;
    'aria-label'?: string;
  }) => (
    <label>
      <span>{ariaLabel}</span>
      <select
        aria-label={ariaLabel}
        value={selectedKey}
        onChange={(event) => onSelectionChange?.(event.target.value)}
      >
        {children}
      </select>
    </label>
  ),
  SelectItem: ({ id, children }: { id: string; children: React.ReactNode }) => (
    <option value={id}>{children}</option>
  ),
}));

vi.mock('@/ui/components/SearchField', () => ({
  SearchField: ({
    value,
    onChange,
    ...props
  }: {
    value?: string;
    onChange?: (value: string) => void;
  }) => (
    <input
      {...props}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

vi.mock('@/ui/components/ToggleButtonGroup', () => ({
  ToggleButtonGroup: ({
    children,
    selectedKeys,
    onSelectionChange,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    selectedKeys: Set<string>;
    onSelectionChange?: (keys: Set<string>) => void;
    'aria-label'?: string;
  }) => (
    <div
      aria-label={ariaLabel}
      data-selected={Array.from(selectedKeys).join(',')}
    >
      {React.Children.map(children, (child) => {
        if (
          !React.isValidElement<{ id: string; onPress?: () => void }>(child)
        ) {
          return child;
        }

        return React.cloneElement(child, {
          onPress: () => onSelectionChange?.(new Set([child.props.id])),
        });
      })}
    </div>
  ),
}));

vi.mock('@/ui/components/ToggleButton', () => ({
  ToggleButton: ({
    id,
    children,
    onPress,
  }: {
    id: string;
    children: React.ReactNode;
    onPress?: () => void;
  }) => (
    <button type="button" data-id={id} onClick={onPress}>
      {children}
    </button>
  ),
}));

const { useUIStore } = await import('@/stores/uiStore');
const { FilterBar } = await import('./FilterBar');
const { ViewToggle } = await import('./ViewToggle');

describe('task filters and view toggle', () => {
  beforeEach(() => {
    useUIStore.setState({
      selectedView: 'list',
      filters: {},
      searchQuery: '',
    });
  });

  it('updates status, priority, and search query in the UI store', async () => {
    const user = userEvent.setup();

    render(<FilterBar />);

    await user.selectOptions(
      screen.getByLabelText('ステータスフィルタ'),
      'prep'
    );
    await user.selectOptions(
      screen.getByLabelText('優先順位フィルタ'),
      'urgent'
    );
    await user.type(screen.getByLabelText('タイトル検索'), 'cake');

    expect(useUIStore.getState().filters.status).toEqual(['prep']);
    expect(useUIStore.getState().filters.priority).toEqual(['urgent']);
    expect(useUIStore.getState().searchQuery).toBe('cake');
  });

  it('switches between list and kanban views through the store', async () => {
    const user = userEvent.setup();

    render(<ViewToggle />);

    await user.click(screen.getByRole('button', { name: 'Kanban' }));

    expect(useUIStore.getState().selectedView).toBe('kanban');
  });
});
