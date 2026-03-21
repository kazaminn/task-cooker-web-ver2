## routing

last-updated: 2026-03-21

Use the `ProtectedRoute` component to determine the user's logged-in status, and branch the route depending on the status.

This prevents users who are not logged in from accessing protected pages.

```typescript
import { createBrowserRouter } from 'react-router';

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
    element: <ProtectedRoute />,
    children: [
      {
        path: 'home',
        element: <DashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectListPage />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectLayout />,
        children: [
          { index: true, element: <ProjectOverviewPage /> },
          { path: 'tasks', element: <ProjectTasksPage /> },
          { path: 'tasks/:taskId', element: <TaskDetailPage /> },
          { path: 'settings', element: <ProjectSettingsPage /> },
        ],
      },
      {
        path: 'teams',
        element: <TeamListPage />,
      },
      {
        path: 'teams/:teamId/members',
        element: <TeamMembersPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <AppSettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```

### プランとの差分メモ

- `/projects/:projectId` の index で overview を直接表示（`/overview` サブルートなし）
- タスク詳細は全画面遷移（`/projects/:id/tasks/:taskId`）、Right Drawer ではない
- Mix ルートは MVP 外（削除済み）
- `react-router-dom` → `react-router`（React Router v7）

## file locations

```text
src/
├── features/
│   ├── auth/pages/          LoginPage, SignupPage
│   ├── dashboard/pages/     DashboardPage
│   ├── projects/pages/      ProjectListPage, ProjectLayout, ProjectOverviewPage, ProjectTasksPage, ProjectSettingsPage
│   ├── tasks/pages/         TaskDetailPage
│   ├── teams/pages/         TeamListPage, TeamMembersPage
│   ├── profile/pages/       ProfilePage
│   ├── settings/pages/      AppSettingsPage
│   └── landing/pages/       LandingPage
└── ui/pages/                NotFoundPage
```
