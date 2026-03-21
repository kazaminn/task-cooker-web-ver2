import { useNavigate } from 'react-router';
import type { Task } from '@/types/types';
import { AttentionSection } from '../components/AttentionSection';
import { ContributionSection } from '../components/ContributionSection';
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
    userActivities,
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-6">
          <DailyPulseSection
            isLoading={isLoading}
            todayServed={todayServed}
            overdueCount={overdueTasks.length}
            stoveCount={stoveTasks.length}
            onBrowseProjects={() => void navigate('/projects')}
          />

          <ContributionSection
            activities={userActivities}
            onOpenProfile={() => void navigate('/profile')}
          />

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <RecentProjectsSection
              projects={recentProjects}
              isLoading={isLoading}
              onBrowseProjects={() => void navigate('/projects')}
              onOpenProject={openProject}
            />
            <QuickAddSection
              projectId={defaultProject?.id}
              teamId={defaultProject?.teamId}
              disabled={!defaultProject}
            />
          </section>

          <StoveSection
            isLoading={isLoading}
            tasks={stoveTasks}
            onOpenTask={openTask}
          />
        </div>

        <aside className="space-y-6">
          <KitchenLogsSection activities={activities ?? []} />
          <AttentionSection tasks={overdueTasks} onOpenTask={openTask} />
        </aside>
      </div>
    </div>
  );
}
