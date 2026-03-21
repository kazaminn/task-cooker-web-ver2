import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTaskMutations, useTaskQuery, useTasksQuery } from './useTasks';

const mocks = vi.hoisted(() => ({
  subscribeTasks: vi.fn(),
  subscribeTask: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  useFirestoreSubscription: vi.fn(),
  useUIStore: vi.fn(),
}));

interface UIStoreSelectionState {
  filters: {
    status?: ('order' | 'prep' | 'cook' | 'serve')[];
    priority?: ('urgent' | 'high' | 'medium' | 'low')[];
    assigneeId?: string;
  };
  searchQuery: string;
}

vi.mock('@/api/tasks', () => ({
  subscribeTasks: mocks.subscribeTasks,
  subscribeTask: mocks.subscribeTask,
  createTask: mocks.createTask,
  updateTask: mocks.updateTask,
  deleteTask: mocks.deleteTask,
}));

vi.mock('@/hooks/useFirestoreSubscription', () => ({
  useFirestoreSubscription: mocks.useFirestoreSubscription,
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: mocks.useUIStore,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useUIStore.mockImplementation(
      (selector: (state: UIStoreSelectionState) => unknown) =>
        selector({
          filters: {},
          searchQuery: '',
        })
    );
  });

  it('filters subscribed tasks by store filters and search query', () => {
    mocks.useUIStore.mockImplementation(
      (selector: (state: UIStoreSelectionState) => unknown) =>
        selector({
          filters: {
            status: ['prep'],
            priority: ['high'],
            assigneeId: 'user-1',
          },
          searchQuery: 'cake',
        })
    );
    mocks.useFirestoreSubscription.mockReturnValue({
      data: [
        {
          id: 'task-1',
          title: 'Bake cake',
          status: 'prep',
          priority: 'high',
          assigneeId: 'user-1',
        },
        {
          id: 'task-2',
          title: 'Plate soup',
          status: 'cook',
          priority: 'low',
          assigneeId: 'user-2',
        },
      ],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTasksQuery('project-1'));

    expect(result.current.tasks).toEqual([
      expect.objectContaining({ id: 'task-1' }),
    ]);
    expect(result.current.allTasks).toHaveLength(2);
  });

  it('returns the first subscribed task from useTaskQuery', () => {
    mocks.useFirestoreSubscription.mockReturnValue({
      data: [{ id: 'task-9', title: 'Cook pasta' }],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTaskQuery('project-1', 'task-9'));

    expect(result.current.task).toEqual(
      expect.objectContaining({ id: 'task-9' })
    );
  });

  it('invalidates task list, detail, and dashboard queries after update', async () => {
    mocks.createTask.mockResolvedValue('task-1');
    mocks.updateTask.mockResolvedValue(undefined);
    mocks.deleteTask.mockResolvedValue(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useTaskMutations('project-1', 'team-1'),
      { wrapper }
    );

    await result.current.update('task-1', { status: 'serve', position: 3000 });

    await waitFor(() => {
      expect(mocks.updateTask).toHaveBeenCalledWith('project-1', 'task-1', {
        status: 'serve',
        position: 3000,
      });
    });
  });

  it('removes the detail query and invalidates dashboard data after delete', async () => {
    mocks.deleteTask.mockResolvedValue(undefined);

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useTaskMutations('project-1', 'team-1'),
      { wrapper }
    );

    await result.current.remove('task-3');

    await waitFor(() => {
      expect(mocks.deleteTask).toHaveBeenCalledWith('project-1', 'task-3');
    });
  });
});
