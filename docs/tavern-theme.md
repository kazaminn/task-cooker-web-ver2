# テーマ設計（tavern-light / tavern-dark）

## 世界観

「かざみんの酒場」— 昼は喫茶店（スタバ風）、夜はビアバー（HUB風）。
ユーザーは店主兼料理人。タスクは客からの注文。
詳細: docs/task-cooker-web/kazaminbar.md

**鉄則**: 型定義・ステータス名・遷移ロジックは一切変えない。テーマはCSSレイヤーのみ。

## テーマ構成

| data-theme     | コンセプト           | 説明                                                              |
| -------------- | -------------------- | ----------------------------------------------------------------- |
| `tavern-light` | 昼の喫茶店（スタバ） | 既存 generic light ベース。将来、喫茶店風カラースキームに変更予定 |
| `tavern-dark`  | 夜のビアバー（HUB）  | 酒場ダーク。チャッピー palette ベース                             |

将来の拡張: `terminal`（だるいユーザー用。黒い画面）

コマンドモードは廃止（terminal として将来復活の可能性あり）。

## 実装手順: prefers-color-scheme → data-theme 移行

### Step 1: index.css に data-theme ベースの変数を定義

既存の `@media (prefers-color-scheme)` ブロックを `[data-theme]` セレクタに書き換える。

```css
/* src/ui/index.css */

/* ── Step 1: @theme でカスタムプロパティを Tailwind に登録 ── */
@theme {
  --color-surface-bg: var(--surface-bg);
  --color-surface-board: var(--surface-board);
  --color-surface-card: var(--surface-card);
  --color-surface-card-light: var(--surface-card-light);
  --color-surface-card-edge: var(--surface-card-edge);
  --color-surface-header: var(--surface-header);
  --color-surface-header-dark: var(--surface-header-dark);
  --color-surface-header-light: var(--surface-header-light);
  --color-surface-sidebar: var(--surface-sidebar);
  --color-surface-iron: var(--surface-iron);
  --color-surface-iron-dark: var(--surface-iron-dark);
  --color-surface-ledger: var(--surface-ledger);
  --color-surface-ledger-line: var(--surface-ledger-line);
  --color-surface-code-bg: var(--surface-code-bg);
  --color-surface-code-border: var(--surface-code-border);
  --color-text-primary: var(--text-primary);
  --color-text-on-card: var(--text-on-card);
  --color-text-sub: var(--text-sub);
  --color-text-muted: var(--text-muted);
  --color-brass: var(--color-brass);
  --color-brass-dark: var(--color-brass-dark);
  --color-primary: var(--color-primary);
  --color-secondary: var(--color-secondary);
  --color-focus: var(--color-focus);
  --color-ember: var(--color-ember);
  --color-info: var(--color-info);
  --color-success: var(--color-success);
  --color-status-order: var(--color-status-order);
  --color-status-prep: var(--color-status-prep);
  --color-status-cook: var(--color-status-cook);
  --color-status-serve: var(--color-status-serve);
}
```

これにより以下の Tailwind ユーティリティが使える:

```tsx
// ✅ Tailwind v4 方式
className = 'bg-surface-bg text-text-primary';

// ❌ var() 直書き（使うな）
className = 'bg-[var(--surface-bg)]';

// ❌ ハードコード（使うな）
className = 'bg-[#0d0d0e]';
```

### Step 2: tavern-light テーマの変数定義

既存の color-system.md の値をそのまま `[data-theme='tavern-light']` に移す。
現時点では generic light と同じ値。将来、喫茶店風カラースキームに変更予定。

