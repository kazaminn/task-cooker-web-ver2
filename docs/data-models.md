# Data Models

last-updated: 2026-03-21

Firestore パス構造はトップレベル（`projects/{projectId}/tasks/...`）。
型定義の正は `apps/task-cooker-web/src/types/types.d.ts`。

---

## User Model

```typescript
export interface User {
  id: string; // Firestore documentID = Firebase Auth UID
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    activeThemeId?: string; // [FUTURE]
    lastActiveWorkspaceId?: string;
    projectViews?: Record<string, TaskViewType>; // [FUTURE]
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Team Model

個人=1人チーム。MVP から導入。

```typescript
export type TeamType = 'personal' | 'team';

export interface Team {
  id: string;
  name: string;
  type: TeamType;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
}
```

## Project Model

```typescript
export interface Project {
  id: string;
  slug: string;
  name: string;
  overview: string; // プレーンテキスト（MVP）。将来 Markdown
  teamId: string;
  ownerId: string;
  memberIds: string[];
  members: Author[]; // Denormalized
  status: ProjectStatus; // 'planning' | 'cooking' | 'on_hold' | 'completed'
  createdAt: Date;
  updatedAt: Date;
}
```

## Task Model

```typescript
export interface Task {
  id: string; // Firestore doc ID (UUID)
  displayId: number; // User-facing sequential ID (#1, #2, ...)
  projectRef: string;
  title: string;
  description?: string;
  status: TaskStatus; // 'order' | 'prep' | 'cook' | 'serve'
  priority: TaskPriority; // 'urgent' | 'high' | 'medium' | 'low'
  teamId: string; // Denormalized for security rules
  assigneeId?: string; // Matches User.id
  assignee?: Author; // Denormalized
  dueDate?: Date;
  linkedTaskIds: string[]; // Firestore doc IDs of linked tasks
  position: number; // Order index for sorting
  createdAt: Date;
  updatedAt: Date;
}
```

### displayId 採番

クライアント側 Firestore トランザクションで `projects/{projectId}/counters/task` の `current` を atomic increment。プロジェクトスコープで #1 から採番。

## TaskComment Model

```typescript
export interface TaskComment {
  id?: string;
  author: 'user' | 'claude' | 'codex'; // 種別
  authorId: string; // 誰が書いたか
  authorName: string; // 表示名
  body: string;
  createdAt: Date;
}
```

## Activity Model

クライアント側で書き込み。タスク/プロジェクト操作時に api/ 内で同時作成。

```typescript
export type ActivityType =
  | 'task_create'
  | 'task_update'
  | 'project_create'
  | 'project_update'
  | 'team_create'
  | 'user_signup'
  | 'profile_update';

export interface Activity {
  id: string;
  type: ActivityType;
  teamId?: string;
  projectId?: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}
```

### 貢献グラフデータ

Activity コレクションから日別に集計して表示。別コレクションは不要。

## Mix & Post Models（MVP 外）

```typescript
export interface Mix {
  id: string;
  projectRef: string;
  authorId: string;
  title: string;
  status: 'open' | 'closed';
  author: Author; // Denormalized
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MixPost {
  id: string;
  author: Author;
  content: string; // Markdown
  createdAt: Date;
}
```

## Converter 方針

api 層の内部実装として各 Phase で必要時に追加。

- **Phase 1** — userConverter
- **Phase 3** — activityConverter
- **Phase 4** — commentConverter
