import { useEffect, useMemo, useState } from 'react';
import type { Key } from 'react-aria-components';
import { STATUS_COLORS } from '@/libs/variants';
import { TASK_STATUSES, TASK_STATUS_META } from '@/types/constants';
import type { Task, TaskStatus } from '@/types/types';
import { useTaskMutations } from '../hooks/useTasks';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  teamId: string;
}

interface ReorderPayload {
  taskIds: string[];
  targetStatus: TaskStatus;
  targetKey?: Key | null;
  dropPosition?: 'before' | 'after';
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.position - b.position);
}

function moveTasks({
  tasks,
  taskIds,
  targetStatus,
  targetKey,
  dropPosition = 'after',
}: ReorderPayload & { tasks: Task[] }) {
  const taskMap = new Map(tasks.map((task) => [task.id!, { ...task }]));
  const taskIdsToMove = new Set(taskIds);
  const nextByStatus = Object.fromEntries(
    TASK_STATUSES.map((status) => [
      status,
      sortTasks(tasks)
        .filter((task) => task.status === status)
        .map((task) => task.id!),
    ])
  ) as Record<TaskStatus, string[]>;

  const movingTasks = taskIds
    .map((taskId) => taskMap.get(taskId))
    .filter((task): task is Task => Boolean(task));

  if (!movingTasks.length) {
    return { nextTasks: sortTasks(tasks), changedTaskIds: [] };
  }

  const affectedStatuses = new Set<TaskStatus>([
    targetStatus,
    ...movingTasks.map((task) => task.status),
  ]);

  for (const status of TASK_STATUSES) {
    nextByStatus[status] = nextByStatus[status].filter(
      (id) => !taskIdsToMove.has(id)
    );
  }

  const targetIds = nextByStatus[targetStatus];
  const insertIndex =
    targetKey == null
      ? targetIds.length
      : targetIds.findIndex((id) => id === String(targetKey));

  if (targetKey == null || insertIndex < 0) {
    targetIds.push(...taskIds);
  } else {
    targetIds.splice(
      dropPosition === 'before' ? insertIndex : insertIndex + 1,
      0,
      ...taskIds
    );
  }

  const nextTaskMap = new Map(taskMap);

  for (const status of affectedStatuses) {
    nextByStatus[status].forEach((taskId, index) => {
      const task = nextTaskMap.get(taskId);
      if (!task) return;
      task.status = status;
      task.position = (index + 1) * 1000;
      nextTaskMap.set(taskId, task);
    });
  }

  const nextTasks = sortTasks(
    tasks.map((task) => nextTaskMap.get(task.id!) ?? task)
  );

  const changedTaskIds = nextTasks
    .filter((task) => {
      const previous = tasks.find((candidate) => candidate.id === task.id);
      return (
        previous &&
        (previous.status !== task.status || previous.position !== task.position)
      );
    })
    .map((task) => task.id!);

  return { nextTasks, changedTaskIds };
}

export function KanbanBoard({ tasks, projectId, teamId }: KanbanBoardProps) {
  const { update } = useTaskMutations(projectId, teamId);
  const [optimisticTasks, setOptimisticTasks] = useState(() =>
    sortTasks(tasks)
  );

  useEffect(() => {
    setOptimisticTasks(sortTasks(tasks));
  }, [tasks]);

  const tasksByStatus = useMemo(
    () =>
      TASK_STATUSES.reduce(
        (acc, status) => {
          acc[status] = optimisticTasks.filter(
            (task) => task.status === status
          );
          return acc;
        },
        {} as Record<TaskStatus, Task[]>
      ),
    [optimisticTasks]
  );

  const commitMove = async (payload: ReorderPayload) => {
    const previousTasks = optimisticTasks;
    const { nextTasks, changedTaskIds } = moveTasks({
      tasks: previousTasks,
      ...payload,
    });

    if (!changedTaskIds.length) {
      return;
    }

    setOptimisticTasks(nextTasks);

    try {
      await Promise.all(
        changedTaskIds.map((taskId) => {
          const task = nextTasks.find((candidate) => candidate.id === taskId);
          if (!task) return Promise.resolve();
          return update(taskId, {
            status: task.status,
            position: task.position,
          });
        })
      );
    } catch (error) {
      console.error('Failed to move task', error);
      setOptimisticTasks(previousTasks);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {TASK_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          label={TASK_STATUS_META[status].ja}
          colorClass={STATUS_COLORS[status]}
          tasks={tasksByStatus[status]}
          projectId={projectId}
          onInsert={(taskIds, targetKey, dropPosition) =>
            void commitMove({
              taskIds,
              targetStatus: status,
              targetKey,
              dropPosition,
            })
          }
          onRootDrop={(taskIds) =>
            void commitMove({
              taskIds,
              targetStatus: status,
            })
          }
          onReorder={(taskIds, targetKey, dropPosition) =>
            void commitMove({
              taskIds,
              targetStatus: status,
              targetKey,
              dropPosition,
            })
          }
        />
      ))}
    </div>
  );
}