```css
/* ── Tavern Light テーマ（昼の喫茶店） ── */
[data-theme='tavern-light'] {
  --surface-bg: #ffffff;
  --surface-board: #ffffff;
  --surface-card: #ffffff;
  --surface-card-light: #f8fafc;
  --surface-card-edge: #e2e8f0;
  --surface-header: #ffffff;
  --surface-header-dark: #f1f5f9;
  --surface-header-light: #ffffff;
  --surface-sidebar: #f8fafc;
  --surface-iron: #cbd5e1;
  --surface-iron-dark: #94a3b8;
  --surface-ledger: #ffffff;
  --surface-ledger-line: #e2e8f0;
  --surface-code-bg: #f1f5f9;
  --surface-code-border: #e2e8f0;
  --text-primary: #0f172a;
  --text-on-card: #0f172a;
  --text-sub: #475569;
  --text-muted: #94a3b8;
  --color-brass: #f97316;
  --color-brass-dark: #c2410c;
  --color-primary: #f97316;
  --color-secondary: #64748b;
  --color-focus: #f97316;
  --color-ember: #ea580c;
  --color-info: #2563eb;
  --color-success: #16a34a;
  --color-status-order: #cbd5e1;
  --color-status-prep: #fef08a;
  --color-status-cook: #f97316;
  --color-status-serve: #fbbf24;
}
```

### Step 3: tavern-dark テーマの変数定義

```css
/* ── Tavern Dark テーマ ── */
[data-theme='tavern-dark'] {
  --surface-bg: #0d0d0e;
  --surface-board: #221d19;
  --surface-card: #2e2419; /* AA 達成のため #3c3024 から暗く調整 */
  --surface-card-light: #3c3024; /* 旧 surface-card が light に繰り上げ */
  --surface-card-edge: #6c5138;
  --surface-header: #5d3920;
  --surface-header-dark: #382113;
  --surface-header-light: #7b5231;
  --surface-sidebar: #171513;
  --surface-iron: #4d4a46;
  --surface-iron-dark: #2d2a27;
  --surface-ledger: #241c17;
  --surface-ledger-line: #5b4736;
  --surface-code-bg: #16171a;
  --surface-code-border: #3e3429;
  --text-primary: #f1e5cf;
  --text-on-card: #f1e5cf;
  --text-sub: #d5c09d;
  --text-muted: #b19a7c;
  --color-brass: #b89557;
  --color-brass-dark: #7f643b;
  --color-primary: #f97316;
  --color-secondary: #64748b;
  --color-focus: #b89557;
  --color-ember: #d49a55;
  --color-info: #8ea6c0;
  --color-success: #829e73;
  --color-status-order: #cbd5e1;
  --color-status-prep: #fef08a;
  --color-status-cook: #f97316;
  --color-status-serve: #fbbf24;
}
```

### Step 4: ThemeStore 実装

```typescript
// src/store/themeStore.ts
import { create } from 'zustand';

type Theme = 'tavern-light' | 'tavern-dark';
// THEME_HOOK: 将来 'terminal' を追加する場合はここに型を追加

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('tck-theme') as Theme | null;
  if (stored === 'tavern-light' || stored === 'tavern-dark') return stored;
  // localStorage になければ OS 設定で判定
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'tavern-dark'
    : 'tavern-light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('tck-theme', theme);
}

export const useThemeStore = create<ThemeStore>((set) => {
  const initial = getInitialTheme();
  applyTheme(initial);
  return {
    theme: initial,
    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
    toggleTheme: () =>
      set((state) => {
        const next: Theme =
          state.theme === 'tavern-light' ? 'tavern-dark' : 'tavern-light';
        applyTheme(next);
        return { theme: next };
      }),
  };
});
```

テストファイル: `src/store/themeStore.test.ts`

```typescript
// 最低3テスト:
// 1. getInitialTheme: localStorage に値があればそれを返す
// 2. toggleTheme: tavern-light → tavern-dark → tavern-light
// 3. applyTheme: document.documentElement.dataset.theme が更新される
```

### Step 5: prefers-color-scheme をフォールバックに変換

`@media (prefers-color-scheme)` ブロックは**削除しない**。
`data-theme` 属性が未設定の場合のフォールバックとして残す。

```css
/* src/ui/index.css — prefers-color-scheme フォールバック */
/* data-theme が未設定の場合（初回アクセス、JS 無効時）のみ適用 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* tavern-dark の全変数をここにもコピー */
    --surface-bg: #0d0d0e;
    /* ... 以下省略（tavern-dark と同じ値） */
  }
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    /* tavern-light の全変数をここにもコピー */
    --surface-bg: #ffffff;
    /* ... 以下省略（tavern-light と同じ値） */
  }
}
```

`:root:not([data-theme])` セレクタにより、JS が `data-theme` 属性を設定した後は無視される。

