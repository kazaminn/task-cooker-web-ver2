import { useCallback, useState } from 'react';
import { format } from 'date-fns';
import { useOutletContext, useParams } from 'react-router';
import { subscribeProjectActivities } from '@/api/activities';
import { useTasksQuery } from '@/features/tasks/hooks/useTasks';
import { queryKeys } from '@/hooks/queryKeys';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { STATUS_COLORS } from '@/libs/variants';
import { TASK_STATUS_META, TASK_STATUSES } from '@/types/constants';
import type { Activity, Project, TaskStatus } from '@/types/types';
import { Button } from '@/ui/components/Button';
import { TextArea } from '@/ui/components/TextArea';
import { ProgressMeter } from '../components/ProgressMeter';
import { useProjectMutations } from '../hooks/useProjects';

export function ProjectOverviewPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { projectId } = useParams<{ projectId: string }>();
  const { allTasks } = useTasksQuery(projectId);
  const subscribeToProjectActivities = useCallback(
    (cb: (data: Activity[]) => void, onError?: (error: Error) => void) => {
      if (!projectId)
        return () => {
          /* noop */
        };
      return subscribeProjectActivities(projectId, 6, cb, onError);
    },
    [projectId]
  );
  const { data: activities } = useFirestoreSubscription<Activity>(
    queryKeys.activities.project(projectId, 6),
    subscribeToProjectActivities,
    { enabled: Boolean(projectId) }
  );
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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-main bg-surface p-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
            Owner
          </p>
          <p className="mt-2 text-sm font-medium text-body">
            {project.ownerId}
          </p>
        </div>
        <div className="rounded-2xl border border-main bg-surface p-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
            Members
          </p>
          <p className="mt-2 text-sm font-medium text-body">
            {project.memberIds.length}
          </p>
        </div>
        <div className="rounded-2xl border border-main bg-surface p-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
            Created
          </p>
          <p className="mt-2 text-sm font-medium text-body">
            {format(project.createdAt, 'yyyy/MM/dd')}
          </p>
        </div>
        <div className="rounded-2xl border border-main bg-surface p-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
            Updated
          </p>
          <p className="mt-2 text-sm font-medium text-body">
            {format(project.updatedAt, 'yyyy/MM/dd HH:mm')}
          </p>
        </div>
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
              variant="outline"
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
            <TextArea
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

      <div className="rounded-lg border border-main bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-body">Recent Activity</h2>
          <span className="text-xs text-muted">直近 6 件</span>
        </div>
        <div className="space-y-2">
          {activities?.length ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-xl border border-main bg-base/70 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-body">
                    {activity.userName}
                  </span>
                  <span className="text-xs text-muted">
                    {format(activity.createdAt, 'M/d HH:mm')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{activity.text}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">まだアクティビティはありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
