import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { Breadcrumbs, Breadcrumb } from '@/ui/components/Breadcrumbs';
import { Tab, TabList, Tabs } from '@/ui/components/Tabs';
import { useProjectQuery } from '../hooks/useProjects';

const PROJECT_STATUS_LABELS: Record<string, string> = {
  planning: '企画中',
  cooking: '進行中',
  on_hold: '保留',
  completed: '完了',
};

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { project, isLoading } = useProjectQuery(projectId);

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted">読み込み中...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-muted">プロジェクトが見つかりません</p>
      </div>
    );
  }

  const path = location.pathname;
  const selectedTab = path.endsWith('/settings')
    ? 'settings'
    : path.includes('/tasks')
      ? 'tasks'
      : 'overview';
  const isTaskDetailPage = path.includes('/tasks/') && !path.endsWith('/tasks');

  return (
    <div className="w-full py-6">
      <Breadcrumbs>
        <Breadcrumb href="/home">Dashboard</Breadcrumb>
        <Breadcrumb href={`/projects/${project.id}`}>{project.slug}</Breadcrumb>
        {isTaskDetailPage ? <Breadcrumb>Task</Breadcrumb> : undefined}
      </Breadcrumbs>

      <section className="mt-4 rounded-3xl border border-main bg-surface p-5 shadow-sm">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-primary rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium">
              {PROJECT_STATUS_LABELS[project.status] ?? project.status}
            </span>
            <span className="rounded-full bg-base px-2.5 py-1 text-xs text-muted">
              /{project.slug}
            </span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-body sm:text-3xl">
              {project.name}
            </h1>
            <p className="max-w-3xl text-sm text-muted">
              {project.overview || 'まだ概要がありません'}
            </p>
          </div>
        </div>
      </section>

      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => {
          if (key === 'overview') void navigate(`/projects/${project.id}`);
          if (key === 'tasks') void navigate(`/projects/${project.id}/tasks`);
          if (key === 'settings')
            void navigate(`/projects/${project.id}/settings`);
        }}
        className="mt-6"
      >
        <TabList aria-label="Project tabs" className="border-b border-main">
          <Tab id="overview">Overview</Tab>
          <Tab id="tasks">Tasks</Tab>
          <Tab id="settings">Settings</Tab>
        </TabList>
      </Tabs>

      <div className="mt-6">
        <Outlet context={{ project }} />
      </div>
    </div>
  );
}
