import { useTasksQuery } from '@/features/tasks/hooks/useTasks';
import type { Project, ProjectStatus } from '@/types/types';
import { ProgressMeter } from './ProgressMeter';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: '企画中',
  cooking: '進行中',
  on_hold: '保留',
  completed: '完了',
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  cooking:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  on_hold:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const { allTasks } = useTasksQuery(project.id);
  const total = allTasks?.length ?? 0;
  const served =
    allTasks?.filter((task) => task.status === 'serve').length ?? 0;

  return (
    <div className="rounded-lg border border-main bg-surface transition hover:border-primary hover:shadow-sm">
      <button
        type="button"
        className="w-full cursor-pointer p-4 text-left"
        onClick={onPress}
      >
        <div className="flex items-center gap-3">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[project.status]}`}
          >
            {STATUS_LABELS[project.status]}
          </span>
          <h3 className="font-semibold text-body">{project.name}</h3>
        </div>
        {project.overview && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {project.overview}
          </p>
        )}
        <div className="mt-3">
          <ProgressMeter total={total} served={served} />
        </div>
      </button>
    </div>
  );
}
