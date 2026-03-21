import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { createTask } from '@/api/tasks';
import { ProgressMeter } from '@/features/projects/components/ProgressMeter';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';
import { ContributionGraph } from '../components/ContributionGraph';
import { useDashboardData } from '../hooks/useDashboardData';

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    projects,
    activities,
    userActivities,
    stoveTasks,
    overdueTasks,
    todayServed,
    recentProjects,
    isLoading,
  } = useDashboardData();
  const [quickAddText, setQuickAddText] = useState('');
  const recipeSkeletonIds = ['recipe-skel-1', 'recipe-skel-2', 'recipe-skel-3'];
  const stoveSkeletonIds = [
    'stove-skel-1',
    'stove-skel-2',
    'stove-skel-3',
    'stove-skel-4',
  ];

  const handleQuickAdd = async () => {
    if (!quickAddText.trim() || !projects?.length) {
      return;
    }

    const defaultProject = projects[0];
    await createTask(defaultProject.id!, defaultProject.teamId, {
      title: quickAddText.trim(),
      status: 'order',
      priority: 'medium',
    });
    setQuickAddText('');
  };

  return (
    <div className="w-full py-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-main bg-[linear-gradient(135deg,var(--color-surface),color-mix(in_oklab,var(--color-primary)_8%,var(--color-base)))] p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
                  Daily Pulse
                </p>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-body sm:text-4xl">
                    今日のキッチン状況
                  </h1>
                  <p className="max-w-2xl text-sm text-muted sm:text-base">
                    serve
                    数、期限切れ、進行中タスクをひと目で見て、次に手を付けるべき皿を決めるためのダッシュボードです。
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onPress={() => void navigate('/projects')}
              >
                プロジェクト一覧へ
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-main bg-base/80 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
                  Today Served
                </p>
                <p className="mt-3 text-3xl font-bold text-body tabular-nums">
                  {isLoading ? '—' : todayServed}
                </p>
                <p className="mt-1 text-sm text-muted">本日完了したタスク</p>
              </div>
              <div className="rounded-2xl border border-main bg-base/80 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
                  Overdue
                </p>
                <p className="mt-3 text-3xl font-bold text-danger tabular-nums">
                  {isLoading ? '—' : overdueTasks.length}
                </p>
                <p className="mt-1 text-sm text-muted">期限切れタスク</p>
              </div>
              <div className="rounded-2xl border border-main bg-base/80 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
                  On The Stove
                </p>
                <p className="mt-3 text-3xl font-bold text-body tabular-nums">
                  {isLoading ? '—' : stoveTasks.length}
                </p>
                <p className="mt-1 text-sm text-muted">prep / cook 中</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-body">
                  Contribution
                </h2>
                <p className="text-sm text-muted">
                  最近の積み上がりを週次で俯瞰
                </p>
              </div>
              <Button variant="quiet" onPress={() => void navigate('/profile')}>
                プロフィールへ
              </Button>
            </div>
            <div className="hidden sm:block">
              <ContributionGraph activities={userActivities} />
            </div>
            <div className="sm:hidden">
              <ContributionGraph activities={userActivities} compact />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <div className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-body">
                    Recent Recipes
                  </h2>
                  <p className="text-sm text-muted">
                    直近のプロジェクト進捗をまとめて確認
                  </p>
                </div>
                <Button
                  variant="quiet"
                  onPress={() => void navigate('/projects')}
                >
                  すべて見る
                </Button>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3" aria-hidden="true">
                    {recipeSkeletonIds.map((id) => (
                      <div
                        key={id}
                        className="h-28 animate-pulse rounded-2xl border border-main bg-base/60"
                      />
                    ))}
                  </div>
                ) : recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      className="w-full rounded-2xl border border-main bg-base/70 p-4 text-left transition hover:border-primary hover:bg-base"
                      onClick={() => void navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-body">
                            {project.name}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            Active {project.activeTasks} / Total{' '}
                            {project.totalTasks}
                          </p>
                        </div>
                        <span className="text-primary rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium">
                          {project.status}
                        </span>
                      </div>
                      <div className="mt-4">
                        <ProgressMeter
                          total={project.totalTasks}
                          served={project.servedTasks}
                        />
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted">
                    プロジェクトがまだありません
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-body">Quick Add</h2>
              <p className="mt-1 text-sm text-muted">
                デフォルトプロジェクトへ order を即追加します。
              </p>
              <form
                className="mt-4 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleQuickAdd();
                }}
              >
                <TextField
                  aria-label="クイック追加"
                  placeholder="追加するタスク名"
                  value={quickAddText}
                  onChange={setQuickAddText}
                />
                <Button variant="primary" type="submit" className="w-full">
                  注文を追加
                </Button>
              </form>

              <div className="mt-6 border-t border-main pt-5">
                <h3 className="text-sm font-semibold text-body">Next Action</h3>
                <p className="mt-2 text-sm text-muted">
                  新しい order を 1
                  件足すか、進行中タスクの整理に進んでください。
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-body">
                  On the Stove
                </h2>
                <p className="text-sm text-muted">
                  今すぐ手を動かすタスクだけを横断表示
                </p>
              </div>
              <span className="rounded-full bg-hover px-2.5 py-1 text-xs text-muted">
                {isLoading ? 'loading' : `${stoveTasks.length} items`}
              </span>
            </div>
            {isLoading ? (
              <div className="grid gap-3 md:grid-cols-2" aria-hidden="true">
                {stoveSkeletonIds.map((id) => (
                  <div
                    key={id}
                    className="h-24 animate-pulse rounded-2xl border border-main bg-base/60"
                  />
                ))}
              </div>
            ) : stoveTasks.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {stoveTasks.slice(0, 8).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projectId={task.projectRef}
                    variant="full"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">進行中のタスクはありません</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-body">Kitchen Logs</h2>
            <p className="mt-1 text-sm text-muted">
              直近のアクティビティを時系列で確認
            </p>
            <div className="mt-4 space-y-3">
              {(activities ?? []).slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-main bg-base/70 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-body">
                      {activity.userName}
                    </span>
                    <span className="text-xs text-muted">
                      {format(activity.createdAt, 'M/d HH:mm')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{activity.text}</p>
                </div>
              ))}
              {!activities?.length && (
                <p className="text-sm text-muted">
                  アクティビティはまだありません
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-body">Attention</h2>
            <div className="mt-4 space-y-3">
              {overdueTasks.slice(0, 5).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className="w-full rounded-2xl border border-danger/30 bg-danger/5 p-3 text-left transition hover:border-danger/50"
                  onClick={() =>
                    void navigate(
                      `/projects/${task.projectRef}/tasks/${task.id}`
                    )
                  }
                >
                  <p className="text-sm font-medium text-body">{task.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    期限 {task.dueDate ? format(task.dueDate, 'M/d') : '-'}
                  </p>
                </button>
              ))}
              {!overdueTasks.length && (
                <p className="text-sm text-muted">期限切れタスクはありません</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
