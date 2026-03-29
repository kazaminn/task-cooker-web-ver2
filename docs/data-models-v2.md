# TaskCooker Web — データモデル変更仕様 (Phase 5+7)

last-updated: 2026-03-29
status: draft（ユーザー承認待ち）
based-on: docs/task-cooker-web/data-models.md (2026-03-21)

---

## 変更方針

- **既存の型定義（CLI domain が正）は一切変えない**
- ステータス4値（order/prep/cook/serve）不変
- 優先度4値（urgent/high/medium/low）不変
- ステータスカラー不変
- `null` 禁止。`undefined`（フィールド不在）に統一。Firestore 境界でのみ変換
- ブランド型を使う。ただし **`Note.tags` は `string[]` で OK**（ユーザー自由入力のため）

---

## ブランド型の追加

```typescript
// types/types.d.ts に追加
type NoteId = string & { readonly __brand: 'NoteId' };
type AttachmentId = string & { readonly __brand: 'AttachmentId' };
type AttachmentType = 'image' | 'document';
```

---

## 新規モデル

### Note（トップレベルコレクション）

Firestore パス: `notes/{noteId}`

```typescript
// types/types.d.ts に追加
export interface Note {
  id: NoteId;
  title: string;
  content: string; // Markdown 本文
  tags: string[]; // string[] で OK。Project.tag との一致で PJ 紐付け
  pinned: boolean;
  deletedAt?: Timestamp; // ソフトデリート。undefined = 未削除
  linkedTaskIds: TaskId[]; // Task への相互参照（複数可）
  attachments?: FileAttachment[]; // 画像 + ドキュメント
  ownerId: UserId; // ACL 用（行単位アクセスコントロール）
  createdBy: Author; // Denormalized
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Firestore セキュリティルール:

```javascript
// firestore.rules に追加
match /notes/{noteId} {
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid;
  allow read, update, delete: if request.auth != null
    && request.auth.uid == resource.data.ownerId;
}
```

Note ↔ Project 紐付け:

```
Project A (tag: "frontend")
  ↕ note.tags に "frontend" を含む Note が表示
Note X (tags: ["frontend", "a11y"])
  ↕ 複数 PJ に属せる
Project B (tag: "a11y")
```

Note ↔ Task 相互参照:

```
Note X (linkedTaskIds: [taskId1, taskId2])
  ↕ 双方向リンク
Task 1 (linkedNoteId: noteXId)
```

### FileAttachment（埋め込みオブジェクト）

```typescript
// types/types.d.ts に追加
export interface FileAttachment {
  id: AttachmentId;
  name: string; // 元ファイル名
  type: AttachmentType; // 'image' | 'document'
  mimeType: string;
  size: number; // bytes
  url: string; // ダウンロード URL
  uploadedBy: UserId;
  createdAt: Timestamp;
}
```

```typescript
// types/constants.ts に追加
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

### StorageService インターフェース（型のみ）

```typescript
// src/api/storage.ts
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

```typescript
// 最低4テスト:
// 1. validateFile: image/png → エラーなし
// 2. validateFile: application/pdf → エラーなし
// 3. validateFile: video/mp4 → StorageError('VIDEO_NOT_ALLOWED')
// 4. validateFile: application/x-unknown → StorageError('UNSUPPORTED_FILE_TYPE')
```

**おっぴへの禁止事項: StorageService の実装クラスを書くな。interface と validateFile だけ。**

---

## 既存モデルの変更

### Project — フィールド追加

```typescript
export interface Project {
  // ... 既存フィールドはすべて維持（overview 含む）...

  // 追加フィールド
  shortDescription?: string; // 1行の短い概要。input で入力
  tag: string; // Note 紐付け用タグ名
  readme?: string; // 詳細説明（複数行 Markdown。textarea で入力）
}
```

> **注意**: 既存の `overview` フィールドは**そのまま残す**。`shortDescription` は新規追加。
> overview と shortDescription の使い分け:
>
> - `overview`: プロジェクト概要ページに表示する長めのテキスト（既存）
> - `shortDescription`: プロジェクト一覧カード等に表示する1行概要（新規）
> - `readme`: プロジェクト概要ページ下部に表示する Markdown ドキュメント（新規）

Converter 更新:

```typescript
// features/projects/api/projects.ts の converter に追加
fromFirestore(snapshot: QueryDocumentSnapshot): Project {
  const data = snapshot.data()
  return {
    ...data,
    id: snapshot.id,
    shortDescription: data.shortDescription ?? undefined,
    tag: data.tag ?? '',
    readme: data.readme ?? undefined,
    // 既存フィールドはそのまま
  } as Project
}
```

### Task — フィールド追加

```typescript
export interface Task {
  // ... 既存フィールドはすべて維持 ...

