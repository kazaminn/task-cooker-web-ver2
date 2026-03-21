import type { ProjectStatus } from '@/types/types';

interface DashboardProjectSummary {
  id?: string;
  name: string;
  status: ProjectStatus;
  totalTasks: number;
  servedTasks: number;
  activeTasks: number;
}

interface RecentProjectsSectionProps {
  projects: DashboardProjectSummary[];
  isLoading: boolean;
  onBrowseProjects: () => void;
  onOpenProject: (projectId: string) => void;
}

const recipeSkeletonIds = ['recipe-skel-1', 'recipe-skel-2', 'recipe-skel-3'];

export function RecentProjectsSection({
  projects,
  isLoading,
  onBrowseProjects,
  onOpenProject,
}: RecentProjectsSectionProps) {
  return (
    <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-body">Recent Recipes</h2>
          <p className="text-sm text-muted">
            直近のプロジェクト進捗をまとめて確認
          </p>
        </div>
        <button
          type="button"
          className="text-sm text-muted transition hover:text-body"
          onClick={onBrowseProjects}
        >
          すべて見る
        </button>
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
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className="w-full rounded-2xl border border-main bg-base/70 p-4 text-left transition hover:border-primary hover:bg-base"
              onClick={() => project.id && onOpenProject(project.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-body">
                    {project.name}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Active {project.activeTasks} / Total {project.totalTasks}
                  </p>
                </div>
                <span className="text-primary rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium">
                  {project.status}
                </span>
              </div>
              <div className="mt-4">
                <div className="h-2 rounded-full bg-hover">
                  <div
                    className="h-full rounded-full bg-primary transition"
                    style={{
                      width:
                        project.totalTasks > 0
                          ? `${(project.servedTasks / project.totalTasks) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
            </button>
          ))
        ) : (
          <p className="text-sm text-muted">プロジェクトがまだありません</p>
        )}
      </div>
    </section>
  );
}
