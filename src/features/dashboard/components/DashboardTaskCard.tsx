import { format } from 'date-fns';
import type { Task } from '@/types/types';

interface DashboardTaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
}

const STATUS_LABELS = {
  order: '注文済み',
  prep: '仕込み中',
  cook: '調理中',
  serve: '提供済み',
} as const;

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
        <span className="rounded-full bg-hover px-2.5 py-1 text-xs text-muted">
          {STATUS_LABELS[task.status]}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted">
        <span>{task.priority}</span>
        <span>{task.dueDate ? format(task.dueDate, 'M/d') : '期限未設定'}</span>
      </div>
    </button>
  );
}
