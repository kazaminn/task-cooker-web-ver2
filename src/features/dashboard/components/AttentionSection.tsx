import { format } from 'date-fns';
import type { Task } from '@/types/types';

interface AttentionSectionProps {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

export function AttentionSection({ tasks, onOpenTask }: AttentionSectionProps) {
  return (
    <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-body">Attention</h2>
      <div className="mt-4 space-y-3">
        {tasks.slice(0, 5).map((task) => (
          <button
            key={task.id}
            type="button"
            className="w-full rounded-2xl border border-danger/30 bg-danger/5 p-3 text-left transition hover:border-danger/50"
            onClick={() => onOpenTask(task)}
          >
            <p className="text-sm font-medium text-body">{task.title}</p>
            <p className="mt-1 text-xs text-muted">
              期限 {task.dueDate ? format(task.dueDate, 'M/d') : '-'}
            </p>
          </button>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-muted">期限切れタスクはありません</p>
        )}
      </div>
    </section>
  );
}
