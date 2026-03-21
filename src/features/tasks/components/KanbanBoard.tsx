import React from 'react';
import { TASK_STATUSES, TASK_STATUS_META } from '@/types/constants';
import type { Task, TaskStatus } from '@/types/types';
import { STATUS_COLORS } from '@/ui/colors';
import { useTaskMutations } from '../hooks/useTasks';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  teamId: string;
}

export function KanbanBoard({ tasks, projectId, teamId }: KanbanBoardProps) {
  const { update } = useTaskMutations(projectId, teamId);

  const tasksByStatus = TASK_STATUSES.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  const handleDrop = async (taskId: string, newStatus: TaskStatus) => {
    await update(taskId, { status: newStatus });
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
          onDrop={(taskId) => void handleDrop(taskId, status)}
        />
      ))}
    </div>
  );
}
