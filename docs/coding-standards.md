# コーディング規約

## 型安全性

- TypeScript strict モード必須（`strictNullChecks: true`）
- `as any` 禁止。型アサーションは `as` + 具体的な型のみ許可
- `null` 禁止。`undefined` に統一。Firestore 境界の converter でのみ `null ↔ undefined` 変換
- `string[]` 禁止。ブランド型がある場所では必ずブランド型を使え
  - `TaskId[]` ○ / `string[]` ×
  - `NoteId` ○ / `string` ×（型定義で `NoteId` が定義されている場合）

## ファイル構成

### 1コンポーネント最大3ファイル

```
TaskCard.tsx           ← 実装
TaskCard.test.tsx      ← テスト
TaskCard.stories.tsx   ← Storybook
```

以下のファイル分割は**禁止**:

- `*.types.ts`
- `*.utils.ts`
- `*.constants.ts`
- `*.hooks.ts`
- `index.ts`（re-export だけのファイル）

理由: 開発者は弱視。ファイル間ジャンプの認知コストが高い。

### ディレクトリ配置

- `src/features/{feature}/components/` — 機能固有コンポーネント
- `src/features/{feature}/hooks/` — 機能固有フック
- `src/features/{feature}/pages/` — ページコンポーネント
- `src/features/{feature}/api/` — Firestore 操作
- `src/ui/components/` — 共通 UI コンポーネント（react-aria ベース）

`src/components/` にファイルを置くな。存在しない。

### テストファイル配置

ソースと同階層にコロケーション:

```
src/features/tasks/hooks/useTasks.ts
src/features/tasks/hooks/useTasks.test.ts    ← 隣に置け
```

`__tests__/` ディレクトリ禁止。`tests/` トップレベルディレクトリ禁止（`e2e/` は例外）。

## UI ライブラリ

- **react-aria-components** を最優先で使え
  - Button, Select, DatePicker, Dialog, Tabs, Menu, SearchField, etc.
  - DnD は react-aria の useDnD / useDrag / useDrop を使え（HTML5 DnD API 禁止）
- **tailwind-variants**（`tv` 関数）でバリアント管理
- **shadcn/ui は使うな**。プロジェクトに入っていない

## CSS

- コンポーネントに色のハードコード禁止。`@theme` 登録済みトークンを使え:

  ```tsx
  // ✅ Tailwind v4: @theme で登録したトークン
  className="bg-surface-bg text-text-primary"

  // ❌ var() 直書き
  className="bg-[var(--surface-bg)]"

  // ❌ ハードコード
  className="bg-[#0d0d0e]"
  style={{ backgroundColor: '#0d0d0e' }}
  ```

- `@theme` 登録は `src/ui/index.css` で一元管理。skills/tavern-theme.md を参照
- インライン style は装飾用の疑似要素パターンでのみ許可（`aria-hidden` 付き）

## データフェッチ

- **TanStack Query** をすべてのデータフェッチに使え
- `useEffect` + `useState` で fetch するな
- onSnapshot は `useFirestoreSubscription` ユーティリティ経由
- 直接 `import { getFirestore } from 'firebase/firestore'` するのは `api/` 内のみ

## フォーム

- **React Hook Form** + **Zod** でバリデーション
- `onChange` + `useState` で独自フォーム管理するな

## コミット

- commitlint 設定を先に読め（`commitlint.config.js`）
- 3回試行錯誤するな。設定を1回読めば1発で通る
- フォーマット例: `✨ feat: add tavern-dark theme variables`

## a11y

- WCAG 2.2 AA 準拠
- `role` / `aria-label` / `aria-describedby` 必須
- `focus-visible` でフォーカスリング
- キーボード完結（Tab / Enter / Escape / Arrow）
- 色だけに頼らない（ステータスは色 + テキストラベル）
- `prefers-reduced-motion` 対応
- 装飾要素には `aria-hidden="true"` を付けろ
