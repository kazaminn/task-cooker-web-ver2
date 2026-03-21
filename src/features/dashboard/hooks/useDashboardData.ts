import { useCallback, useMemo } from 'react';
import { isBefore, isToday, startOfDay } from 'date-fns';
import {
  subscribeAllActivities,
  subscribeUserActivities,
} from '@/api/activities';
import { subscribeAllTasksCollectionGroup } from '@/api/tasks';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProjectsQuery } from '@/features/projects/hooks/useProjects';
import { queryKeys } from '@/hooks/queryKeys';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import type { Activity, Project, Task } from '@/types/types';

function projectSummary(project: Project, tasks: Task[]) {
  const projectTasks = tasks.filter((task) => task.projectRef === project.id);
  const served = projectTasks.filter((task) => task.status === 'serve').length;

  return {
    ...project,
    totalTasks: projectTasks.length,
    servedTasks: served,
    activeTasks: projectTasks.filter((task) => task.status !== 'serve').length,
  };
}

export function useDashboardData() {
  const { user } = useAuth();
  const userId = user?.uid;
  const { projects, isLoading: isProjectsLoading } = useProjectsQuery();
  const subscribeToDashboardTasks = useCallback(
    (cb: (data: Task[]) => void, onError?: (error: Error) => void) =>
      subscribeAllTasksCollectionGroup(cb, onError),
    []
  );
  const subscribeToRecentActivities = useCallback(
    (cb: (data: Activity[]) => void, onError?: (error: Error) => void) =>
      subscribeAllActivities(50, cb, onError),
    []
  );
  const subscribeToUserActivities = useCallback(
    (cb: (data: Activity[]) => void, onError?: (error: Error) => void) => {
      if (!userId) {
        return () => {
          /* noop */
        };
      }

      return subscribeUserActivities(userId, cb, onError);
    },
    [userId]
  );
  const tasksState = useFirestoreSubscription<Task>(
    queryKeys.tasks.dashboard(),
    subscribeToDashboardTasks
  );
  const recentActivitiesState = useFirestoreSubscription<Activity>(
    queryKeys.activities.dashboard(),
    subscribeToRecentActivities
  );
  const userActivitiesState = useFirestoreSubscription<Activity>(
    queryKeys.activities.user(userId),
    subscribeToUserActivities,
    { enabled: Boolean(userId) }
  );

  const stoveTasks = useMemo(
    () =>
      (tasksState.data ?? []).filter(
        (task) => task.status === 'prep' || task.status === 'cook'
      ),
    [tasksState.data]
  );
  const overdueTasks = useMemo(
    () =>
      (tasksState.data ?? []).filter(
        (task) =>
          task.dueDate &&
          task.status !== 'serve' &&
          isBefore(task.dueDate, startOfDay(new Date()))
      ),
    [tasksState.data]
  );
  const todayServed = useMemo(
    () =>
      (userActivitiesState.data ?? []).filter(
        (activity) =>
          activity.type === 'task_serve' && isToday(activity.createdAt)
      ).length,
    [userActivitiesState.data]
  );
  const recentProjects = useMemo(
    () =>
      (projects ?? [])
        .map((project) => projectSummary(project, tasksState.data ?? []))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5),
    [projects, tasksState.data]
  );

  return {
    projects,
    activities: recentActivitiesState.data ?? [],
    userActivities: userActivitiesState.data ?? [],
    allTasks: tasksState.data ?? [],
    stoveTasks,
    overdueTasks,
    todayServed,
    recentProjects,
    isLoading:
      isProjectsLoading ||
      tasksState.isLoading ||
      recentActivitiesState.isLoading ||
      userActivitiesState.isLoading,
    error:
      tasksState.error ??
      recentActivitiesState.error ??
      userActivitiesState.error,
  };
}
