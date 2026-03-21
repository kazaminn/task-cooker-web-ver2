import { useState } from 'react';
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
      <section className="rounded-lg border border-main bg-surface p-4">
        <h2 className="mb-2 text-sm font-semibold text-body">本日のサマリー</h2>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-primary text-2xl font-bold">
              {todayServed}
            </span>
            <span className="ml-1 text-sm text-muted">serve 済み</span>
          </div>
          {overdueTasks.length > 0 && (
            <div className="text-sm text-danger">
              {overdueTasks.length} 件の期限切れ
            </div>
          )}
        </div>
      </section>

      {/* On the Stove */}
      {activeTasks && activeTasks.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-body">On the Stove</h2>
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
        <h2 className="mb-3 text-sm font-semibold text-body">草グラフ</h2>
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
            <h2 className="text-sm font-semibold text-body">Recent Recipes</h2>
            <Button variant="quiet" onPress={() => void navigate('/projects')}>
              すべて見る
            </Button>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="rounded-lg border border-main bg-surface transition hover:border-primary"
              >
                <button
                  type="button"
                  className="w-full cursor-pointer p-3 text-left"
                  onClick={() => void navigate(`/projects/${project.id}`)}
                >
                  <span className="text-sm font-medium text-body">
                    {project.name}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kitchen Logs */}
      {activities && activities.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-body">Kitchen Logs</h2>
          <div className="space-y-1">
            {activities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-2 py-1 text-sm text-muted"
              >
                <span className="text-xs text-muted">
                  {format(activity.createdAt, 'M/d HH:mm')}
                </span>
                <span>{activity.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Add */}
      <section className="rounded-lg border border-main bg-surface p-4">
        <h2 className="mb-2 text-sm font-semibold text-body">Quick Add</h2>
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