## WCAG AA コントラスト比検証（tavern-dark）

| 組み合わせ                   | 前景    | 背景    | 比率   | 判定   |
| ---------------------------- | ------- | ------- | ------ | ------ |
| text-primary on surface-bg   | #f1e5cf | #0d0d0e | 15.8:1 | ✅ AAA |
| text-sub on surface-bg       | #d5c09d | #0d0d0e | 11.2:1 | ✅ AAA |
| text-muted on surface-bg     | #b19a7c | #0d0d0e | 7.4:1  | ✅ AA  |
| text-primary on surface-card | #f1e5cf | #2e2419 | 8.5:1  | ✅ AAA |
| text-sub on surface-card     | #d5c09d | #2e2419 | 6.0:1  | ✅ AA  |
| text-muted on surface-card   | #b19a7c | #2e2419 | 4.6:1  | ✅ AA  |
| brass on surface-bg          | #b89557 | #0d0d0e | 6.1:1  | ✅ AA  |
| color-primary on surface-bg  | #f97316 | #0d0d0e | 5.8:1  | ✅ AA  |
| status-order on surface-bg   | #cbd5e1 | #0d0d0e | 12.5:1 | ✅ AAA |
| status-cook on surface-bg    | #f97316 | #0d0d0e | 5.8:1  | ✅ AA  |

全組み合わせ WCAG AA 達成。

## 装飾パターン（CSS クラス定義）

すべての装飾要素に `aria-hidden="true"` を付けろ。

### 木目オーバーレイ

```css
/* src/ui/index.css に追加 */
.tavern-wood-grain {
  position: relative;
}
.tavern-wood-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.22;
  background-image:
    repeating-linear-gradient(
      7deg,
      rgba(255, 255, 255, 0.045) 0px,
      rgba(255, 255, 255, 0.045) 1px,
      transparent 2px,
      transparent 12px
    ),
    repeating-linear-gradient(
      171deg,
      rgba(0, 0, 0, 0.11) 0px,
      rgba(0, 0, 0, 0.11) 2px,
      transparent 3px,
      transparent 18px
    );
}
```

使い方: `<div className="tavern-wood-grain bg-surface-header">...</div>`
light テーマでは表示しない: `.tavern-wood-grain` を `[data-theme='tavern-dark']` 配下でのみ有効にする。

```css
[data-theme='tavern-light'] .tavern-wood-grain::after {
  display: none;
}
```

### 羊皮紙カード

```css
.tavern-parchment {
  position: relative;
  background: linear-gradient(
    180deg,
    var(--surface-card-light) 0%,
    var(--surface-card) 100%
  );
  border: 1px solid var(--surface-card-edge);
  border-radius: 2px;
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
.tavern-parchment::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.2;
  background-image:
    radial-gradient(
      circle at 18% 24%,
      rgba(255, 255, 255, 0.1) 0 1px,
      transparent 2px
    ),
    radial-gradient(
      circle at 70% 36%,
      rgba(0, 0, 0, 0.1) 0 1px,
      transparent 2px
    ),
    radial-gradient(
      circle at 42% 70%,
      rgba(255, 255, 255, 0.08) 0 1px,
      transparent 2px
    ),
    radial-gradient(
      circle at 82% 82%,
      rgba(0, 0, 0, 0.1) 0 1px,
      transparent 2px
    );
  background-size:
    120px 120px,
    140px 140px,
    110px 110px,
    130px 130px;
}

[data-theme='tavern-light'] .tavern-parchment {
  background: var(--surface-card);
  border-color: var(--surface-card-edge);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
[data-theme='tavern-light'] .tavern-parchment::before {
  display: none;
}
```

### 帳簿エディタ（Note 詳細）

```css
.tavern-ledger {
  background-color: var(--surface-card);
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%),
    repeating-linear-gradient(
      180deg,
      transparent 0px,
      transparent 29px,
      var(--surface-ledger-line) 30px
    );
}

[data-theme='tavern-light'] .tavern-ledger {
  background-color: var(--surface-bg);
  background-image: repeating-linear-gradient(
    180deg,
    transparent 0px,
    transparent 29px,
    var(--surface-ledger-line) 30px
  );
}
```