  // 追加フィールド
  deletedAt?: Timestamp; // ソフトデリート。undefined = 未削除
  linkedNoteId?: NoteId; // Note への逆参照
  attachments?: FileAttachment[]; // 画像 + ドキュメント添付
}
```

Converter 更新:

```typescript
// features/tasks/api/tasks.ts の converter に追加
fromFirestore(snapshot: QueryDocumentSnapshot): Task {
  const data = snapshot.data()
  return {
    ...data,
    id: snapshot.id as TaskId,
    deletedAt: data.deletedAt ?? undefined,  // null → undefined
    linkedNoteId: data.linkedNoteId ?? undefined,
    attachments: data.attachments ?? undefined,
    // 既存フィールドはそのまま
  } as Task
}
```

ソフトデリートのクエリ:

```typescript
// 通常のタスク取得（削除済みを除外）
const q = query(
  collection(db, `projects/${projectId}/tasks`),
  where('deletedAt', '==', null),  // Firestore では null チェック
  orderBy('position')
)

// ゴミ箱のタスク取得
const q = query(
  collection(db, `projects/${projectId}/tasks`),
  where('deletedAt', '!=', null),
  orderBy('deletedAt', 'desc')
)
```

---

## ActivityType の拡張

```typescript
// types/types.d.ts の ActivityType に追加
export type ActivityType =
  | 'task_create'
  | 'task_update'
  | 'task_delete' // 追加: ソフトデリート時
  | 'task_restore' // 追加: 復元時
  | 'project_create'
  | 'project_update'
  | 'note_create' // 追加
  | 'note_update' // 追加
  | 'note_delete' // 追加
  | 'team_create'
  | 'user_signup'
  | 'profile_update';
```

---

## Firestore コレクション構造（変更後）

```text
teams/{teamId}                        # 既存。変更なし
projects/{projectId}                  # 既存 + tag, shortDescription, readme 追加
  ├─ tasks/{taskId}                   # 既存 + deletedAt, linkedNoteId, attachments 追加
  │   └─ comments/{commentId}         # 既存。変更なし
  ├─ activities/{activityId}          # 既存。変更なし
  └─ counters/{counterName}           # 既存。変更なし
notes/{noteId}                        # 新規。トップレベル
```

---

## ルーティング変更

```typescript
// src/router.tsx に追加

// 新規ルート
{ path: '/notes', element: <NoteListPage /> }
{ path: '/notes/:noteId', element: <NoteDetailPage /> }

// ProjectLayout の子ルート変更（mixes → notes）
{ path: 'notes', element: <ProjectNotesPage /> }
// mixes ルートは削除

// TopNav グローバルナビ
// Dashboard | Projects | Notes

// ProjectTabs
// Overview | Tasks | Notes | Settings
```

v1 では NoteListPage, NoteDetailPage, ProjectNotesPage は空ページ:

```typescript
// src/features/notes/pages/NoteListPage.tsx
export function NoteListPage() {
  return (
    <div>
      <h1>ノート一覧</h1>
      <p>{getCopy('emptyNotes')}</p>
    </div>
  )
}
```

---

## v1 / v2 の境界

### v1（Phase 5+7）

| 対象                  | ファイル                       | 内容                                             |
| --------------------- | ------------------------------ | ------------------------------------------------ |
| ブランド型            | `types/types.d.ts`             | `NoteId`, `AttachmentId`, `AttachmentType`       |
| Note 型               | `types/types.d.ts`             | interface 定義                                   |
| FileAttachment 型     | `types/types.d.ts`             | interface 定義                                   |
| ALLOWED_MIME_TYPES    | `types/constants.ts`           | 定数定義                                         |
| StorageService        | `src/api/storage.ts`           | interface + validateFile + StorageError          |
| StorageService テスト | `src/api/storage.test.ts`      | validateFile の 4 テスト                         |
| Project 変更          | `types/types.d.ts` + converter | `+ tag`, `+ shortDescription`, `+ readme`        |
| Task 変更             | `types/types.d.ts` + converter | `+ deletedAt`, `+ linkedNoteId`, `+ attachments` |
| ActivityType          | `types/types.d.ts`             | 3 種追加                                         |
| ルーティング          | `router.tsx`                   | `/notes`, `/notes/:noteId` 追加。空ページ        |
| Firestore ルール      | `firestore.rules`              | `notes` コレクション追加                         |

### v2（Phase 9）

| 対象                    | 内容                             |
| ----------------------- | -------------------------------- |
| Note CRUD               | api + hooks + UI                 |
| Markdown エディタ       | NoteDetailPage                   |
| Note ↔ Task 相互参照 UI | リンク表示、作成、ナビゲーション |
| ProjectNotesPage        | タグベースフィルタ表示           |
| StorageService 実装     | ストレージサービス決定後         |
| 検索置換・一括操作      | エディタ + リスト                |
