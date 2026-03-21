# Directory Structure & Roles

last-updated: 2026-03-21

## Directory Structure

```text
apps/task-cooker-web/src/
├─ features/              ← ドメイン機能（ページ+コンポーネント）
│  ├─ auth/
│  │  ├─ pages/           LoginPage, SignupPage
│  │  ├─ components/      GoogleLoginButton, AuthCard
│  │  └─ hooks/           useAuth.ts
│  ├─ dashboard/
│  │  ├─ pages/           DashboardPage
│  │  └─ components/      ContributionGraph, ActivityFeed, QuickAddInput
│  ├─ projects/
│  │  ├─ pages/           ProjectListPage, ProjectLayout, ProjectOverviewPage, ProjectTasksPage, ProjectSettingsPage
│  │  ├─ components/      ProjectCard, ProgressMeter, CreateProjectDialog
│  │  └─ hooks/           useProjects.ts
│  ├─ tasks/
│  │  ├─ pages/           TaskDetailPage
│  │  ├─ components/      TaskCard, TaskListView, KanbanBoard, KanbanColumn, FilterBar, ViewToggle, CreateTaskDialog, CommentThread
│  │  └─ hooks/           useTasks.ts
│  ├─ teams/
│  │  ├─ pages/           TeamListPage, TeamMembersPage
│  │  ├─ components/      TeamCard, MemberCard, InviteMemberDialog, CreateTeamDialog
│  │  └─ hooks/           useTeams.ts
│  ├─ profile/
│  │  ├─ pages/           ProfilePage
│  │  └─ hooks/           useContributions.ts
│  ├─ settings/
│  │  └─ pages/           AppSettingsPage
│  └─ landing/
│     └─ pages/           LandingPage
├─ api/                   ← Firebase / Firestore アクセス層
│  ├─ firebase.ts         Firebase 初期化
│  ├─ converters.ts       Firestore converter
│  ├─ auth.ts             認証関数（signIn, signOut, onAuthStateChanged）
│  ├─ users.ts            User ドキュメント CRUD
│  ├─ projects.ts         プロジェクト CRUD（onSnapshot, create, update, delete）
│  ├─ tasks.ts            タスク CRUD + displayId 採番
│  ├─ teams.ts            チーム CRUD + メンバー管理
│  └─ comments.ts         コメント CRUD
├─ hooks/                 ← 共通フックのみ
│  └─ useDarkTheme.ts
├─ stores/                ← Zustand（UI状態のみ）
│  └─ uiStore.ts          selectedView, filters, theme, modals
│                          ※ types.d.ts の UIStateData を参照。ただし以下はMVP変更で要調整:
│                            - isSidebarCollapsed → 不要（トップナビ型）
│                            - activeDrawer の task_upsert → 不要（全画面遷移）
│                            - ProjectTab から mixes を除外
├─ ui/                    ← 汎用UIコンポーネント（starter kitからコピー）
│  ├─ components/         Button, Select, DatePicker, Dialog, Tabs, Menu, etc.
│  ├─ layouts/            TopNav, AppLayout, LandingLayout
│  ├─ colors.ts
│  └─ index.css
├─ libs/                  ← ユーティリティ（Firebase以外）
│  ├─ tv.ts
│  └─ variants.ts
└─ types/                 ← 型定義集約
   ├─ types.d.ts          全ドメイン型
   ├─ constants.ts        ステータス/優先度メタ
   └─ schemas.ts          Zodスキーマ（フォームバリデーション等）
```

## データフロー

```
Firestore onSnapshot → TanStack Query (cache + subscription) → hooks → Component
                                                                  ↑
Zustand (UI state: view, filters, theme) ─────────────────────────┘
```

- **api/**: Firebaseとの接続インターフェース。api以外のコードはFirebaseを一切知らない
- **TanStack Query**: api/ を呼び出してデータ管理。onSnapshotをsubscriptionとして統合
- **Zustand**: UI状態のみ（selectedView、filters、theme、モーダル開閉等）
- **hooks**: TanStack Query + Zustandを組み合わせてコンポーネントに提供

## レイヤーパターン: API Service → Custom Hook → Component

### Layer 1: API Service (api/)

- React-Free: React hooks やコンポーネントロジックを含まない
- Firestore との通信のみに責務を限定
- onSnapshot の subscribe 関数を返す

### Layer 2: Custom Hook (features/\*/hooks/)

- TanStack Query でサーバー状態を管理
- useFirestoreSubscription ユーティリティで onSnapshot を統合
- loading/error/キャッシュは TanStack Query が管理

### Layer 3: Component (features/_/components/, features/_/pages/)

- 宣言的 UI のみ
- フックからデータと関数を受け取り、レンダリングに専念

## Atomic UI Components

`src/ui/components` は最小のコンポーネント単位。react-aria-components + tailwind-variants で構築。
詳細な実装パターンは既存コードを参照。