### 鋲（リベット）

```css
.tavern-rivet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--surface-iron-dark);
  box-shadow:
    0 0 0 1px var(--surface-iron),
    inset 0 1px 1px rgba(255, 255, 255, 0.08);
}

[data-theme='tavern-light'] .tavern-rivet {
  background-color: var(--surface-iron);
  box-shadow: 0 0 0 1px var(--surface-card-edge);
}
```

### 鉄枠（SlimFrame）

```css
.tavern-iron-frame {
  border: 1px solid var(--color-brass-dark);
  border-radius: 6px;
  padding: 3px;
  background: linear-gradient(
    180deg,
    var(--surface-header) 0%,
    var(--surface-header-dark) 100%
  );
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.tavern-iron-frame > .tavern-iron-frame-inner {
  border: 1px solid var(--surface-iron-dark);
  border-radius: 3px;
  background: linear-gradient(
    180deg,
    var(--surface-board) 0%,
    var(--surface-sidebar) 100%
  );
}

[data-theme='tavern-light'] .tavern-iron-frame {
  border-color: var(--surface-card-edge);
  background: var(--surface-bg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
[data-theme='tavern-light'] .tavern-iron-frame > .tavern-iron-frame-inner {
  border-color: var(--surface-card-edge);
  background: var(--surface-bg);
}
```

## 酒場コピー

酒場コピーは tavern-dark のみ。light では generic 文言。

```typescript
// src/libs/tavern-copy.ts
import { useThemeStore } from '@/store/themeStore';

const TAVERN_COPY = {
  taskCreated: '注文が入りました',
  taskServed: 'お待たせしました',
  emptyTasks: '注文はまだ入っていません',
  loginGreeting: 'おかえりなさい、店主',
  error: 'おっと、少し手間取っています',
  emptyProjects: 'まだメニューがありません',
  emptyNotes: '帳簿はまだ白紙です',
} as const;

const GENERIC_COPY = {
  taskCreated: 'タスクを作成しました',
  taskServed: 'タスクを完了しました',
  emptyTasks: 'タスクはありません',
  loginGreeting: 'ようこそ',
  error: 'エラーが発生しました',
  emptyProjects: 'プロジェクトはありません',
  emptyNotes: 'ノートはありません',
} as const;

export type CopyKey = keyof typeof TAVERN_COPY;

export function getCopy(key: CopyKey): string {
  const theme = useThemeStore.getState().theme;
  return theme === 'tavern-dark' ? TAVERN_COPY[key] : GENERIC_COPY[key];
  // tavern-light でも将来的には喫茶店風コピーに変更予定
}
```

## 温度表現

```css
/* cook ステータスの pulse */
@keyframes tavern-ember-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}

[data-theme='tavern-dark'] .status-cook {
  animation: tavern-ember-pulse 2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-theme='tavern-dark'] .status-cook {
    animation: none;
  }
}
```

## コンポーネント → 世界観マッピング

| コンポーネント   | tavern-dark の装飾                     | CSS クラス          |
| ---------------- | -------------------------------------- | ------------------- |
| TopNav           | 木目 + 鋲 + brass アクセント           | `tavern-wood-grain` |
| TaskCard         | 羊皮紙 + Pin アイコン                  | `tavern-parchment`  |
| ProjectCard      | 木目 + 鋲 + 進捗バー（brass gradient） | `tavern-wood-grain` |
| NoteDetailPage   | 帳簿 + 罫線 + バインディング           | `tavern-ledger`     |
| ActivityFeed     | 木目 dark + ログ項目                   | `tavern-wood-grain` |
| KanbanBoard 外枠 | 鉄枠                                   | `tavern-iron-frame` |
| ダイアログ       | 羊皮紙                                 | `tavern-parchment`  |

light テーマではすべての tavern 装飾が無効化される（`[data-theme='tavern-light']` で `display: none` or フラット化）。

## NGリスト

絵文字アイコン禁止。挨拶禁止。4枚均等禁止。Nunito/Inter/Roboto 禁止。
角丸もこもこ禁止。暖色ベタ塗り禁止。完了タスク非表示禁止。
型定義変更禁止。勝手なステータス名禁止。
