import { useCallback, useEffect, useMemo, useState } from 'react';
import { subscribeProjectActivities } from '@/api/activities';
import { subscribeTasks } from '@/api/tasks';
import { getUser } from '@/api/users';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ContributionGraph } from '@/features/dashboard/components/ContributionGraph';
import { useProjectsQuery } from '@/features/projects/hooks/useProjects';
import { queryKeys } from '@/hooks/queryKeys';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import type { Activity, Task, User } from '@/types/types';
import { Avatar } from '@/ui/components/Avatar';

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.uid;
  const [profile, setProfile] = useState<User | null>(null);
  const { projects } = useProjectsQuery();
  const projectIds = useMemo(
    () => (projects ?? []).map((project) => project.id).filter(isDefined),
    [projects]
  );
  const subscribeToUserActivities = useCallback(
    (cb: (data: Activity[]) => void, onError?: (error: Error) => void) => {
      if (!userId || !projectIds.length)
        return () => {
          /* noop */
        };

      const activitiesByProject = new Map<string, Activity[]>();
      const emit = () => {
        cb(
          Array.from(activitiesByProject.values())
            .flat()
            .filter((activity) => activity.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        );
      };

      const unsubscribes = projectIds.map((projectId) =>
        subscribeProjectActivities(
          projectId,
          120,
          (activities) => {
            activitiesByProject.set(projectId, activities);
            emit();
          },
          onError
        )
      );

      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    },
    [projectIds, userId]
  );
  const subscribeToTasks = useCallback(
    (cb: (data: Task[]) => void, onError?: (error: Error) => void) => {
      if (!projectIds.length) {
        cb([]);
        return () => {
          /* noop */
        };
      }

      const tasksByProject = new Map<string, Task[]>();
      const emit = () => {
        cb(
          Array.from(tasksByProject.values())
            .flat()
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        );
      };

      const unsubscribes = projectIds.map((projectId) =>
        subscribeTasks(
          projectId,
          (tasks) => {
            tasksByProject.set(projectId, tasks);
            emit();
          },
          onError
        )
      );

      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    },
    [projectIds]
  );

  const { data: activities } = useFirestoreSubscription<Activity>(
    queryKeys.activities.user(userId, projectIds),
    subscribeToUserActivities,
    { enabled: Boolean(userId) }
  );
  const { data: allTasks } = useFirestoreSubscription<Task>(
    queryKeys.tasks.profile(userId, projectIds),
    subscribeToTasks,
    { enabled: Boolean(userId) }
  );

  const projectIdSet = useMemo(() => new Set(projectIds), [projectIds]);
  const tasks = useMemo(
    () =>
      (allTasks ?? []).filter(
        (task) => task.projectRef != null && projectIdSet.has(task.projectRef)
      ),
    [allTasks, projectIdSet]
  );

  const totalServed = tasks.filter((task) => task.status === 'serve').length;
  const totalCreated = tasks.length;
  const totalProjects = projects?.length ?? 0;
  const displayName = profile?.displayName ?? user?.displayName ?? 'ユーザー';
  const photoURL = profile?.photoURL ?? user?.photoURL ?? undefined;
  const bio = profile?.bio?.trim();

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      if (!userId) {
        setProfile(null);
        return;
      }

      const nextProfile = await getUser(userId);
      if (!isActive) return;
      setProfile(nextProfile);
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [userId]);

  return (
    <div className="w-full space-y-6 py-6">
      <section className="flex items-center gap-4">
        <Avatar
          src={photoURL}
          fallback={displayName[0] ?? '?'}
          seed={user?.uid}
          size="lg"
        />
        <div>
          <h1 className="text-xl font-bold text-body">{displayName}</h1>
          <p className="text-sm text-muted">{user?.email}</p>
          {bio ? <p className="mt-1 text-sm text-muted">{bio}</p> : null}
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
