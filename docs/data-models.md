# Data Models

last-updated: 2026-03-29

TaskCooker Web のデータモデル正本。
アプリ層の型は `Date` / `undefined` を使い、Firestore 固有型は API / converter 境界で吸収する。
型定義の正は `src/types/types.d.ts`。

---

## モデル方針

- ステータス4値（`order` / `prep` / `cook` / `serve`）は不変
- 優先度4値（`urgent` / `high` / `medium` / `low`）は不変
- アプリ層で `null` は使わない。未設定は `undefined`
- アプリ層で `Timestamp` は使わない。日時は `Date`
- Firestore との変換は converter / API 層で行う
- Note はトップレベルコレクション
- StorageService は現時点では interface とバリデーションのみ

---

## Firestore コレクション構造

```text
teams/{teamId}
projects/{projectId}
  ├─ tasks/{taskId}
  │   └─ comments/{commentId}
  ├─ activities/{activityId}
  └─ counters/{counterName}
notes/{noteId}
```

---

## ブランド型

```typescript
type NoteId = string & { readonly __brand: 'NoteId' };
type AttachmentId = string & { readonly __brand: 'AttachmentId' };
type AttachmentType = 'image' | 'document';
```

---

## User Model

```typescript
export interface User {
  id: string; // Firestore document ID = Firebase Auth UID
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    activeThemeId?: string; // future
    lastActiveWorkspaceId?: string;
    projectViews?: Record<string, TaskViewType>; // future
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Team Model

個人 = 1人チーム。MVP から導入。

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
  overview: string; // 既存の長め概要
  shortDescription?: string; // 一覧カード用の1行概要
  tag: string; // Note 紐付け用タグ名
  readme?: string; // 詳細説明の Markdown
  teamId: string;
  ownerId: string;
  memberIds: string[];
  members: Author[]; // denormalized
  status: ProjectStatus; // 'planning' | 'cooking' | 'on_hold' | 'completed'
  createdAt: Date;
  updatedAt: Date;
}
```

### overview / shortDescription / readme の使い分け

- `overview`: プロジェクト概要ページに表示する長めのテキスト
- `shortDescription`: プロジェクト一覧カード等に表示する1行概要
- `readme`: プロジェクト概要ページ下部に表示する Markdown ドキュメント

## Task Model

```typescript
export interface Task {
  id: string; // Firestore doc ID
  displayId: number; // user-facing sequential ID (#1, #2, ...)
  projectRef: string;
  title: string;
  description?: string;
  status: TaskStatus; // 'order' | 'prep' | 'cook' | 'serve'
  priority: TaskPriority; // 'urgent' | 'high' | 'medium' | 'low'
  teamId: string; // denormalized for security rules
  assigneeId?: string;
  assignee?: Author; // denormalized
  dueDate?: Date;
  linkedTaskIds: string[];
  linkedNoteId?: NoteId; // Note への逆参照
  attachments?: FileAttachment[];
  position: number;
  deletedAt?: Date; // ソフトデリート。未削除は undefined
  createdAt: Date;
  updatedAt: Date;
}
```

### displayId 採番

クライアント側 Firestore トランザクションで `projects/{projectId}/counters/task` の `current` を atomic increment する。
プロジェクトスコープで `#1` から採番。

## Note Model

Firestore パス: `notes/{noteId}`

```typescript
export interface Note {
  id: NoteId;
  title: string;
  content: string; // Markdown 本文
  tags: string[]; // Project.tag との一致で Project 紐付け
  pinned: boolean;
  deletedAt?: Date; // ソフトデリート。未削除は undefined
  linkedTaskIds: string[];
  attachments?: FileAttachment[];
  ownerId: string;
  createdBy: Author; // denormalized
  createdAt: Date;
  updatedAt: Date;
}
```

### Note と Project の紐付け

- Project は `tag: string` を持つ
- Note は `tags: string[]` を持つ
- `ProjectNotesPage` は `project.tag` を含む Note 一覧を表示する
- 1つの Note が複数 Project に属してよい

### Note と Task の紐付け

