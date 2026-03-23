import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task, TaskStatus } from '@/types/types';
import { moveTasks } from './KanbanBoard';

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

describe('moveTasks (pure function)', () => {
  const tasks: Task[] = [
    makeTask({ id: 't-1', title: 'A', status: 'order', position: 1000 }),
    makeTask({ id: 't-2', title: 'B', status: 'order', position: 2000 }),
    makeTask({ id: 't-3', title: 'C', status: 'prep', position: 1000 }),
  ];

  it('moves a task to a new status column', () => {
    const result = moveTasks({
      tasks,
      taskIds: ['t-1'],
      targetStatus: 'prep',
      targetKey: null,
    });

    const moved = result.nextTasks.find((t) => t.id === 't-1');
    expect(moved?.status).toBe('prep');
    expect(result.changedTaskIds).toContain('t-1');
  });

  it('inserts before a target key', () => {
    const result = moveTasks({
      tasks,
      taskIds: ['t-1'],
      targetStatus: 'prep',
      targetKey: 't-3',
      dropPosition: 'before',
    });

    const prepTasks = result.nextTasks.filter((t) => t.status === 'prep');
    expect(prepTasks[0]?.id).toBe('t-1');
    expect(prepTasks[1]?.id).toBe('t-3');
  });

  it('inserts after a target key', () => {
    const result = moveTasks({
      tasks,
      taskIds: ['t-1'],
      targetStatus: 'prep',
      targetKey: 't-3',
      dropPosition: 'after',
    });

    const prepTasks = result.nextTasks.filter((t) => t.status === 'prep');
    expect(prepTasks[0]?.id).toBe('t-3');
    expect(prepTasks[1]?.id).toBe('t-1');
  });

  it('appends to end when targetKey is null', () => {
    const result = moveTasks({
      tasks,
      taskIds: ['t-1'],
      targetStatus: 'prep',
      targetKey: null,
    });

    const prepTasks = result.nextTasks.filter((t) => t.status === 'prep');
    expect(prepTasks[prepTasks.length - 1]?.id).toBe('t-1');
  });

  it('recalculates positions as (index + 1) * 1000', () => {
    const result = moveTasks({
      tasks,
      taskIds: ['t-1'],
      targetStatus: 'prep',
      targetKey: 't-3',
      dropPosition: 'before',
    });

    const prepTasks = result.nextTasks.filter((t) => t.status === 'prep');
    expect(prepTasks[0]?.position).toBe(1000);
    expect(prepTasks[1]?.position).toBe(2000);
  });

  it('returns only changed task IDs', () => {
    const result = moveTasks({
      tasks,
      taskIds: ['t-2'],
      targetStatus: 'order',
      targetKey: 't-1',
      dropPosition: 'before',
    });

    expect(result.changedTaskIds).toContain('t-1');
    expect(result.changedTaskIds).toContain('t-2');
    expect(result.changedTaskIds).not.toContain('t-3');
  });

  it('returns empty changedTaskIds when task IDs do not exist', () => {
    const result = moveTasks({
      tasks,
      taskIds: ['nonexistent'],
      targetStatus: 'cook',
      targetKey: null,
    });

    expect(result.changedTaskIds).toEqual([]);
  });
});

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

  it('calls update for each changed task on rootDrop', async () => {
    const tasks = [
      makeTask({ id: 'task-1', status: 'order', position: 1000 }),
      makeTask({ id: 'task-2', status: 'prep', position: 1000 }),
    ];

    render(<KanbanBoard tasks={tasks} projectId="project-1" teamId="team-1" />);

    screen.getByTestId('rootdrop-prep').click();

    await waitFor(() => {
      expect(mocks.update).toHaveBeenCalledWith('task-1', {
        status: 'prep',
        position: expect.any(Number),
      });
    });
  });

  it('rolls back on update failure', async () => {
    mocks.update.mockRejectedValue(new Error('network error'));

    const tasks = [makeTask({ id: 'task-1', status: 'order', position: 1000 })];

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<KanbanBoard tasks={tasks} projectId="project-1" teamId="team-1" />);

    screen.getByTestId('rootdrop-prep').click();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to move task',
        expect.any(Error)
      );
    });

    expect(screen.getByTestId('task-task-1')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
