import { STATUS_COLORS } from '@/libs/variants';
import {
  TASK_STATUS_META,
  TASK_STATUSES,
  type TaskStatus,
} from '@/types/constants';
import { ProgressMeter } from './ProgressMeter';

interface ProjectProgressSectionProps {
  total: number;
  served: number;
  statusCounts: Record<TaskStatus, number>;
}

export function ProjectProgressSection({
  total,
  served,
  statusCounts,
}: ProjectProgressSectionProps) {
  return (
    <div className="rounded-lg border border-main bg-surface p-4">
      <ProgressMeter total={total} served={served} />
      <div className="mt-3 flex flex-wrap gap-3">
        {TASK_STATUSES.map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status].split(' ')[0]}`}
            />
            <span className="text-xs text-muted">
              {TASK_STATUS_META[status].ja}: {statusCounts[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