- Note 側は `linkedTaskIds: string[]`
- Task 側は `linkedNoteId?: NoteId`
- 現時点ではデータ相互参照のみを定義し、UI の完成実装は後続フェーズで行う

## FileAttachment

```typescript
export interface FileAttachment {
  id: AttachmentId;
  name: string; // 元ファイル名
  type: AttachmentType; // 'image' | 'document'
  mimeType: string;
  size: number; // bytes
  url: string; // download URL
  uploadedBy: string;
  createdAt: Date;
}
```

### MIME 制約

```typescript
export const ALLOWED_MIME_TYPES = {
  image: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  document: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;

export const BLOCKED_MIME_PREFIXES = ['video/'] as const;
```

## TaskComment Model

```typescript
export interface TaskComment {
  id?: string;
  author: 'user' | 'claude' | 'codex';
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Date;
}
```

## Activity Model

クライアント側で書き込み、タスク / プロジェクト / ノート操作時に API 内で同時作成する。

```typescript
export type ActivityType =
  | 'task_create'
  | 'task_update'
  | 'task_delete'
  | 'task_restore'
  | 'project_create'
  | 'project_update'
  | 'note_create'
  | 'note_update'
  | 'note_delete'
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

Activity コレクションから日別に集計して表示する。別コレクションは不要。

---

## StorageService

`src/api/storage.ts` は型のみ。実装クラスはまだ作らない。

```typescript
export class StorageError extends Error {
  constructor(
    public code:
      | 'VIDEO_NOT_ALLOWED'
      | 'UNSUPPORTED_FILE_TYPE'
      | 'FILE_TOO_LARGE'
      | 'UPLOAD_FAILED',
    message?: string
  ) {
    super(message ?? code);
    this.name = 'StorageError';
  }
}

export interface StorageService {
  upload(file: File, path: string, userId: UserId): Promise<FileAttachment>;
  delete(attachmentId: AttachmentId, userId: UserId): Promise<void>;
  getUrl(attachmentId: AttachmentId): string;
}

export function validateFile(file: File): void {
  if (file.type.startsWith('video/')) {
    throw new StorageError(
      'VIDEO_NOT_ALLOWED',
      '動画ファイルはアップロードできません'
    );
  }

  const allowed = [
    ...ALLOWED_MIME_TYPES.image,
    ...ALLOWED_MIME_TYPES.document,
  ] as readonly string[];

  if (!allowed.includes(file.type)) {
    throw new StorageError(
      'UNSUPPORTED_FILE_TYPE',
      `${file.type} はサポートされていません`
    );
  }
}
```

テストファイル: `src/api/storage.test.ts`

- `image/png` は通る
- `application/pdf` は通る
- `video/mp4` は `VIDEO_NOT_ALLOWED`
- `application/x-unknown` は `UNSUPPORTED_FILE_TYPE`

---

## Firestore 境界ルール

- アプリ層では Firestore の `Timestamp` を渡さない
- converter / API 層で `Timestamp -> Date` に変換する
- Firestore の nullable 風データはアプリ層では `undefined` に変換する
- 未削除の `deletedAt` は Firestore でもフィールド不在に寄せる
- クエリ条件や converter の具体実装は Firestore 制約に応じて API 層で吸収する

---

## セキュリティルール方針

```javascript
match /notes/{noteId} {
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid;
  allow read, update, delete: if request.auth != null
    && request.auth.uid == resource.data.ownerId;
}
```

---

## 現フェーズで入れるもの

- ブランド型: `NoteId`, `AttachmentId`, `AttachmentType`
- `Note`, `FileAttachment`, `StorageService`, `StorageError`, `validateFile`
- `Project` の `tag`, `shortDescription`, `readme`
- `Task` の `deletedAt`, `linkedNoteId`, `attachments`
- `ActivityType` の note / delete / restore 系
- `notes/{noteId}` コレクション前提の型とルール

---

## 変更履歴

- 2026-03-29: `data-models.md` の変更案を統合し、`Note` / `FileAttachment` / `StorageService` / `Project.tag` / `Task.linkedNoteId` などを最終仕様へ反映。アプリ層は `Date` / `undefined` を使う方針を明記
- 2026-03-21: 初版
