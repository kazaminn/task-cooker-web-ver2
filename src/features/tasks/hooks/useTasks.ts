import { useCallback, useMemo } from 'react';
import {
  subscribeTasks,
  subscribeTask,
  createTask,
  updateTask,
  deleteTask,
} from '@/api/tasks';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { useUIStore } from '@/stores/uiStore';
import type { Task, TaskFormInput } from '@/types/types';

export function useTasks(projectId: string | undefined) {
  const filters = useUIStore((s) => s.filters);
  const searchQuery = useUIStore((s) => s.searchQuery);

  const { data, isLoading, error } = useFirestoreSubscription<Task>(
    ['tasks', projectId],
    (cb) => {
      if (!projectId)
        return () => {
          /* noop */
        };
      return subscribeTasks(projectId, cb);
    }
  );

  const filteredTasks = useMemo(() => {
    if (!data) return undefined;
    let result = [...data];

    if (filters.status?.length) {
      result = result.filter((t) => filters.status!.includes(t.status));
    }
    if (filters.priority?.length) {
      result = result.filter((t) => filters.priority!.includes(t.priority));
    }
    if (filters.assigneeId) {
      result = result.filter((t) => t.assigneeId === filters.assigneeId);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    return result;
  }, [data, filters, searchQuery]);

  return { tasks: filteredTasks, allTasks: data, isLoading, error };
}

export function useTask(
  projectId: string | undefined,
  taskId: string | undefined
) {
  const { data, isLoading, error } = useFirestoreSubscription<Task>(
    ['task', projectId, taskId],
    (cb) => {
      if (!projectId || !taskId)
        return () => {
          /* noop */
        };
      return subscribeTask(projectId, taskId, (task) => {
        cb(task ? [task] : []);
      });
    }
  );

  return { task: data?.[0] ?? null, isLoading, error };
}

export function useTaskMutations(projectId: string, teamId: string) {
  const create = useCallback(
    async (data: TaskFormInput) => {
      return createTask(projectId, teamId, data);
    },
    [projectId, teamId]
  );

  const update = useCallback(
    async (
      taskId: string,
      data: Partial<TaskFormInput & { position: number }>
    ) => {
      return updateTask(projectId, taskId, data);
    },
    [projectId]
  );

  const remove = useCallback(
    async (taskId: string) => {
      return deleteTask(projectId, taskId);
    },
    [projectId]
  );

  return { create, update, remove };
}
