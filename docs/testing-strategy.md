# TaskCooker Web — テスト戦略 v2

last-updated: 2026-03-23
status: Codexレビュー反映済み

## 変更履歴

- v1 (03/23): Code が叩き台作成
- v2 (03/23): Codex (gpt-5.4) レビュー反映。service/api矛盾解消、カバレッジ目標修正、モック戦略緩和、テスト対象の線引き明確化

---

## 1. 目的

テストで守るものを明確にし、Codex/Code が迷わずテストを書ける基準を提供する。
「カバレッジ数値を上げる」ではなく「壊れたら困るものを守る」が目的。

---

## 2. 現状

`pnpm test` で最新の件数を確認すること。以下は 2026-03-23 時点の参考値。

| 指標           | 値                       |
| -------------- | ------------------------ |
| テストファイル | 19+                      |
| テスト数       | 78+                      |
| カバレッジ     | 66.80%（計測環境未整備） |

### 既存パターン

- Hoisted mocks (`vi.hoisted()`) で Firebase SDK をモック
- `createWrapper()` で QueryClientProvider を提供
- `userEvent.setup()` でユーザー操作をシミュレート
- callback capture パターンで subscription をテスト
- `MemoryRouter` で実ルーター使用（AuthGuard等）
- 子コンポーネントを薄いスタブに差し替え（TaskFilters, TaskDetailPage等）

---

## 3. テスト対象の判断基準

### テストする

| 対象                                 | 理由                                         | 例                                                 |
| ------------------------------------ | -------------------------------------------- | -------------------------------------------------- |
| ビジネスロジック                     | 壊れたらユーザーに直撃                       | ステータス遷移、XP計算、displayId採番              |
| データ変換                           | 型の境界で壊れやすい                         | Firestore converter、Zod スキーマ                  |
| ユーザー操作の結果                   | 操作→状態変化の契約                          | フォーム送信、DnDドロップ、フィルター適用          |
| api層（api/\*.ts）                   | DB差し替え時の回帰防止。ビジネスロジックの核 | CRUD操作、エラーハンドリング                       |
| 条件分岐のあるhooks                  | 副作用の組み合わせ                           | useTasks のフィルタリング、useDashboardData の集計 |
| データバインディングと条件分岐の表示 | ユーザーとの契約                             | displayId表示、ステータスラベル、空状態メッセージ  |

### テストしない

| 対象                                               | 理由                                   |
| -------------------------------------------------- | -------------------------------------- |
| React Aria / React Hook Form / date-fns の既定挙動 | ライブラリが保証している               |
| Firestore SDK の内部動作                           | Firebase が保証している                |
| 見た目のスタイリング（色、角丸、フォントサイズ等） | Storybook + Chromatic で視覚回帰を守る |
| re-export のみのファイル（service層、barrel）      | ロジックがない。カバレッジ対象外にする |
| router/provider の配線だけを確認するテスト         | 組み立てに価値はない                   |

### 判断に迷ったら

> 「このコードが壊れたとき、ユーザーはどう困るか？」
> 答えが明確 → テストを書く。答えが「特に困らない」 → 書かない。

---

## 4. 傾斜つきカバレッジ目標

全体一律ではなく、レイヤーごとにリスクに応じた目標を設定する。
service層（re-export のみ）はカバレッジ対象外。

| レイヤー             | 目標   | 根拠                                             |
| -------------------- | ------ | ------------------------------------------------ |
| api層 (api/\*.ts)    | 80-85% | ビジネスロジックの核。DB差し替え時の回帰防止     |
| hooks                | 75-80% | 副作用と状態管理のロジック集約地点               |
| components           | 60-70% | データバインディングと条件分岐のみ               |
| pages                | 50-60% | orchestration の確認。個別ロジックは下位層で守る |
| libs / types         | 90%    | 純粋関数・スキーマ。テストしやすく壊れやすい     |
| stores               | 80%    | UIステート管理。条件分岐がある部分               |
| services (re-export) | 対象外 | ロジックなし                                     |

### 計測方法

```bash
pnpm test -- --coverage
```

vitest.config.ts に coverage 設定を追加（Phase 5B で実施）:

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/**/*.test.{ts,tsx}',
    'src/main.tsx',
    'src/vite-env.d.ts',
    'src/services/**',  // re-export のみ
  ],
}
```

---

## 5. テスト命名規則

テスト名を読めば「何を守りたいか」がわかること。

### フォーマット

```
[主語] [条件があれば] [期待する振る舞い]
```

`describe` で主語を持たせ、`it` で振る舞いを書くパターンも可。

```ts
describe('uiStore', () => {
  it('sets theme');
  it('toggles reduced motion');
});
```

### 良い例

```ts
it('filters tasks by status when status filter is set');
it('increments displayId via transaction when creating task');
it('maps Firebase permission-denied to Japanese error message');
it('unsubscribes previous listener when query key changes');
```

### 悪い例

```ts
it('works correctly'); // 何が correct かわからない
it('test createTask'); // 何を守りたいかわからない
it('should render component'); // 当たり前すぎて価値がない
```

---

## 6. モック戦略

### 原則: 境界の一段外をモックする

テスト対象の直接の依存をモックし、それより内側は実物を使う。

### レイヤー別の推奨デフォルト

| レイヤー   | Firebase SDK | Router           | TanStack Query      | Zustand        | 子コンポーネント |
| ---------- | ------------ | ---------------- | ------------------- | -------------- | ---------------- |
| api層      | モック       | —                | —                   | —              | —                |
| hooks      | モック       | モック           | 実物(createWrapper) | 実物(setState) | —                |
| components | モック       | テスト目的による | 実物                | 実物           | スタブ可         |
| pages      | モック       | 実Router推奨     | 実物                | 実物           | スタブ可         |

**Router について:**

- 振る舞いテスト（ナビゲーション先の確認等）→ `MemoryRouter` で実Router
- 単にuseParamsの値が必要なだけ → `vi.mock('react-router')` でモック

**子コンポーネントのスタブ化:**

- テスト対象のロジックに集中したい場合、重い子コンポーネントはスタブに差し替えてよい

### Hoisted Mock パターン（api層モック時の推奨）

```ts
const mocks = vi.hoisted(() => ({
  subscribeTasks: vi.fn(),
  createTask: vi.fn(),
}));

