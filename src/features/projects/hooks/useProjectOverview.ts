import { useCallback } from 'react';
import { useTasksQuery } from '@/features/tasks/hooks/useTasks';
import { queryKeys } from '@/hooks/queryKeys';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { subscribeProjectActivities } from '@/services/activityService';
import { TASK_STATUSES, type TaskStatus } from '@/types/constants';
import type { Activity } from '@/types/types';

export function useProjectOverview(projectId: string | undefined) {
  const { allTasks } = useTasksQuery(projectId);
  const subscribeToProjectActivities = useCallback(
    (cb: (data: Activity[]) => void, onError?: (error: Error) => void) => {
      if (!projectId)
        return () => {
          /* noop */
        };
      return subscribeProjectActivities(projectId, 6, cb, onError);
    },
    [projectId]
  );

  const { data: activities } = useFirestoreSubscription<Activity>(
    queryKeys.activities.project(projectId, 6),
    subscribeToProjectActivities,
    { enabled: Boolean(projectId) }
  );

  const total = allTasks?.length ?? 0;
  const served =
    allTasks?.filter((task) => task.status === 'serve').length ?? 0;
  const statusCounts = TASK_STATUSES.reduce(
    (acc, status) => {
      acc[status] =
        allTasks?.filter((task) => task.status === status).length ?? 0;
      return acc;
    },
    {} as Record<TaskStatus, number>
  );

  return {
    activities: activities ?? [],
    total,
    served,
    statusCounts,
  };
}
