import React, { useState } from 'react';
import type { Task, TaskStatus } from '@/types/types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  colorClass: string;
  tasks: Task[];
  projectId: string;
  onDrop: (taskId: string) => void;
}

export function KanbanColumn({
  status: _status,
  label,
  colorClass,
  tasks,
  projectId,
  onDrop,
}: KanbanColumnProps) {
  const [isDragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDrop(taskId);
    }
  };

  return (
    <div
      className={`flex w-64 shrink-0 flex-col rounded-lg border bg-slate-50 p-3 dark:bg-slate-800/50 ${
        isDragOver
          ? 'border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-900/20'
          : 'border-slate-200 dark:border-slate-700'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass.split(' ')[0]}`}
          />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </h3>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', task.id!);
            }}
          >
            <TaskCard task={task} projectId={projectId} variant="compact" />
          </div>
        ))}
      </div>
    </div>
  );
}
