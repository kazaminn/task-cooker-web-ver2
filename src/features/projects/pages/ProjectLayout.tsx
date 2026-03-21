import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { Breadcrumbs, Breadcrumb } from '@/ui/components/Breadcrumbs';
import { Tab, TabList, Tabs } from '@/ui/components/Tabs';
import { useProject } from '../hooks/useProjects';

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { project, isLoading } = useProject(projectId);

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

  return (
    <div className="w-full py-6">
      <Breadcrumbs>
        <Breadcrumb href="/projects">Projects</Breadcrumb>
        <Breadcrumb>{project.name}</Breadcrumb>
      </Breadcrumbs>

      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => {
          if (key === 'overview') void navigate(`/projects/${project.id}`);
          if (key === 'tasks') void navigate(`/projects/${project.id}/tasks`);
          if (key === 'settings')
            void navigate(`/projects/${project.id}/settings`);
        }}
        className="mt-4"
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
