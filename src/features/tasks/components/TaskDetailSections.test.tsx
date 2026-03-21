import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskDangerZone } from './TaskDangerZone';
import { TaskDescriptionEditor } from './TaskDescriptionEditor';
import { TaskTitleEditor } from './TaskTitleEditor';

vi.mock('@/ui/components/Button', () => ({
  Button: ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
  }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
}));

vi.mock('@/ui/components/TextField', () => ({
  TextField: ({
    value,
    onChange,
    ...props
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <input
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock('@/ui/components/TextArea', () => ({
  TextArea: ({
    value,
    onChange,
    ...props
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

describe('task detail sections', () => {
  it('saves the edited task title through the provided action callback', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskTitleEditor
        onSave={onSave}
        task={{
          id: 'task-1',
          displayId: 5,
          projectRef: 'project-1',
          teamId: 'team-1',
          title: 'Old title',
          description: '',
          status: 'order',
          priority: 'medium',
          linkedTaskIds: [],
          position: 1000,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: '編集' }));
    await user.clear(screen.getByLabelText('タイトル'));
    await user.type(screen.getByLabelText('タイトル'), 'New title');
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(onSave).toHaveBeenCalledWith('New title');
  });

  it('confirms deletion before calling the destructive action', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(<TaskDangerZone onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: '削除' }));
    await user.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  it('saves task description edits and explains when no description exists yet', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      <TaskDescriptionEditor description={undefined} onSave={onSave} />
    );

    expect(screen.getByText('まだ説明がありません')).toBeInTheDocument();

    rerender(
      <TaskDescriptionEditor
        description="Current description"
        onSave={onSave}
      />
    );

    await user.click(screen.getByRole('button', { name: '編集' }));
    await user.clear(screen.getByLabelText('説明'));
    await user.type(screen.getByLabelText('説明'), 'Updated description');
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(onSave).toHaveBeenCalledWith('Updated description');
  });
});
