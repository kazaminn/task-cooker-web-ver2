import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { STATUS_COLORS } from '@/libs/variants';
import { getUser } from '@/services/authService';
import { PRIORITY_META, TASK_STATUS_META } from '@/types/constants';
import type { Task, TaskPriority, User } from '@/types/types';
import { Avatar } from '@/ui/components/Avatar';
import { PRIORITY_ICONS } from './TaskCard';

interface TaskListViewProps {
  tasks: Task[];
  projectId: string;
}

interface TaskRowProps {
  task: Task;
  projectId: string;
  assignee?: User | null;
}

const rowPriorityOrder: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

function getAssigneeDisplayLabel(
  assigneeId: string | undefined,
  assignee?: User | null
) {
  if (!assigneeId && !assignee) {
    return undefined;
  }

  return assignee?.displayName ?? assignee?.email ?? assigneeId;
}

function getAssigneeFallbackLabel(assigneeLabel: string | undefined) {
  if (!assigneeLabel) {
    return undefined;
  }

  return assigneeLabel.trim().charAt(0).toUpperCase() || '?';
}

function useAssigneeMap(tasks: Task[]) {
  const [assignees, setAssignees] = useState<Record<string, User | null>>({});
  const assigneeIds = useMemo(
    () => [
      ...new Set(
        tasks
          .map((task) => task.assigneeId)
          .filter((id): id is string => Boolean(id))
      ),
    ],
    [tasks]
  );
  const hasAssignees = assigneeIds.length > 0;

  useEffect(() => {
    let isActive = true;

    if (!hasAssignees) {
      return () => {
        isActive = false;
      };
    }

    void (async () => {
      const entries = await Promise.all(
        assigneeIds.map(
          async (assigneeId) => [assigneeId, await getUser(assigneeId)] as const
        )
      );
      if (!isActive) return;
      const nextAssignees = Object.fromEntries(entries) as Record<
        string,
        User | null
      >;
      setAssignees(nextAssignees);
    })();

    return () => {
      isActive = false;
    };
  }, [assigneeIds, hasAssignees]);

  return hasAssignees ? assignees : {};
}

export function TaskRow({ task, projectId, assignee }: TaskRowProps) {
  const navigate = useNavigate();

  const priorityText = PRIORITY_META[task.priority].ja;
  const dueDateText = task.dueDate ? format(task.dueDate, 'M/d') : undefined;
  const assigneeLabel = getAssigneeDisplayLabel(task.assigneeId, assignee);
  const assigneeBadgeLabel = getAssigneeFallbackLabel(assigneeLabel);

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
                src={assignee?.photoURL}
                alt=""
                fallback={assigneeBadgeLabel}
                seed={task.assigneeId}
                size="sm"
                className="border-main/60"
              />
              <span>{assigneeLabel}</span>
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export function TaskListView({ tasks, projectId }: TaskListViewProps) {
  const assignees = useAssigneeMap(tasks);

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
        <TaskRow
          key={task.id}
          task={task}
          projectId={projectId}
          assignee={task.assigneeId ? assignees[task.assigneeId] : undefined}
        />
      ))}
    </div>
  );
}
