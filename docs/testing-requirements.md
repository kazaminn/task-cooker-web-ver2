# TaskCooker Web — テスト戦略 (Phase 5+7)

last-updated: 2026-03-29
status: draft（ユーザー承認待ち）
based-on: docs/task-cooker-web/testing.md (2026-03-21)

---

## 鉄則（おっぴへの直接命令）

1. **テスト0件で「完了しました」と報告するな**（やらかし C-01）
2. **CI が通っただけでは完了ではない。テスト件数も報告しろ**
3. **機能を1つ実装したら、そのテストも同じ PR に含めろ。後回し禁止**
4. **テストファイルはソースと同階層にコロケーション配置**（`*.test.ts(x)`）
5. **`__tests__/` ディレクトリを作るな。ソースの隣に置け**
6. **テストを書かずに次の機能に進むな**
7. **完了報告のフォーマット**: 「テスト N 件追加、全 M 件パス、カバレッジ X%」

---

## ファイル配置（コロケーション）

```
src/features/tasks/
├── components/
│   ├── TaskCard.tsx
│   ├── TaskCard.test.tsx          ← ここ
│   ├── TaskCard.stories.tsx       ← ここ
│   ├── KanbanBoard.tsx
│   ├── KanbanBoard.test.tsx       ← ここ
│   └── KanbanBoard.stories.tsx    ← ここ
├── hooks/
│   ├── useTasks.ts
│   └── useTasks.test.ts           ← ここ
├── pages/
│   ├── ProjectTasksPage.tsx
│   └── ProjectTasksPage.test.tsx  ← ここ
└── api/
    ├── tasks.ts
    └── tasks.test.ts              ← ここ
```

**禁止:**

- `src/__tests__/` ディレクトリ
- `tests/` トップレベルディレクトリ（Playwright の `e2e/` は例外）
- テストファイルをソースと別の場所に置くこと

**1コンポーネント最大3ファイル:**

- `ComponentName.tsx`（実装）
- `ComponentName.test.tsx`（テスト）
- `ComponentName.stories.tsx`（Storybook）

types.ts、utils.ts、constants.ts への分割は禁止（やらかし C-02）。

---

## ツール構成

| ツール                         | 用途                                          | Phase 5+7 で導入 |
| ------------------------------ | --------------------------------------------- | :--------------: |
| Vitest                         | ユニット/統合テスト                           |     ✅ 既存      |
| React Testing Library          | コンポーネントテスト                          |     ✅ 既存      |
| Vitest Coverage (`--coverage`) | カバレッジ計測                                |   ✅ 新規導入    |
| Playwright                     | E2E テスト                                    |   ✅ 新規導入    |
| Storybook 8                    | コンポーネントカタログ                        |   ✅ 新規導入    |
| @storybook/addon-a11y          | アクセシビリティ自動チェック（axe-core 内蔵） |   ✅ 新規導入    |
| Chromatic                      | ビジュアルリグレッション                      |   ✅ 新規導入    |

---

## カバレッジ目標

**全体: 80%**

| レイヤー       | 目標 | 理由                                                     |
| -------------- | :--: | -------------------------------------------------------- |
| api/           | 90%  | ビジネスロジックの核。Firestore 操作の正確性が全体に影響 |
| hooks/         | 85%  | データフロー・状態遷移の信頼性                           |
| types/ + libs/ | 90%  | 純粋関数。テストしやすい。バグが下流全体に波及           |
| store/         | 85%  | UI 状態遷移。Zustand アクションの正確性                  |
| components/    | 70%  | レンダリング + インタラクション。100% は不要             |
| pages/         | 60%  | 統合テスト寄り。主要フローのみ                           |

**vitest.config.ts に追加:**

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      exclude: [
        '**/*.stories.tsx',
        '**/*.test.tsx',
        '**/types/**',
        'src/main.tsx',
      ],
    },
  },
});
```

**計測コマンド:**

```bash
pnpm vitest --coverage --reporter=verbose
```

**CI に追加するチェック:**

```yaml
# GitHub Actions
- name: Test with coverage
  run: |
    pnpm vitest --coverage --reporter=verbose
    # カバレッジが 80% 未満なら失敗
    # テスト件数が 0 なら失敗（C-01 対策）
```

---

## テスト方針

### クエリ

```typescript
// ✅ 正しい: role ベース
screen.getByRole('button', { name: '新しい注文' });
screen.getByRole('heading', { name: 'プロジェクト一覧' });
screen.getByRole('tab', { name: 'Tasks' });

// ❌ 禁止: テスト ID
screen.getByTestId('submit-button');

