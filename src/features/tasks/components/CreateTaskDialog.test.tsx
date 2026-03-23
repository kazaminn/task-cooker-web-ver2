import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  createMutation: { isPending: false },
  useTaskMutations: vi.fn(),
  useTeam: vi.fn(),
}));

vi.mock('../hooks/useTasks', () => ({
  useTaskMutations: mocks.useTaskMutations,
}));

vi.mock('@/features/teams/hooks/useTeams', () => ({
  useTeam: mocks.useTeam,
}));

vi.mock('@/ui/components/Modal', () => ({
  Modal: ({
    isOpen,
    children,
    onOpenChange,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <button
          type="button"
          data-testid="modal-close-trigger"
          onClick={() => onOpenChange?.(false)}
        >
          close-trigger
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock('@/ui/components/Dialog', () => ({
  Dialog: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    'aria-label'?: string;
  }) => (
    <dialog open aria-label={props['aria-label']}>
      {children}
    </dialog>
  ),
}));

vi.mock('@/ui/components/Button', () => ({
  Button: ({
    children,
    onPress,
    type,
    isDisabled,
    isPending,
    ...rest
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    type?: string;
    isDisabled?: boolean;
    isPending?: boolean;
    variant?: string;
  }) => (
    <button
      type={type === 'submit' ? 'submit' : 'button'}
      onClick={onPress}
      disabled={isDisabled}
      data-pending={isPending}
      {...rest}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/ui/components/TextField', () => ({
  TextField: ({
    label,
    value,
    onChange,
    errorMessage,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    isRequired?: boolean;
    errorMessage?: string;
  }) => (
    <div>
      <label>
        {label}
        <input
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      {errorMessage ? <span role="alert">{errorMessage}</span> : null}
    </div>
  ),
}));

vi.mock('@/ui/components/TextArea', () => ({
  TextArea: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <label>
      {label}
      <textarea
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  ),
}));

vi.mock('@/ui/components/Select', () => ({
  Select: ({
    label,
    children,
    selectedKey,
    onSelectionChange,
  }: {
    label: string;
    children: React.ReactNode;
    selectedKey?: string | null;
    onSelectionChange?: (key: string) => void;
    placeholder?: string;
    isRequired?: boolean;
  }) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={selectedKey ?? ''}
        onChange={(e) => onSelectionChange?.(e.target.value)}
      >
        {children}
      </select>
    </label>
  ),
  SelectItem: ({ id, children }: { id: string; children: React.ReactNode }) => (
    <option value={id}>{children}</option>
  ),
}));

vi.mock('@/ui/components/DatePicker', () => ({
  DatePicker: ({ label }: { label: string }) => (
    <div data-testid="datepicker" aria-label={label} />
  ),
}));

const { CreateTaskDialog } = await import('./CreateTaskDialog');

describe('CreateTaskDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.create.mockResolvedValue('task-new');
    mocks.createMutation = { isPending: false };
    mocks.useTaskMutations.mockReturnValue({
      create: mocks.create,
      createMutation: mocks.createMutation,
    });
    mocks.useTeam.mockReturnValue({ team: { memberIds: ['user-1'] } });
  });

  it('does not render when isOpen is false', () => {
    render(
      <CreateTaskDialog
        isOpen={false}
        onClose={vi.fn()}
        projectId="p-1"
        teamId="t-1"
      />
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders form fields when open', () => {
    render(
      <CreateTaskDialog
        isOpen={true}
        onClose={vi.fn()}
        projectId="p-1"
        teamId="t-1"
      />
    );

    expect(
      screen.getByRole('dialog', { name: '新しい注文を作成' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('タイトル (必須)')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
    expect(screen.getByLabelText('優先順位')).toBeInTheDocument();
  });

  it('submits valid form and calls onClose + onCreated', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onCreated = vi.fn();

    render(
      <CreateTaskDialog
        isOpen={true}
        onClose={onClose}
        onCreated={onCreated}
        projectId="p-1"
        teamId="t-1"
      />
    );

    await user.type(screen.getByLabelText('タイトル (必須)'), 'New Task');
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          status: 'order',
          priority: 'medium',
        })
      );
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
      expect(onCreated).toHaveBeenCalledWith('task-new');
    });
  });

  it('shows error message on submit failure with Error instance', async () => {
    const user = userEvent.setup();
    mocks.create.mockRejectedValue(new Error('Firebase error'));

    render(
      <CreateTaskDialog
        isOpen={true}
        onClose={vi.fn()}
        projectId="p-1"
        teamId="t-1"
      />
    );

    await user.type(screen.getByLabelText('タイトル (必須)'), 'Fail Task');
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Firebase error');
    });
  });

  it('shows generic error for non-Error throws', async () => {
    const user = userEvent.setup();
    mocks.create.mockRejectedValue('unknown');

    render(
      <CreateTaskDialog
        isOpen={true}
        onClose={vi.fn()}
        projectId="p-1"
        teamId="t-1"
      />
    );

    await user.type(screen.getByLabelText('タイトル (必須)'), 'Fail Task');
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '注文の作成に失敗しました。'
      );
    });
  });

  it('clears submit error when modal closes', async () => {
    const user = userEvent.setup();
    mocks.create.mockRejectedValue(new Error('fail'));

    render(
      <CreateTaskDialog
        isOpen={true}
        onClose={vi.fn()}
        projectId="p-1"
        teamId="t-1"
      />
    );

    await user.type(screen.getByLabelText('タイトル (必須)'), 'X');
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('modal-close-trigger'));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('disables cancel button while submitting', () => {
    mocks.createMutation = { isPending: true };
    mocks.useTaskMutations.mockReturnValue({
      create: mocks.create,
      createMutation: mocks.createMutation,
    });

    render(
      <CreateTaskDialog
        isOpen={true}
        onClose={vi.fn()}
        projectId="p-1"
        teamId="t-1"
      />
    );

    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeDisabled();
  });

  it('sets assigneeId to empty string when unassigned is selected', async () => {
    const user = userEvent.setup();

    render(
      <CreateTaskDialog
        isOpen={true}
        onClose={vi.fn()}
        projectId="p-1"
        teamId="t-1"
      />
    );

    await user.selectOptions(screen.getByLabelText('担当者'), 'user-1');
    await user.selectOptions(screen.getByLabelText('担当者'), 'unassigned');

    await user.type(screen.getByLabelText('タイトル (必須)'), 'Test');
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          assigneeId: '',
        })
      );
    });
  });
});
