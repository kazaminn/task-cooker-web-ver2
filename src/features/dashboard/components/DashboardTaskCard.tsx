import { format } from 'date-fns';
import { PRIORITY_ICONS } from '@/features/tasks/components/TaskCard';
import { STATUS_COLORS } from '@/libs/variants';
import { PRIORITY_META, TASK_STATUS_META } from '@/types/constants';
import type { Task } from '@/types/types';

interface DashboardTaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
}

export function DashboardTaskCard({ task, onPress }: DashboardTaskCardProps) {
  return (
    <button
      type="button"
      className="w-full rounded-2xl border border-main bg-base/70 p-4 text-left transition hover:border-primary hover:bg-base"
      onClick={() => onPress(task)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">#{task.displayId}</p>
          <p className="truncate text-base font-semibold text-body">
            {task.title}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs ${STATUS_COLORS[task.status]}`}
        >
          {TASK_STATUS_META[task.status].ja}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted">
        <span
          aria-label={PRIORITY_META[task.priority].ja}
          className="inline-flex items-center gap-1"
        >
          {PRIORITY_ICONS[task.priority]}
          <span>{PRIORITY_META[task.priority].ja}</span>
        </span>
        <span>{task.dueDate ? format(task.dueDate, 'M/d') : '期限未設定'}</span>
      </div>
    </button>
  );
}
