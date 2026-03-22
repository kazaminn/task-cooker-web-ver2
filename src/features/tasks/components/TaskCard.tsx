import type { ReactNode } from 'react';
import {
  faDownLong,
  faFire,
  faRightLong,
  faUpLong,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { STATUS_COLORS } from '@/libs/variants';
import { TASK_STATUS_META, PRIORITY_META } from '@/types/constants';
import type { Task, TaskPriority } from '@/types/types';

const PRIORITY_ICONS: Record<TaskPriority, ReactNode> = {
  urgent: <FontAwesomeIcon icon={faFire} aria-hidden className="h-3.5 w-3.5" />,
  high: <FontAwesomeIcon icon={faUpLong} aria-hidden className="h-3.5 w-3.5" />,
  medium: (
    <FontAwesomeIcon icon={faRightLong} aria-hidden className="h-3.5 w-3.5" />
  ),
  low: (
    <FontAwesomeIcon icon={faDownLong} aria-hidden className="h-3.5 w-3.5" />
  ),
};

interface TaskCardProps {
  task: Task;
  projectId: string;
  variant?: 'compact' | 'full';
  interactive?: boolean;
}

export function TaskCard({
  task,
  projectId,
  variant = 'full',
  interactive = true,
}: TaskCardProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    void navigate(`/projects/${projectId}/tasks/${task.id}`);
  };

  if (variant === 'compact') {
    const content = (
      <>
        <p className="text-sm font-medium text-body">{task.title}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span
            aria-label={PRIORITY_META[task.priority].ja}
            className="inline-flex"
          >
            {PRIORITY_ICONS[task.priority]}
          </span>
          {task.dueDate && <span>{format(task.dueDate, 'M/d')}</span>}
        </div>
      </>
    );

    return (
      <div className="rounded-lg border border-main bg-surface transition hover:shadow-sm">
        {interactive ? (
          <button
            type="button"
            className="w-full cursor-pointer p-3 text-left"
            onClick={handleClick}
          >
            {content}
          </button>
        ) : (
          <div className="p-3">{content}</div>
        )}
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
            <span
              aria-label={PRIORITY_META[task.priority].ja}
              className="inline-flex items-center gap-1"
            >
              {PRIORITY_ICONS[task.priority]}
              <span>{PRIORITY_META[task.priority].ja}</span>
            </span>
            {task.dueDate && <span>{format(task.dueDate, 'M/d')}</span>}
          </div>
        </div>
      </button>
    </div>
  );
}

export { PRIORITY_ICONS };
