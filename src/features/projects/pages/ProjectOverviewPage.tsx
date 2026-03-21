import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { STATUS_COLORS } from '@/libs/variants';
import { TASK_STATUS_META, TASK_STATUSES } from '@/types/constants';
import type { Project, TaskStatus } from '@/types/types';
import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';
import { ProgressMeter } from '../components/ProgressMeter';
import { useProjectMutations } from '../hooks/useProjects';

const PROJECT_STATUS_LABELS: Record<string, string> = {
  planning: '企画中',
  cooking: '進行中',
  on_hold: '保留',
  completed: '完了',
};

export function ProjectOverviewPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { projectId } = useParams<{ projectId: string }>();
  const { allTasks } = useTasks(projectId);
  const { update } = useProjectMutations();
  const [isEditingOverview, setEditingOverview] = useState(false);
  const [overviewText, setOverviewText] = useState(project.overview);

  const total = allTasks?.length ?? 0;
  const served = allTasks?.filter((t) => t.status === 'serve').length ?? 0;

  const statusCounts = TASK_STATUSES.reduce(
    (acc, status) => {
      acc[status] = allTasks?.filter((t) => t.status === status).length ?? 0;
      return acc;
    },
    {} as Record<TaskStatus, number>
  );

  const handleSaveOverview = async () => {
    if (!projectId) return;
    await update(projectId, { overview: overviewText });
    setEditingOverview(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-primary rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium">
          {PROJECT_STATUS_LABELS[project.status] ?? project.status}
        </span>
        <h1 className="text-xl font-bold text-body">{project.name}</h1>
      </div>

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

      <div className="rounded-lg border border-main bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-body">概要</h2>
          {!isEditingOverview && (
            <Button
              variant="quiet"
              onPress={() => {
                setOverviewText(project.overview);
                setEditingOverview(true);
              }}
            >
              編集
            </Button>
          )}
        </div>
        {isEditingOverview ? (
          <div className="space-y-2">
            <TextField
              aria-label="概要"
              value={overviewText}
              onChange={setOverviewText}
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                onPress={() => void handleSaveOverview()}
              >
                保存
              </Button>
              <Button
                variant="secondary"
                onPress={() => setEditingOverview(false)}
              >
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap text-muted">
            {project.overview || 'まだ概要がありません'}
          </p>
        )}
      </div>
    </div>
  );
}
