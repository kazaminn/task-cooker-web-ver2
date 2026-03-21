import React, { useState } from 'react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router';
import { subscribeAllActivities } from '@/api/activities';
import { subscribeTasksCollectionGroup } from '@/api/tasks';
import { createTask } from '@/api/tasks';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import type { Task, Activity } from '@/types/types';
import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';
import { ContributionGraph } from '../components/ContributionGraph';

export function DashboardPage() {
  const { projects } = useProjects();
  const navigate = useNavigate();
  const [quickAddText, setQuickAddText] = useState('');

  const { data: activeTasks } = useFirestoreSubscription<Task>(
    ['active-tasks'],
    (cb) => subscribeTasksCollectionGroup(['prep', 'cook'], cb)
  );

  const { data: activities } = useFirestoreSubscription<Activity>(
    ['all-activities'],
    (cb) => subscribeAllActivities(10, cb)
  );

  const todayServed =
    activeTasks?.filter((t) => t.status === 'serve' && isToday(t.updatedAt))
      .length ?? 0;

  const overdueTasks =
    activeTasks?.filter(
      (t) =>
        t.dueDate &&
        isBefore(t.dueDate, startOfDay(new Date())) &&
        t.status !== 'serve'
    ) ?? [];

  const handleQuickAdd = async () => {
    if (!quickAddText.trim() || !projects?.length) return;
    const defaultProject = projects[0];
    await createTask(defaultProject.id!, defaultProject.teamId, {
      title: quickAddText.trim(),
      status: 'order',
      priority: 'medium',
    });
    setQuickAddText('');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Daily Pulse */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          本日のサマリー
        </h2>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {todayServed}
            </span>
            <span className="ml-1 text-sm text-slate-500 dark:text-slate-400">
              serve 済み
            </span>
          </div>
          {overdueTasks.length > 0 && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {overdueTasks.length} 件の期限切れ
            </div>
          )}
        </div>
      </section>

      {/* On the Stove */}
      {activeTasks && activeTasks.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            On the Stove
          </h2>
          <div className="space-y-2">
            {activeTasks.slice(0, 10).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectId={task.projectRef}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}

      {/* Contribution Graph */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          草グラフ
        </h2>
        {/* sm: 直近6ヶ月、md+: フル表示 */}
        <div className="hidden sm:block">
          <ContributionGraph activities={activities ?? []} />
        </div>
        <div className="sm:hidden">
          <ContributionGraph activities={activities ?? []} compact />
        </div>
      </section>

      {/* Recent Recipes */}
      {projects && projects.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Recent Recipes
            </h2>
            <Button variant="quiet" onPress={() => void navigate('/projects')}>
              すべて見る
            </Button>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 transition hover:border-orange-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-600"
                onClick={() => void navigate(`/projects/${project.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    void navigate(`/projects/${project.id}`);
                  }
                }}
              >
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {project.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kitchen Logs */}
      {activities && activities.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Kitchen Logs
          </h2>
          <div className="space-y-1">
            {activities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-2 py-1 text-sm text-slate-600 dark:text-slate-400"
              >
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {format(activity.createdAt, 'M/d HH:mm')}
                </span>
                <span>{activity.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Add */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Quick Add
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleQuickAdd();
          }}
          className="flex gap-2"
        >
          <div className="flex-1">
            <TextField
              aria-label="クイック追加"
              placeholder="新しい注文を入力..."
              value={quickAddText}
              onChange={setQuickAddText}
            />
          </div>
          <Button variant="primary" type="submit">
            追加
          </Button>
        </form>
      </section>
    </div>
  );
}
