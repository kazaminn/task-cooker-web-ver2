import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { STATUS_COLORS } from '@/libs/variants';
import { TASK_STATUS_META, PRIORITY_META } from '@/types/constants';
import type { Task, TaskPriority } from '@/types/types';

const PRIORITY_ICONS: Record<TaskPriority, string> = {
  urgent: '\u23EB',
  high: '\u2191',
  medium: '\u2192',
  low: '\u2193',
};

interface TaskCardProps {
  task: Task;
  projectId: string;
  variant?: 'compact' | 'full';
}

export function TaskCard({ task, projectId, variant = 'full' }: TaskCardProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    void navigate(`/projects/${projectId}/tasks/${task.id}`);
  };

  if (variant === 'compact') {
    return (
      <div className="rounded-lg border border-main bg-surface transition hover:shadow-sm">
        <button
          type="button"
          className="w-full cursor-pointer p-3 text-left"
          onClick={handleClick}
        >
          <p className="text-sm font-medium text-body">{task.title}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span aria-label={PRIORITY_META[task.priority].ja}>
              {PRIORITY_ICONS[task.priority]}
            </span>
            {task.dueDate && <span>{format(task.dueDate, 'M/d')}</span>}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-main bg-surface transition hover:border-primary hover:shadow-sm">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left"
        onClick={handleClick}
      >
        <span
          className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_COLORS[task.status].split(' ')[0]}`}
          aria-label={TASK_STATUS_META[task.status].ja}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">#{task.displayId}</span>
            <span className="truncate text-sm font-medium text-body">
              {task.title}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
            <span
              className={`rounded-md px-1.5 py-0.5 text-xs ${STATUS_COLORS[task.status]}`}
            >
              {TASK_STATUS_META[task.status].ja}
            </span>
            <span aria-label={PRIORITY_META[task.priority].ja}>
              {PRIORITY_ICONS[task.priority]} {PRIORITY_META[task.priority].ja}
            </span>
            {task.dueDate && <span>{format(task.dueDate, 'M/d')}</span>}
          </div>
        </div>
      </button>
    </div>
  );
}

export { PRIORITY_ICONS };
