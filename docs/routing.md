# Routing

last-updated: 2026-03-29

---

## ルート構成

### パブリック

| パス      | ページ       | レイアウト    | ファイル                                 |
| --------- | ------------ | ------------- | ---------------------------------------- |
| `/`       | LandingPage  | LandingLayout | `features/landing/pages/LandingPage.tsx` |
| `/login`  | LoginPage    | LandingLayout | `features/auth/pages/LoginPage.tsx`      |
| `/signup` | SignupPage   | LandingLayout | `features/auth/pages/SignupPage.tsx`     |
| `*`       | NotFoundPage | —             | `ui/pages/NotFoundPage.tsx`              |

### Protected（認証必須）

| パス                                 | ページ              | レイアウト    | ファイル                                          |
| ------------------------------------ | ------------------- | ------------- | ------------------------------------------------- |
| `/home`                              | DashboardPage       | AppLayout     | `features/dashboard/pages/DashboardPage.tsx`      |
| `/projects`                          | ProjectListPage     | AppLayout     | `features/projects/pages/ProjectListPage.tsx`     |
| `/projects/:projectId`               | ProjectLayout       | AppLayout     | `features/projects/pages/ProjectLayout.tsx`       |
| `/projects/:projectId` (index)       | ProjectOverviewPage | ProjectLayout | `features/projects/pages/ProjectOverviewPage.tsx` |
| `/projects/:projectId/tasks`         | ProjectTasksPage    | ProjectLayout | `features/projects/pages/ProjectTasksPage.tsx`    |
| `/projects/:projectId/notes`         | ProjectNotesPage    | ProjectLayout | `features/projects/pages/ProjectNotesPage.tsx`    |
| `/projects/:projectId/settings`      | ProjectSettingsPage | ProjectLayout | `features/projects/pages/ProjectSettingsPage.tsx` |
| `/projects/:projectId/tasks/:taskId` | TaskDetailPage      | ProjectLayout | `features/tasks/pages/TaskDetailPage.tsx`         |
| `/notes`                             | NoteListPage        | AppLayout     | `features/notes/pages/NoteListPage.tsx`           |
| `/notes/:noteId`                     | NoteDetailPage      | AppLayout     | `features/notes/pages/NoteDetailPage.tsx`         |
| `/teams`                             | TeamListPage        | AppLayout     | `features/teams/pages/TeamListPage.tsx`           |
| `/teams/:teamId/members`             | TeamMembersPage     | AppLayout     | `features/teams/pages/TeamMembersPage.tsx`        |
| `/profile`                           | ProfilePage         | AppLayout     | `features/profile/pages/ProfilePage.tsx`          |
| `/settings`                          | AppSettingsPage     | AppLayout     | `features/settings/pages/AppSettingsPage.tsx`     |

---

## グローバルナビゲーション（TopNav）

```
Dashboard | Projects | Notes
```

## ProjectLayout タブ

```
Overview | Tasks | Notes | Settings
```

ProjectLayout は入れ子レイアウト。`/projects/:projectId` にアクセスすると Overview にリダイレクト。

---

## Note のルーティング方針

- Note はトップレベルルート（`/notes/:noteId`）
- Project 内の Notes タブ（`/projects/:pjId/notes`）は Project.tag でフィルタした一覧を表示
- Notes タブ内でノートをクリック → `/notes/:noteId` に遷移（Project 文脈を離れる）
- 1つの Note が複数 Project に属せるため、URL に projectId を含めない

---

## 変更履歴

- 2026-03-29: `/notes`, `/notes/:noteId` 追加。`/projects/:pjId/mixes` → `/projects/:pjId/notes` に変更。TopNav に Notes 追加。ProjectTabs の Mixes → Notes 変更
- 2026-03-21: 初版
