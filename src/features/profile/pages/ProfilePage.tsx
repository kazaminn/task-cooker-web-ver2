import { useCallback, useMemo } from 'react';
import { subscribeUserActivities } from '@/api/activities';
import { subscribeAllTasksCollectionGroup } from '@/api/tasks';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ContributionGraph } from '@/features/dashboard/components/ContributionGraph';
import { useProjectsQuery } from '@/features/projects/hooks/useProjects';
import { queryKeys } from '@/hooks/queryKeys';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import type { Activity, Task } from '@/types/types';
import { Avatar } from '@/ui/components/Avatar';

export function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.uid;
  const { projects } = useProjectsQuery();
  const subscribeToUserActivities = useCallback(
    (cb: (data: Activity[]) => void, onError?: (error: Error) => void) => {
      if (!userId)
        return () => {
          /* noop */
        };
      return subscribeUserActivities(userId, cb, onError);
    },
    [userId]
  );
  const subscribeToTasks = useCallback(
    (cb: (data: Task[]) => void, onError?: (error: Error) => void) =>
      subscribeAllTasksCollectionGroup(cb, onError),
    []
  );

  const { data: activities } = useFirestoreSubscription<Activity>(
    queryKeys.activities.user(userId),
    subscribeToUserActivities,
    { enabled: Boolean(userId) }
  );
  const { data: allTasks } = useFirestoreSubscription<Task>(
    queryKeys.tasks.profile(userId),
    subscribeToTasks,
    { enabled: Boolean(userId) }
  );

  const projectIds = useMemo(
    () =>
      new Set((projects ?? []).map((project) => project.id).filter(Boolean)),
    [projects]
  );
  const tasks = useMemo(
    () =>
      (allTasks ?? []).filter(
        (task) => task.projectRef != null && projectIds.has(task.projectRef)
      ),
    [allTasks, projectIds]
  );

  const totalServed = tasks.filter((task) => task.status === 'serve').length;
  const totalCreated = tasks.length;
  const totalProjects = projects?.length ?? 0;

  return (
    <div className="w-full space-y-6 py-6">
      <section className="flex items-center gap-4">
        <Avatar
          src={user?.photoURL ?? undefined}
          fallback={user?.displayName?.[0] ?? '?'}
          size="lg"
        />
        <div>
          <h1 className="text-xl font-bold text-body">
            {user?.displayName ?? 'ユーザー'}
          </h1>
          <p className="text-sm text-muted">{user?.email}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-body">草グラフ</h2>
        <ContributionGraph activities={activities ?? []} />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-main bg-surface p-4 text-center">
          <p className="text-primary text-2xl font-bold">{totalServed}</p>
          <p className="text-xs text-muted">総 serve 数</p>
        </div>
        <div className="rounded-lg border border-main bg-surface p-4 text-center">
          <p className="text-primary text-2xl font-bold">{totalCreated}</p>
          <p className="text-xs text-muted">総タスク作成数</p>
        </div>
        <div className="rounded-lg border border-main bg-surface p-4 text-center">
          <p className="text-primary text-2xl font-bold">{totalProjects}</p>
          <p className="text-xs text-muted">総プロジェクト作成数</p>
        </div>
      </section>
    </div>
  );
}
