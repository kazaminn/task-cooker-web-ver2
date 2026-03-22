import { useNavigate } from 'react-router';
import type { Task } from '@/types/types';
import { DailyPulseSection } from '../components/DailyPulseSection';
import { KitchenLogsSection } from '../components/KitchenLogsSection';
import { QuickAddSection } from '../components/QuickAddSection';
import { RecentProjectsSection } from '../components/RecentProjectsSection';
import { StoveSection } from '../components/StoveSection';
import { useDashboardData } from '../hooks/useDashboardData';

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    projects,
    activities,
    stoveTasks,
    overdueTasks,
    todayServed,
    recentProjects,
    isLoading,
  } = useDashboardData();
  const defaultProject = projects?.[0];
  const openProject = (projectId: string) => {
    void navigate(`/projects/${projectId}`);
  };
  const openTask = (task: Task) => {
    void navigate(`/projects/${task.projectRef}/tasks/${task.id}`);
  };

  return (
    <div className="w-full py-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_22rem]">
        <div className="space-y-6">
          <DailyPulseSection
            isLoading={isLoading}
            todayServed={todayServed}
            overdueCount={overdueTasks.length}
            stoveCount={stoveTasks.length}
            onBrowseProjects={() => void navigate('/projects')}
          />
          <QuickAddSection
            projectId={defaultProject?.id}
            projectName={defaultProject?.name}
            teamId={defaultProject?.teamId}
            disabled={!defaultProject}
          />
          <StoveSection
            isLoading={isLoading}
            tasks={stoveTasks}
            onOpenTask={openTask}
          />
          <KitchenLogsSection activities={activities ?? []} />
        </div>

        <aside>
          <RecentProjectsSection
            projects={recentProjects}
            isLoading={isLoading}
            onBrowseProjects={() => void navigate('/projects')}
            onOpenProject={openProject}
            title="Project Overview"
            description="進行中プロジェクトの状況を右側で俯瞰"
          />
        </aside>
      </div>
    </div>
  );
}
