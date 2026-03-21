# Testing Strategy

last-updated: 2026-03-21

---

## ツール

**MVP**: Vitest + Testing Library（E2E は対象外）

- **Vitest** — ユニット/統合テスト ✅ MVP
- **React Testing Library** — コンポーネントテスト ✅ MVP
- **Storybook** — コンポーネントカタログ（MVP 後）
- **Chromatic** — ビジュアルリグレッション（MVP 後）
- **Playwright** — E2E テスト（MVP 後）

---

## テスト対象

| カテゴリ | 対象                             | テスト内容                                                     |
| -------- | -------------------------------- | -------------------------------------------------------------- |
| ロジック | hooks (useProjects, useTasks 等) | データ取得、フィルタ、ソート                                   |
| ロジック | Firestore converters             | 型変換、Timestamp ↔ Date                                       |
| ロジック | ユーティリティ関数               | 純粋関数の I/O                                                 |
| ストア   | Zustand stores                   | 状態遷移、アクション                                           |
| UI       | TaskCard, KanbanBoard            | レンダリング、インタラクション                                 |
| UI       | FilterBar, ViewToggle            | フィルタ操作、ビュー切替                                       |
| UI       | ダイアログ（作成/編集）          | フォーム送信、バリデーション                                   |
| api      | api/tasks.ts, api/projects.ts 等 | CRUD 操作、onSnapshot ラッパー（Firestore エミュレーター使用） |
| api      | api/auth.ts                      | 認証フロー、AuthGuard                                          |
| 統合     | useFirestoreSubscription         | TanStack Query + onSnapshot の統合動作                         |
| api      | displayId 採番トランザクション   | 競合時のリトライ、失敗時のロールバック                         |

---

## テスト方針

- **role ベースのクエリ**（getByRole）
- **userEvent.setup()** でインタラクション
- kz-shared-ui の Testing Library パターンに準拠
- **DnD テスト**: react-aria の DnD はキーボード操作（Space + Arrow）でテスト可能
- **ファイル配置**: ソースファイルと同階層にコロケーション（`*.test.ts(x)`）

---

## テストカバレッジ

80% を目標。テストはソースファイルと同階層に配置し、メンテナンスしやすくする。
