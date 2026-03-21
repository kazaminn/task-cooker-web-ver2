# Firebase (Back-End)

last-updated: 2026-03-21

## Applications

- Firebase Authentication（Google Provider）
- Cloud Firestore

---

## Firestore Data Structure

トップレベルのコレクション構成。個人=1人チームとして Team モデルを MVP から導入。

```text
teams/{teamId}                   # 個人=1人チーム
projects/{projectId}
  ├─ tasks/{taskId}
  │   └─ comments/{commentId}
  ├─ activities/{activityId}     # クライアント側書き込み
  └─ counters/{counterName}      # displayId 採番用（プロジェクトスコープ）
counters/{counterName}           # グローバルカウンター（必要に応じて）
mixes/{mixId}                    # MVP外
  └─ comments/{commentId}
```

詳細なスキーマは `tck-web-spec.md` を参照。

---

## Denormalization Strategy

User 情報（`Author` オブジェクト: ID, name, photoURL）を Task, Mix, Comment に埋め込み。
Project にも Team メタデータを格納し、レンダリング時のルックアップを削減。

---

## Firestore Security Rules

memberIds ベースのアクセス制御。詳細は `security.md` を参照。

---

## Technical Implementation Strategy

### displayId 採番

クライアント側 Firestore トランザクションで `projects/{projectId}/counters/task` の `current` を atomic increment。プロジェクトスコープで #1 から採番。Cloud Functions は使わない。

### linkedTaskIds 整合性

Phase 3 後半で Cloud Functions (onDelete トリガー) を実装予定。
MVP 時点では孤児リンクは UI 上で「削除済みタスク」と表示。

### Activity ログ

- **コレクション**: `projects/{projectId}/activities`
- **書き込み**: クライアント側。タスク/プロジェクト操作時に api/ 内で Activity ドキュメントを同時作成
- **ActivityType**: task_create, task_update, project_create, project_update, team_create, user_signup, profile_update 等

### 貢献グラフ

Activity コレクションから日別に集計して表示。別コレクション不要。

### リアルタイム購読

`onSnapshot` を使用。TanStack Query と統合（`useFirestoreSubscription` ユーティリティ）。
個人利用の無料枠（50,000 reads/日）で十分。

### TanStack Query + onSnapshot 統合パターン

```typescript
// hooks/useFirestoreSubscription.ts
function useFirestoreSubscription<T>(
  queryKey: QueryKey,
  subscribeFn: (callback: (data: T[]) => void) => Unsubscribe
) {
  // onSnapshot で queryClient.setQueryData を更新
  // useEffect 内で subscribe/unsubscribe
}
```

- api/ が onSnapshot の subscribe 関数を返す
- hooks/ 内で useFirestoreSubscription を使って TanStack Query に統合
- loading/error は TanStack Query が管理

### Cloud Functions 方針

- **箱だけ Phase 0.5** で用意、実装は Phase 3 後半
- displayId はクライアント採番（Functions 不要）
- Functions が必要な場面:
  - linkedTaskIds 一貫性（onDelete trigger）— Phase 3+
  - Activity ログ自動化（将来的にクライアント→Functions 移行の可能性）

### Firebase projectId

`task-cooker-dev`（エミュレータ用）

### ダッシュボードの collection group query

「今日のタスク」は全 PJ 横断で取得するため collection group query が必要 → Firestore インデックス設定を追加。
