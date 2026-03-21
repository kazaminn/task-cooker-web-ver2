import type { Task } from '@/types/types';
import { DashboardTaskCard } from './DashboardTaskCard';

interface StoveSectionProps {
  isLoading: boolean;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

const stoveSkeletonIds = [
  'stove-skel-1',
  'stove-skel-2',
  'stove-skel-3',
  'stove-skel-4',
];

export function StoveSection({
  isLoading,
  tasks,
  onOpenTask,
}: StoveSectionProps) {
  return (
    <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-body">On the Stove</h2>
          <p className="text-sm text-muted">
            今すぐ手を動かすタスクだけを横断表示
          </p>
        </div>
        <span className="rounded-full bg-hover px-2.5 py-1 text-xs text-muted">
          {isLoading ? 'loading' : `${tasks.length} items`}
        </span>
      </div>
      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2" aria-hidden="true">
          {stoveSkeletonIds.map((id) => (
            <div
              key={id}
              className="h-24 animate-pulse rounded-2xl border border-main bg-base/60"
            />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {tasks.slice(0, 8).map((task) => (
            <DashboardTaskCard key={task.id} task={task} onPress={onOpenTask} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">進行中のタスクはありません</p>
      )}
    </section>
  );
}
