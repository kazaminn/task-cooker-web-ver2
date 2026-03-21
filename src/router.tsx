import React from 'react';
import { createBrowserRouter } from 'react-router';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { LandingPage } from '@/features/landing/pages/LandingPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { ProjectLayout } from '@/features/projects/pages/ProjectLayout';
import { ProjectListPage } from '@/features/projects/pages/ProjectListPage';
import { ProjectOverviewPage } from '@/features/projects/pages/ProjectOverviewPage';
import { ProjectSettingsPage } from '@/features/projects/pages/ProjectSettingsPage';
import { ProjectTasksPage } from '@/features/projects/pages/ProjectTasksPage';
import { AppSettingsPage } from '@/features/settings/pages/AppSettingsPage';
import { TaskDetailPage } from '@/features/tasks/pages/TaskDetailPage';
import { TeamListPage } from '@/features/teams/pages/TeamListPage';
import { TeamMembersPage } from '@/features/teams/pages/TeamMembersPage';
import { AppLayout } from '@/ui/layouts/AppLayout';
import { NotFoundPage } from '@/ui/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/home',
            element: <DashboardPage />,
          },
          {
            path: '/projects',
            element: <ProjectListPage />,
          },
          {
            path: '/projects/:projectId',
            element: <ProjectLayout />,
            children: [
              { index: true, element: <ProjectOverviewPage /> },
              { path: 'tasks', element: <ProjectTasksPage /> },
              { path: 'tasks/:taskId', element: <TaskDetailPage /> },
              { path: 'settings', element: <ProjectSettingsPage /> },
            ],
          },
          {
            path: '/teams',
            element: <TeamListPage />,
          },
          {
            path: '/teams/:teamId/members',
            element: <TeamMembersPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
          {
            path: '/settings',
            element: <AppSettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
