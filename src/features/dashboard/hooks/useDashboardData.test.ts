import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProjectsQuery } from '@/features/projects/hooks/useProjects';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { useDashboardData } from './useDashboardData';

vi.mock('@/features/projects/hooks/useProjects', () => ({
  useProjectsQuery: vi.fn(),
}));

vi.mock('@/hooks/useFirestoreSubscription', () => ({
  useFirestoreSubscription: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
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

describe('useDashboardData', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('derives stove tasks, overdue tasks and recent project progress', () => {
    vi.mocked(useProjectsQuery).mockReturnValue({
      projects: [
        {
          id: 'p1',
          teamId: 't1',
          slug: 'alpha',
          name: 'Alpha',
          overview: '',
          status: 'cooking',
          ownerId: 'u1',
          memberIds: ['u1'],
          createdAt: new Date('2026-03-20T00:00:00Z'),
          updatedAt: new Date('2026-03-21T00:00:00Z'),
        },
      ],
      isLoading: false,
      error: null,
    });

    vi.mocked(useFirestoreSubscription)
      .mockReturnValueOnce({
        data: [
          {
            id: 'task-1',
            displayId: 1,
            projectRef: 'p1',
            teamId: 't1',
            title: 'Prep',
            status: 'prep',
            priority: 'medium',
            linkedTaskIds: [],
            position: 1000,
            dueDate: new Date('2026-03-20T00:00:00Z'),
            createdAt: new Date('2026-03-20T00:00:00Z'),
            updatedAt: new Date('2026-03-20T00:00:00Z'),
          },
          {
            id: 'task-2',
            displayId: 2,
            projectRef: 'p1',
            teamId: 't1',
            title: 'Served',
            status: 'serve',
            priority: 'medium',
            linkedTaskIds: [],
            position: 2000,
            createdAt: new Date('2026-03-20T00:00:00Z'),
            updatedAt: new Date('2026-03-21T00:00:00Z'),
          },
        ],
        isLoading: false,
        error: null,
      } as never)
      .mockReturnValueOnce({
        data: [
          {
            id: 'activity-user-1',
            type: 'task_serve',
            userId: 'u1',
            userName: 'Alice',
            text: 'served',
            createdAt: new Date(),
          },
        ],
        isLoading: false,
        error: null,
      } as never)
      .mockReturnValueOnce({
        data: [
          {
            id: 'activity-1',
            type: 'task_serve',
            userId: 'u1',
            userName: 'Alice',
            text: 'served',
            createdAt: new Date(),
          },
        ],
        isLoading: false,
        error: null,
      } as never);

    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.stoveTasks).toHaveLength(1);
    expect(result.current.overdueTasks).toHaveLength(1);
    expect(result.current.todayServed).toBe(1);
    expect(result.current.userActivities).toHaveLength(1);
    expect(result.current.activities).toHaveLength(1);
    expect(result.current.recentProjects[0]).toMatchObject({
      totalTasks: 2,
      servedTasks: 1,
      activeTasks: 1,
    });
  });
});