// ❌ 禁止: クラス名
document.querySelector('.btn-primary');
```

### インタラクション

```typescript
// ✅ 正しい: userEvent.setup()
const user = userEvent.setup();
await user.click(screen.getByRole('button', { name: '新しい注文' }));
await user.type(screen.getByRole('textbox', { name: 'タイトル' }), 'バグ修正');

// ❌ 禁止: fireEvent 直接呼び出し
fireEvent.click(button);
```

### DnD テスト

```typescript
// react-aria の DnD はキーボード操作でテスト
await user.tab(); // フォーカス移動
await user.keyboard('{Space}'); // ドラッグ開始
await user.keyboard('{ArrowRight}'); // 列移動
await user.keyboard('{Space}'); // ドロップ
```

### Firestore モック

```typescript
// api/ のテストでは Firestore エミュレーターを使用
// hooks/ のテストでは api/ をモック

// ✅ 正しい: api 層をモック
vi.mock('@/features/tasks/api/tasks', () => ({
  subscribeTasks: vi.fn(),
  createTask: vi.fn(),
}));

// ❌ 禁止: Firebase SDK を直接モック
vi.mock('firebase/firestore'); // ← これは api/ のテストでのみ許可
```

---

## 必須テスト一覧

### P0: 絶対に書け（各項目に最低テスト数を明記）

| 対象ファイル                                     | テスト内容                                                                 | 最低テスト数 |
| ------------------------------------------------ | -------------------------------------------------------------------------- | :----------: |
| `api/projects.ts`                                | CRUD（作成・取得・更新・削除）+ onSnapshot                                 |      5       |
| `api/comments.ts`                                | CRUD                                                                       |      4       |
| `api/notes.ts`                                   | 型定義のみ（v1）。converter テスト                                         |      2       |
| `features/tasks/components/CreateTaskDialog.tsx` | バリデーション（空タイトル拒否、Zod エラー表示）、displayId 採番、送信成功 |      4       |
| `features/tasks/components/KanbanBoard.tsx`      | 4列レンダリング、DnD でステータス遷移、空列の表示                          |      4       |
| `features/tasks/components/FilterBar.tsx`        | フィルター状態 ↔ uiStore 連携、初期値、リセット                            |      3       |
| `store/themeStore.ts`                            | tavern-dark ↔ tavern-light 切替、data-theme 属性反映、localStorage 永続化  |      3       |
| `api/storage.ts`                                 | validateFile: 画像OK、ドキュメントOK、動画拒否、不明MIME拒否               |      4       |

### P1: 次に書け

| 対象ファイル                                           | テスト内容                                                  | 最低テスト数 |
| ------------------------------------------------------ | ----------------------------------------------------------- | :----------: |
| `features/projects/components/CreateProjectDialog.tsx` | teamId 選択、tag 入力、Zod バリデーション                   |      3       |
| `features/tasks/components/CommentThread.tsx`          | コメント追加（textarea → Ctrl+Enter）、表示順、空状態       |      3       |
| `features/projects/pages/ProjectTasksPage.tsx`         | リスト ↔ カンバン切替、フィルタ適用                         |      3       |
| `features/auth/pages/LoginPage.tsx`                    | OAuth ボタン表示、エラー表示（モック）                      |      2       |
| `features/auth/pages/SignupPage.tsx`                   | Personal Team 自動作成（モック）                            |      2       |
| `features/tasks/components/TaskCard.tsx`               | compact/通常バリアント、ステータス色表示、priority アイコン |      3       |
| `features/dashboard/pages/DashboardPage.tsx`           | セクション4つのレンダリング、空状態                         |      2       |

### P2: 回帰防止

| 対象ファイル                                      | テスト内容                      | 最低テスト数 |
| ------------------------------------------------- | ------------------------------- | :----------: |
| `features/teams/pages/TeamListPage.tsx`           | チーム一覧、作成ダイアログ      |      2       |
| `features/teams/pages/TeamMembersPage.tsx`        | メンバー追加、除外、owner 保護  |      3       |
| `features/projects/pages/ProjectSettingsPage.tsx` | 削除確認ダイアログ              |      2       |
| `features/settings/pages/AppSettingsPage.tsx`     | テーマ切替（tavern-dark/light） |      2       |

---

## Playwright E2E テスト

### ディレクトリ

```
e2e/
├── auth.spec.ts
├── task-flow.spec.ts
├── theme.spec.ts
├── a11y.spec.ts
└── fixtures/
    └── auth.ts          // 認証ヘルパー
