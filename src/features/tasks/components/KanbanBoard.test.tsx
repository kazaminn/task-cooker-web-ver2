import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task, TaskStatus } from '@/types/types';

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  useTaskMutations: vi.fn(),
}));

vi.mock('../hooks/useTasks', () => ({
  useTaskMutations: mocks.useTaskMutations,
}));

vi.mock('./KanbanColumn', () => ({
  KanbanColumn: ({
    status,
    label,
    tasks,
    onInsert,
    onRootDrop,
  }: {
    status: TaskStatus;
    label: string;
    tasks: Task[];
    onInsert: (ids: string[], key: string, pos: 'before' | 'after') => void;
    onRootDrop: (ids: string[]) => void;
  }) => (
    <div data-testid={`column-${status}`} data-label={label}>
      {tasks.map((t) => (
        <div key={t.id} data-testid={`task-${t.id}`}>
          {t.title}
        </div>
      ))}
      <button
        type="button"
        data-testid={`insert-${status}`}
        onClick={() => onInsert(['task-1'], 'task-2', 'before')}
      >
        insert
      </button>
      <button
        type="button"
        data-testid={`rootdrop-${status}`}
        onClick={() => onRootDrop(['task-1'])}
      >
        rootdrop
      </button>
    </div>
  ),
}));

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    displayId: 1,
    projectRef: 'project-1',
    teamId: 'team-1',
    title: 'Task',
    status: 'order' as TaskStatus,
    priority: 'medium',
    linkedTaskIds: [],
    position: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const { KanbanBoard } = await import('./KanbanBoard');

describe('KanbanBoard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockResolvedValue(undefined);
    mocks.useTaskMutations.mockReturnValue({ update: mocks.update });
  });

  it('renders 4 status columns', () => {
    render(<KanbanBoard tasks={[]} projectId="project-1" teamId="team-1" />);

    expect(screen.getByTestId('column-order')).toBeInTheDocument();
    expect(screen.getByTestId('column-prep')).toBeInTheDocument();
    expect(screen.getByTestId('column-cook')).toBeInTheDocument();
    expect(screen.getByTestId('column-serve')).toBeInTheDocument();
  });

  it('moves task to target column on rootDrop', async () => {
    const tasks = [makeTask({ id: 'task-1', status: 'order', position: 1000 })];

    render(<KanbanBoard tasks={tasks} projectId="project-1" teamId="team-1" />);

    screen.getByTestId('rootdrop-prep').click();

    await waitFor(() => {
      expect(mocks.update).toHaveBeenCalledWith('task-1', {
        status: 'prep',
        position: expect.any(Number),
      });
    });

    // task-1 が prep に移動し order から消えている
    const prepColumn = screen.getByTestId('column-prep');
    expect(within(prepColumn).getByTestId('task-task-1')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('column-order')).queryByTestId('task-task-1')
    ).not.toBeInTheDocument();
  });

  it('updates all changed tasks including sibling position recalc', async () => {
    // insert-prep は onInsert(['task-1'], 'task-2', 'before')
    // task-1 を task-2 の前に挿入 → 両方の position が再計算される
    const tasks = [
      makeTask({ id: 'task-1', status: 'order', position: 1000 }),
      makeTask({ id: 'task-2', status: 'prep', position: 1000 }),
    ];

    render(<KanbanBoard tasks={tasks} projectId="project-1" teamId="team-1" />);

    screen.getByTestId('insert-prep').click();

    await waitFor(() => {
      // task-1: order→prep, position→1000
      expect(mocks.update).toHaveBeenCalledWith('task-1', {
        status: 'prep',
        position: 1000,
      });
      // task-2: prep のまま, position 1000→2000（後ろにずれる）
      expect(mocks.update).toHaveBeenCalledWith('task-2', {
        status: 'prep',
        position: 2000,
      });
    });

    expect(mocks.update).toHaveBeenCalledTimes(2);
  });

  it('rolls back tasks to original columns on update failure', async () => {
    mocks.update.mockRejectedValue(new Error('network error'));

    const tasks = [makeTask({ id: 'task-1', status: 'order', position: 1000 })];

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<KanbanBoard tasks={tasks} projectId="project-1" teamId="team-1" />);

    // task-1 は最初 order にいる
    expect(
      within(screen.getByTestId('column-order')).getByTestId('task-task-1')
    ).toBeInTheDocument();

    // prep に rootDrop → 楽観更新 → 失敗 → rollback
    screen.getByTestId('rootdrop-prep').click();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to move task',
        expect.any(Error)
      );
    });

    // rollback 後: task-1 は order に戻り、prep にはいない
    expect(
      within(screen.getByTestId('column-order')).getByTestId('task-task-1')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('column-prep')).queryByTestId('task-task-1')
    ).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('does not call update when drop causes no changes', async () => {
    // task-1 は既に order にいて、order に rootDrop する → 変化なし
    const tasks = [makeTask({ id: 'task-1', status: 'order', position: 1000 })];

    render(<KanbanBoard tasks={tasks} projectId="project-1" teamId="team-1" />);

    screen.getByTestId('rootdrop-order').click();

    // 少し待って update が呼ばれていないことを確認
    await new Promise((r) => {
      setTimeout(r, 50);
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
