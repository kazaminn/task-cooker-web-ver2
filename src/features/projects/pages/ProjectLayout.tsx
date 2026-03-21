import React from 'react';
import { Outlet, useParams, NavLink } from 'react-router';
import { Breadcrumbs, Breadcrumb } from '@/ui/components/Breadcrumbs';
import { Link } from '@/ui/components/Link';
import { useProject } from '../hooks/useProjects';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `inline-block px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
    isActive
      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
  }`;

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
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
        <p className="text-slate-500">プロジェクトが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Breadcrumbs>
        <Breadcrumb>
          <Link href="/projects">Projects</Link>
        </Breadcrumb>
        <Breadcrumb>{project.name}</Breadcrumb>
      </Breadcrumbs>

      <nav className="mt-4 flex gap-0 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        <NavLink to="" end className={tabClass}>
          Overview
        </NavLink>
        <NavLink to="tasks" className={tabClass}>
          Tasks
        </NavLink>
        <NavLink to="settings" className={tabClass}>
          Settings
        </NavLink>
      </nav>

      <div className="mt-6">
        <Outlet context={{ project }} />
      </div>
    </div>
  );
}