```

### 必須シナリオ

| ファイル            | シナリオ                            | 検証内容                                                  |
| ------------------- | ----------------------------------- | --------------------------------------------------------- |
| `auth.spec.ts`      | ログイン → ダッシュボード表示       | Firebase Auth Emulator でテストユーザー作成、リダイレクト |
| `task-flow.spec.ts` | タスク作成 → ステータス変更 → serve | displayId 採番、ステータス遷移、トースト                  |
| `theme.spec.ts`     | tavern-dark ↔ tavern-light 切替     | `data-theme` 属性、CSS 変数の値                           |
| `a11y.spec.ts`      | 全ページの a11y チェック            | キーボード操作、フォーカス遷移、aria 属性                 |

### テーマテストの具体例

```typescript
// e2e/theme.spec.ts
import { test, expect } from '@playwright/test';

test('tavern-dark テーマが正しく適用される', async ({ page }) => {
  await page.goto('/home');

  // data-theme 属性を確認
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'tavern-dark');

  // CSS 変数の値を確認（目で見るな。数値で確認しろ）
  const bgColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue('--surface-bg')
      .trim()
  );
  expect(bgColor).toBe('#3a2a1a');
});

test('テーマ切替が機能する', async ({ page }) => {
  await page.goto('/settings');

  // Light ボタンをクリック
  await page.getByRole('button', { name: /light/i }).click();

  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'tavern-light');

  // 背景色が変わったことを数値で確認
  const bgColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue('--surface-bg')
      .trim()
  );
  expect(bgColor).toBe('#f7f6f3');
});
```

---

## Storybook

### 配置

```
src/features/tasks/components/TaskCard.stories.tsx
src/features/tasks/components/KanbanBoard.stories.tsx
src/ui/components/Button.stories.tsx
...
```

### 必須 Story

酒場テーマの全コンポーネントに以下のバリエーションを Story として登録:

| バリエーション | 理由                           |
| -------------- | ------------------------------ |
| tavern-dark    | ダークテーマの見た目           |
| tavern-light   | ライトテーマの見た目           |
| 空状態         | 空状態の酒場コピーが正しいか   |
| エラー状態     | エラー時の酒場コピーが正しいか |
| ローディング   | スケルトン表示                 |

### addon-a11y

```typescript
// .storybook/preview.ts
import { withA11y } from '@storybook/addon-a11y';

export const decorators = [withA11y];

// 各 Story で a11y パネルが自動的に表示される
// コントラスト比 AA 未達は警告として表示される
```

---

## Chromatic

### 導入

```bash
pnpm add -D chromatic
```

### CI 連携

```yaml
# GitHub Actions
- name: Chromatic
  uses: chromaui/action@v1
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    buildScriptName: build-storybook
```

### ルール

- **PR ごとにビジュアル差分を自動検出**
- 「目で見て OK」は禁止。Chromatic の承認フローで管理
- テーマ切替時は全 Story の差分が出る → まとめて承認

---

## CI パイプライン（GitHub Actions）

```yaml
name: CI
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Unit/Integration Test
        run: |
          pnpm vitest --coverage --reporter=verbose 2>&1 | tee test-output.txt
          # テスト件数チェック（0件なら失敗）
          TEST_COUNT=$(grep -c "✓\|✗" test-output.txt || echo 0)
          if [ "$TEST_COUNT" -eq 0 ]; then
            echo "::error::テストが0件です。テストを書いてください。"
            exit 1
          fi
          echo "テスト件数: $TEST_COUNT"

      - name: E2E Test
        run: pnpm playwright test

      - name: Storybook Build
        run: pnpm build-storybook

      - name: Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

### PR 必須チェック（全部通らないと merge 不可）

1. `pnpm typecheck` — 型エラー0件
2. `pnpm lint` — ESLint エラー0件
3. `pnpm vitest` — 全件パス **かつ** テスト件数1件以上
4. `pnpm playwright test` — E2E 全件パス
5. Chromatic — ビジュアル差分の承認

---

## 禁止事項（おっぴ用）

1. テスト0件で CI 通過を「成功」と報告するな（C-01）
2. `__tests__/` ディレクトリを作るな。コロケーション配置しろ
3. テストファイルを types.ts / utils.ts / constants.ts に分割するな（C-02）
4. 自分のコードを自分でレビューするな。それはコスプレレビューだ（C-03）
5. grep で整合性確認したと言うな。全文読め（C-04）
6. テストを「後で書きます」と言うな。同じ PR に含めろ
7. `fireEvent` を直接使うな。`userEvent.setup()` を使え
8. `getByTestId` を使うな。`getByRole` を使え
9. 「スクショで確認しました」はレビューとして認めない。数値かテスト結果で報告しろ
10. Storybook の Story を書かずにコンポーネントを完了にするな