vi.mock('@/api/tasks', () => mocks);
```

### Subscription テストパターン

```ts
let callback: (data: Task[]) => void;
mocks.subscribeTasks.mockImplementation(
  (_id: string, cb: (data: Task[]) => void) => {
    callback = cb;
    return vi.fn(); // unsubscribe
  }
);

// テスト内で callback を呼んでデータを流す
act(() => callback(mockTasks));
```

---

## 7. 優先度付きテスト計画

### P0: 最優先（Phase 5B で実施）

壊れたらアプリが使えなくなるもの。

| 対象                   | テスト内容                                                   | 現状                       |
| ---------------------- | ------------------------------------------------------------ | -------------------------- |
| api/tasks.ts           | create(採番含む), update, delete, subscribe                  | 4件あり。補強              |
| api/projects.ts        | create, update, delete, subscribe                            | **なし**                   |
| KanbanBoard            | DnD でのステータス遷移、列の並び替え                         | **なし**                   |
| CreateTaskDialog       | バリデーション、送信、成功時リセット/close、失敗時エラー表示 | **なし**                   |
| ステータス遷移ロジック | order→prep→cook→serve の遷移                                 | updateTask テストに1件あり |

> displayId採番はapi/tasks.tsで守る。CreateTaskDialogの責務ではない。

### P1: ユーザー体験（Phase 5B〜5C）

壊れたらUXが劣化するもの。

| 対象              | テスト内容                              | 現状                                     |
| ----------------- | --------------------------------------- | ---------------------------------------- |
| FilterBar         | store更新（既存）+ タスク絞り込みの連携 | TaskFilters.test.tsx にstore更新まであり |
| CommentThread     | コメント追加・表示順                    | **なし**                                 |
| ProjectTasksPage  | リスト ↔ カンバン切替                   | **なし**                                 |
| api/activities.ts | アクティビティ作成・購読                | 2件あり。補強                            |

### P2: 回帰防止（Phase 5C〜5D）

過去にバグがあった箇所、設定系。

| 対象                           | テスト内容                   | 現状                |
| ------------------------------ | ---------------------------- | ------------------- |
| TeamListPage + TeamMembersPage | チーム一覧・メンバー操作     | **なし**            |
| ProjectSettingsPage            | 削除確認ダイアログ           | **なし**            |
| AppSettingsPage                | テーマ切替・プロフィール更新 | **なし**            |
| useFirestoreSubscription       | エラーハンドリング           | 7件あり（最も充実） |

---

## 8. テストしないことの明示

以下は意図的にテストしない。将来追加する場合はこのセクションを更新すること。

| 対象                         | 理由                                     | 代替手段                          |
| ---------------------------- | ---------------------------------------- | --------------------------------- |
| Firestore セキュリティルール | 別設定ファイルで分離テスト済み           | `test/firestore.rules.test.ts`    |
| ビジュアルリグレッション     | Vitest では守れない                      | Storybook + Chromatic（Phase 6）  |
| E2E フロー                   | ユニットテストの範囲外                   | Playwright（Phase 8）             |
| パフォーマンス               | 計測環境が別                             | Lighthouse, Web Vitals（Phase 8） |
| オプティミスティック更新     | 設計判断が保留中                         | 判断確定後にテスト追加            |
| re-export / barrel ファイル  | ロジックがない                           | カバレッジ対象外                  |
| ライブラリ既定挙動そのもの   | React Aria, React Hook Form, date-fns 等 | ライブラリ側で保証                |

---

## 9. テストツール導入ロードマップ

| Phase | ツール                   | 目的                                            |
| ----- | ------------------------ | ----------------------------------------------- |
| 5B    | `vitest --coverage` (v8) | カバレッジ計測                                  |
| 5B    | `vite-plugin-visualizer` | バンドルサイズ計測                              |
| 6     | Storybook                | コンポーネントカタログ + ビジュアルベースライン |
| 6     | Chromatic                | ビジュアルリグレッション検出                    |
| 8     | Playwright               | E2E テスト（ログイン済み前提）                  |

---

## 10. Codex / Code 向けガイドライン

### テストを書くとき

1. **テスト戦略を先に読め**（このドキュメント）
2. **既存テストのパターンを確認しろ**（同レイヤーの既存テストに合わせる）
3. **テスト名で「何を守るか」を表現しろ**
4. **1テスト1アサーション寄り**（複数アサーションは関連するものに限定）
5. **引き継ぎファイルにテスト追加を記録しろ**（コミットに含める）

### テストを書かないとき

1. re-export のみの service / barrel ファイルにはテスト不要
2. 見た目のスタイリングはテストしない（データバインディングと条件分岐は守る）
3. ライブラリの既定挙動をテストするな（React Aria, Firebase SDK, date-fns）
4. router/provider の配線だけを確認するテストは書くな

### レビュー時のチェックポイント

- [ ] テスト名が「何を守るか」を表現しているか
- [ ] モック戦略がレイヤー別推奨に従っているか
- [ ] テスト対象が「テストする」基準に合致しているか
- [ ] 不要なテスト（テストしないものリスト該当）が含まれていないか
- [ ] re-exportのテスト、ライブラリ挙動のテストが混入していないか
