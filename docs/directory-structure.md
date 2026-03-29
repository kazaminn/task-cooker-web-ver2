# Directory Structure & Roles

last-updated: 2026-03-29

---

## ディレクトリ構成

```
src/
├─ features/                ← 機能ごとにコロケーション
│  ├─ auth/
│  │  ├─ pages/             LoginPage.tsx, SignupPage.tsx
│  │  ├─ components/
│  │  └─ hooks/
│  ├─ dashboard/
│  │  ├─ pages/             DashboardPage.tsx
│  │  ├─ components/        DailyPulse, OnTheStove, ContributionGraph, etc.
│  │  ├─ hooks/             useDashboardData.ts
│  │  └─ api/
│  ├─ projects/
│  │  ├─ pages/             ProjectLayout, ProjectListPage, ProjectOverviewPage,
│  │  │                     ProjectTasksPage, ProjectNotesPage, ProjectSettingsPage
│  │  ├─ components/        ProjectCard, CreateProjectDialog, etc.
│  │  ├─ hooks/             useProjects.ts
│  │  └─ api/               projects.ts
│  ├─ tasks/
│  │  ├─ pages/             TaskDetailPage.tsx
│  │  ├─ components/        TaskCard, KanbanBoard, FilterBar, ViewToggle,
│  │  │                     CreateTaskDialog, CommentThread, etc.
│  │  ├─ hooks/             useTasks.ts
│  │  └─ api/               tasks.ts
│  ├─ notes/                ← 新規追加
│  │  ├─ pages/             NoteListPage.tsx, NoteDetailPage.tsx
│  │  ├─ components/        （v2 で追加）
│  │  ├─ hooks/             （v2 で追加）
│  │  └─ api/               notes.ts（v1: converter のみ）
│  ├─ teams/
│  │  ├─ pages/             TeamListPage.tsx, TeamMembersPage.tsx
│  │  ├─ components/
│  │  ├─ hooks/             useTeams.ts
│  │  └─ api/               teams.ts
│  ├─ profile/
│  │  └─ pages/             ProfilePage.tsx
│  └─ settings/
│     └─ pages/             AppSettingsPage.tsx
├─ ui/                      ← 共通 UI コンポーネント
│  ├─ components/           Button, Select, DatePicker, Dialog, etc.（react-aria ベース）
│  ├─ layouts/              TopNav, AppLayout, LandingLayout
│  ├─ colors.ts
│  └─ index.css             ← デザイントークン（@theme）、テーマ変数定義
├─ api/                     ← 共通 API サービス
│  ├─ auth.ts               Firebase Auth 操作
│  └─ storage.ts            StorageService インターフェース + validateFile（型のみ）
├─ store/                   ← Zustand ストア
│  ├─ authStore.ts
│  ├─ uiStore.ts
│  └─ themeStore.ts         ← テーマ切替（light / tavern-dark）
├─ libs/                    ← ユーティリティ（Firebase 以外）
│  ├─ tv.ts                 tailwind-variants
│  ├─ variants.ts
│  └─ tavern-copy.ts        ← 酒場テーマ用コピー文言
└─ types/                   ← 型定義集約
   ├─ types.d.ts            全ドメイン型（Note, FileAttachment 追加済み）
   ├─ constants.ts          ステータス/優先度メタ + ALLOWED_MIME_TYPES
   └─ schemas.ts            Zod スキーマ（フォームバリデーション等）
```

## api/ の二重構造

| パス                          | 責務                                                   |
| ----------------------------- | ------------------------------------------------------ |
| `src/api/`                    | 共通サービス（auth, storage）。機能横断                |
| `src/features/{feature}/api/` | 機能固有の Firestore 操作（tasks, projects, notes 等） |

`src/api/` 以外のコードは Firebase を直接 import しない。

---

## データフロー

```
Firestore onSnapshot → TanStack Query (cache + subscription) → hooks → Component
                                                                  ↑
Zustand (UI state: view, filters, theme) ─────────────────────────┘
```

- **features/{feature}/api/**: Firebase との接続インターフェース。api 以外のコードは Firebase を一切知らない
- **TanStack Query**: api/ を呼び出してデータ管理。onSnapshot を subscription として統合
- **Zustand**: UI 状態のみ（selectedView、filters、theme、モーダル開閉等）
- **hooks**: TanStack Query + Zustand を組み合わせてコンポーネントに提供

## レイヤーパターン: API Service → Custom Hook → Component

### Layer 1: API Service (features/{feature}/api/)

- React-Free: React hooks やコンポーネントロジックを含まない
- Firestore との通信のみに責務を限定
- onSnapshot の subscribe 関数を返す

### Layer 2: Custom Hook (features/{feature}/hooks/)

- TanStack Query でサーバー状態を管理
- useFirestoreSubscription ユーティリティで onSnapshot を統合
- loading/error/キャッシュは TanStack Query が管理

### Layer 3: Component (features/{feature}/components/, features/{feature}/pages/)

- 宣言的 UI のみ
- フックからデータと関数を受け取り、レンダリングに専念

## テストファイル配置

ソースファイルと同階層にコロケーション:

```
features/tasks/hooks/useTasks.ts
features/tasks/hooks/useTasks.test.ts      ← 隣に置く
features/tasks/components/TaskCard.tsx
features/tasks/components/TaskCard.test.tsx ← 隣に置く
features/tasks/components/TaskCard.stories.tsx ← 隣に置く
```

`__tests__/` ディレクトリ禁止。1コンポーネント最大3ファイル（.tsx / .test.tsx / .stories.tsx）。

## Atomic UI Components

`src/ui/components` は最小のコンポーネント単位。react-aria-components + tailwind-variants で構築。

---

## 変更履歴

- 2026-03-29: `features/notes/` 追加。`api/storage.ts` 追加。`store/themeStore.ts` 追加。`libs/tavern-copy.ts` 追加。テストファイル配置ルールを明記。api/ の二重構造を明記
- 2026-03-21: 初版
