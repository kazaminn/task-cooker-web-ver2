import { subscribeUserActivities } from '@/api/activities';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ContributionGraph } from '@/features/dashboard/components/ContributionGraph';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import type { Activity } from '@/types/types';

export function ProfilePage() {
  const { user } = useAuth();

  const { data: activities } = useFirestoreSubscription<Activity>(
    ['user-activities', user?.uid],
    (cb) => {
      if (!user?.uid)
        return () => {
          /* noop */
        };
      return subscribeUserActivities(user.uid, cb);
    }
  );

  const totalServed =
    activities?.filter((a) => a.type === 'task_update').length ?? 0;
  const totalCreated =
    activities?.filter((a) => a.type === 'task_create').length ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <section className="flex items-center gap-4">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="h-16 w-16 rounded-full" />
        ) : (
          <span className="text-primary flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold">
            {user?.displayName?.[0] ?? '?'}
          </span>
        )}
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

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-main bg-surface p-4 text-center">
          <p className="text-primary text-2xl font-bold">{totalServed}</p>
          <p className="text-xs text-muted">総 serve 数</p>
        </div>
        <div className="rounded-lg border border-main bg-surface p-4 text-center">
          <p className="text-primary text-2xl font-bold">{totalCreated}</p>
          <p className="text-xs text-muted">総タスク作成数</p>
        </div>
      </section>
    </div>
  );
}
