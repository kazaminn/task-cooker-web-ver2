import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  subscribeTasks,
  subscribeTask,
  createTask,
  updateTask,
  deleteTask,
} from '@/api/tasks';
import { queryKeys } from '@/hooks/queryKeys';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { useUIStore } from '@/stores/uiStore';
import type { Task, TaskFormInput } from '@/types/types';

export function useTasksQuery(projectId: string | undefined) {
  const filters = useUIStore((s) => s.filters);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const subscribeToTasks = useCallback(
    (cb: (data: Task[]) => void, onError?: (error: Error) => void) => {
      if (!projectId)
        return () => {
          /* noop */
        };
      return subscribeTasks(projectId, cb, onError);
    },
    [projectId]
  );

  const { data, isLoading, error } = useFirestoreSubscription<Task>(
    queryKeys.tasks.list(projectId),
    subscribeToTasks,
    { enabled: Boolean(projectId) }
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

export function useTaskQuery(
  projectId: string | undefined,
  taskId: string | undefined
) {
  const subscribeToTask = useCallback(
    (cb: (data: Task[]) => void, onError?: (error: Error) => void) => {
      if (!projectId || !taskId)
        return () => {
          /* noop */
        };
      return subscribeTask(
        projectId,
        taskId,
        (task) => {
          cb(task ? [task] : []);
        },
        onError
      );
    },
    [projectId, taskId]
  );

  const { data, isLoading, error } = useFirestoreSubscription<Task>(
    queryKeys.tasks.detail(projectId, taskId),
    subscribeToTask,
    { enabled: Boolean(projectId && taskId) }
  );

  return { task: data?.[0] ?? null, isLoading, error };
}

/** @deprecated Use useTasksQuery */
export const useTasks = useTasksQuery;
/** @deprecated Use useTaskQuery */
export const useTask = useTaskQuery;

export function useTaskMutations(projectId: string, teamId: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: TaskFormInput) => {
      return createTask(projectId, teamId, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(projectId),
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.dashboard(),
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.profile(undefined),
        refetchType: 'none',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: Partial<TaskFormInput & { position: number }>;
    }) => {
      return updateTask(projectId, taskId, data);
    },
    onSuccess: (_, { taskId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(projectId),
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(projectId, taskId),
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.dashboard(),
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.profile(undefined),
        refetchType: 'none',
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return deleteTask(projectId, taskId);
    },
    onSuccess: (_, taskId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(projectId),
        refetchType: 'none',
      });
      queryClient.removeQueries({
        queryKey: queryKeys.tasks.detail(projectId, taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.dashboard(),
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.profile(undefined),
        refetchType: 'none',
      });
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: (
      taskId: string,
      data: Partial<TaskFormInput & { position: number }>
    ) => updateMutation.mutateAsync({ taskId, data }),
    remove: removeMutation.mutateAsync,
    createMutation,
    updateMutation,
    removeMutation,
  };
}
