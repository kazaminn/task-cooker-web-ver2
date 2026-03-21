import React from 'react';
import type { Task } from '@/types/types';
import { TaskCard } from './TaskCard';

interface TaskListViewProps {
  tasks: Task[];
  projectId: string;
}

export function TaskListView({ tasks, projectId }: TaskListViewProps) {
  if (!tasks.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
        <p className="text-slate-500 dark:text-slate-400">
          タスクはまだありません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          projectId={projectId}
          variant="full"
        />
      ))}
    </div>
  );
}
