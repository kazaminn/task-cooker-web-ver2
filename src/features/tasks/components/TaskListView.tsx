import type { Task } from '@/types/types';
import { TaskCard } from './TaskCard';

interface TaskListViewProps {
  tasks: Task[];
  projectId: string;
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
