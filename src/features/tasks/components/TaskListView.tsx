import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { STATUS_COLORS } from '@/libs/variants';
import { PRIORITY_META, TASK_STATUS_META } from '@/types/constants';
import type { Task, TaskPriority } from '@/types/types';
import { Avatar } from '@/ui/components/Avatar';
import { PRIORITY_ICONS } from './TaskCard';

interface TaskListViewProps {
  tasks: Task[];
  projectId: string;
}

interface TaskRowProps {
  task: Task;
  projectId: string;
}

const rowPriorityOrder: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

function getAssigneeBadgeLabel(assigneeId: string | undefined) {
  if (!assigneeId) {
    return undefined;
  }

  return assigneeId.trim().charAt(0).toUpperCase() || '?';
}

export function TaskRow({ task, projectId }: TaskRowProps) {
  const navigate = useNavigate();

  const priorityText = PRIORITY_META[task.priority].ja;
  const dueDateText = task.dueDate ? format(task.dueDate, 'M/d') : undefined;
  const assigneeBadgeLabel = getAssigneeBadgeLabel(task.assigneeId);

  return (
    <button
      type="button"
      className="w-full rounded-xl border border-main bg-surface px-4 py-3 text-left transition hover:border-primary hover:bg-base/80 hover:shadow-sm"
      onClick={() => {
        void navigate(`/projects/${projectId}/tasks/${task.id}`);
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-sm text-muted">
              #{task.displayId}
            </span>
            <p className="min-w-0 truncate text-base font-semibold text-body">
              {task.title}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[task.status]}`}
            >
              {TASK_STATUS_META[task.status].ja}
            </span>
            <span
              aria-label={priorityText}
              className={`inline-flex items-center gap-1 rounded-full border border-main/70 bg-base px-2.5 py-1 text-xs text-muted ${
                rowPriorityOrder.indexOf(task.priority) <= 1
                  ? 'font-medium'
                  : ''
              }`}
            >
              {PRIORITY_ICONS[task.priority]}
              <span>{priorityText}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted sm:shrink-0">
          {dueDateText ? <span>期限 {dueDateText}</span> : null}
          {assigneeBadgeLabel ? (
            <span className="inline-flex items-center gap-2">
              <Avatar
                src={undefined}
                alt=""
                fallback={assigneeBadgeLabel}
                size="sm"
                className="border-main/60"
              />
              <span>{task.assigneeId}</span>
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export function TaskListView({ tasks, projectId }: TaskListViewProps) {
  if (!tasks.length) {
    return (
      <div className="rounded-xl border border-dashed border-main p-8 text-center">
        <p className="text-muted">タスクはまだありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} projectId={projectId} />
      ))}
    </div>
  );
}
