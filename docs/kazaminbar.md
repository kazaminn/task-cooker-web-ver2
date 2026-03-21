# TaskCooker Tavern Theme — Design Skill v2

## 世界観

ユーザーは「かざみんの酒場」の店主兼料理人。タスクは客からの注文。パンケーキが看板メニュー。

| 概念                 | 酒場メタファー                       | システム上の実体   |
| -------------------- | ------------------------------------ | ------------------ |
| ユーザー             | 店主兼料理人                         | Firebase Auth User |
| タスク               | 客からの注文                         | Task document      |
| order                | 注文が入った                         | TaskStatus.order   |
| prep                 | 仕込み中                             | TaskStatus.prep    |
| cook                 | 焼いてる                             | TaskStatus.cook    |
| served               | お出しした                           | TaskStatus.serve   |
| Project              | メニューカテゴリ / テーブル          | Project document   |
| Dashboard            | 厨房から見える店内                   | /dashboard         |
| 草グラフ             | パンケーキの焼き色（browning 5段階） | ContributionGraph  |
| ゲーミフィケーション | 常連客が増える、腕が上がる           | XP/Level           |

**鉄則**: 型定義・ステータス名・遷移ロジックは一切変えない。酒場はテーマレイヤーのみ。

---

## テーマ設計

### テーマ一覧

| テーマ名       | data-theme     | light/dark | 優先度 |
| -------------- | -------------- | ---------- | ------ |
| 酒場 Dark      | `tavern-dark`  | dark       | MVP    |
| 酒場 Light     | `tavern-light` | light      | MVP    |
| コマンドモード | `command`      | dark       | 後付け |

### テーマ状態管理（zustand）

```typescript
interface ThemeStore {
  theme: 'tavern-light' | 'tavern-dark' | 'command';
  setTheme: (theme: ThemeStore['theme']) => void;
  toggleDarkLight: () => void;
  toggleCommandMode: () => void;
}
```

- `document.documentElement`に`data-theme`属性を付与
- `localStorage`に永続化
- `prefers-color-scheme: dark`でOS設定を初期値に
- light↔dark: ヘッダーのトグル
- コマンドモード: `Ctrl+Shift+T`（後付け）

### CSS変数（抜粋）

```css
[data-theme='tavern-dark'] {
  --surface-bg: #3a2a1a;
  --surface-board: #6a5238;
  --surface-card: linear-gradient(135deg, #f4edd8, #e8dcc0);
  --surface-sidebar: linear-gradient(135deg, #f0e6cf, #e8dcc8);
  --surface-header: linear-gradient(180deg, #5c4430, #3a2a1a);
  --text-primary: #f4edd8;
  --text-on-card: #3d2c1e;
  --text-sub: #c9b890;
  --text-muted: #9a8a6a;
  --color-primary: #f97316;
  --color-secondary: #64748b;
  --color-focus: #fbbf24;
}

[data-theme='tavern-light'] {
  --surface-bg: #f7f6f3;
  --surface-board: #ffffff;
  --surface-card: linear-gradient(135deg, #faf8f0, #f0ead8);
  --surface-sidebar: #faf8f2;
  --surface-header: #5c4430; /* 梁は共通 */
  --text-primary: #3d2c1e;
  --text-on-card: #3d2c1e;
  --text-sub: #6d5a40;
  --text-muted: #9a8a6a;
  --color-primary: #f97316;
  --color-secondary: #64748b;
  --color-focus: #f97316;
}
```

ステータスカラーはテーマ不変:

```css
--color-status-order: #cbd5e1; /* slate.300 */
--color-status-prep: #fef08a; /* yellow.200 (light上ではyellow.500 #eab308にfallback) */
--color-status-cook: #f97316; /* orange.500 */
--color-status-serve: #fbbf24; /* amber.400 */
```

---

## ページ一覧

### パブリック

| パス      | ページ       | ファイル                       |
| --------- | ------------ | ------------------------------ |
| `/`       | LandingPage  | `ui/pages/LandingPage.tsx`     |
| `/login`  | LoginPage    | `features/auth/LoginPage.tsx`  |
| `/signup` | SignupPage   | `features/auth/SignupPage.tsx` |
| `*`       | NotFoundPage | `ui/pages/NotFoundPage.tsx`    |

### ProtectedRoute 配下

| パス                                | ページ                   | ファイル                                      | 説明                                         |
| ----------------------------------- | ------------------------ | --------------------------------------------- | -------------------------------------------- |
| `/home`                             | KitchenDashboardPage     | `features/dashboard/KitchenDashboardPage.tsx` | メイン。厨房からの眺め                       |
| `/projects`                         | ProjectListPage          | `features/projects/ProjectListPage.tsx`       | プロジェクト一覧                             |
| `/projects/:projectId`              | ProjectLayout            | —                                             | 入れ子レイアウト（→ overviewにリダイレクト） |
| `/projects/:projectId/overview`     | ProjectOverviewPage      | `features/projects/ProjectOverviewPage.tsx`   | プロジェクト概要                             |
| `/projects/:projectId/tasks`        | ProjectTasksPage         | `features/projects/ProjectTasksPage.tsx`      | タスク一覧（list/table/kanban）              |
| `/projects/:projectId/mixes`        | ProjectMixesPage         | `features/projects/ProjectMixesPage.tsx`      | Mix（ノート）一覧                            |
| `/projects/:projectId/settings`     | ProjectSettingsPage      | `features/projects/ProjectSettingsPage.tsx`   | プロジェクト設定                             |
| `/projects/:projectId/mixes/:mixId` | MixDetailPage            | —                                             | Mix詳細                                      |
| `/teams`                            | TeamListPage             | `features/teams/TeamListPage.tsx`             | チーム一覧                                   |
| `/teams/:teamId/members`            | TeamMemberManagementPage | `features/teams/TeamMemberManagementPage.tsx` | チームメンバー管理                           |
| `/profile`                          | ProfilePage              | —                                             | ユーザープロフィール                         |
| `/settings`                         | AppSettingsPage          | —                                             | テーマ・a11y・ゲーミフィケーション           |

### ディレクトリ構造

```
src/
├── ui/pages/
│   ├── LandingPage.tsx
│   └── NotFoundPage.tsx
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── dashboard/
│   │   └── KitchenDashboardPage.tsx
│   ├── teams/
│   │   ├── TeamListPage.tsx
│   │   └── TeamMemberManagementPage.tsx
│   └── projects/
│       ├── ProjectListPage.tsx
│       ├── ProjectOverviewPage.tsx
│       ├── ProjectTasksPage.tsx
│       ├── ProjectMixesPage.tsx
│       └── ProjectSettingsPage.tsx
```

---

## 画面アナトミー

### /home — Kitchen Dashboard (KitchenDashboardPage)

厨房のカウンターから店内を見渡す。

```
┌─────────────────────────────────────────────┐
│ [Header]                                     │
│  ☰ TaskCooker          [/] [☀/☾] [avatar]   │
├────────┬────────────────────────────────────┤
│ Sidebar│  Main                               │
│        │                                     │
│ Projects│  ┌─ Today's Orders ──────────────┐ │
│  tc  4 │  │ cook中 + 今日dueのタスク           │ │
│  ui  2 │  └──────────────────────────────┘ │
│  pf  1 │                                     │
│  gl  1 │  ┌─ Kitchen Overview ────────────┐ │
│        │  │ Project × status 分布バー        │ │
│ Status  │  └──────────────────────────────┘ │
│  ○ 3   │                                     │
│  ○ 2   │  ┌─ Recent Activity ─────────────┐ │
│  ○ 4   │  │ 直近の完了・ステータス変更ログ       │ │
│  ○ 1   │  └──────────────────────────────┘ │
│        │                                     │
│ Contrib │  [+ Post a new order... ___________]│
│ ▪▪▪▪▪▪▪│                                     │
│ Today  │                                     │
│  1/10  │                                     │
└────────┴────────────────────────────────────┘
```

| セクション       | 内容                               | コンポーネント     |
| ---------------- | ---------------------------------- | ------------------ |
| Today's Orders   | cook中 + 今日dueのタスク。緊急度順 | TaskCard (compact) |
| Kitchen Overview | Projectごとステータス分布バー      | ProjectStatusBar   |
| Recent Activity  | 直近ActivityLog 5-10件             | ActivityItem       |
| Quick Add        | 1行入力。Enter即order              | QuickAddInput      |

### /projects/:projectId — ProjectLayout（入れ子）

ProjectLayoutが外枠。サブルートでタブ切り替え（overview/tasks/mixes/settings）。

```
┌─────────────────────────────────────────────┐
│ [Header]                                     │
├────────┬────────────────────────────────────┤
│ Sidebar│  [Project Name]                     │
│        │  [Overview | Tasks | Mixes | Settings] ← Tabs │
│        │                                     │
│        │  ┌─ サブルートの中身 ────────────┐  │
│        │  │ overview: README風概要          │  │
│        │  │ tasks: リスト/テーブル/カンバン    │  │
│        │  │ mixes: ノート一覧              │  │
│        │  │ settings: プロジェクト設定        │  │
│        │  └──────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

### /projects/:projectId/tasks — ProjectTasksPage

```
┌────────────────────────────────────────┐
│ [Filter: status / priority / due]       │
│ [List | Table | Kanban] ← 表示切り替え    │
│                                         │
│ (icon) Task title          ↑  3/22     │
│ (icon) Task title          →  3/25     │
│ (icon) Task title          ↓  3/28     │
│ ...                                     │
└────────────────────────────────────────┘
```

---

## コンポーネント一覧

### 既存 kazaminn-ui（25個）→ そのまま使用

### 酒場テーマ新規

**軽（半日以内）: 11個**
StatusIcon, StatusBadge, PriorityIndicator, QuickAddInput, ActivityItem, ProjectStatusBar, ParchmentCard, ThemeToggle, SidebarNav, Avatar, Badge

**中（1日）: 9個**
TaskCard, ContributionGraph, TaskListView, FilterBar, DashboardToday, DashboardOverview, DashboardActivity, ServeToast, MobileDrawer

**重（2日以上）: 4個**
DataTable, KanbanBoard, MarkdownEditor, CommandPalette

**合計**: 既存25 + 新規24 = 49個（v5引き継ぎの78個から酒場MVP向けに絞り込み）

---

## レスポンシブ方針

モバイルファースト。**md/lgがメイン設計ターゲット。smは保険。**

| ブレーク | 幅        | 優先度 | レイアウト                                        |
| -------- | --------- | ------ | ------------------------------------------------- |
| md       | 640-960px | ★★★    | 1カラム。ドロワー260px。標準パディング            |
| lg       | 960px+    | ★★★    | 2カラム。サイドバー固定210px                      |
| sm       | <640px    | ★☆☆    | 1カラム。ドロワー80vw。詰めパディング。最低限動く |

CSSはmin-width。sm→md→lgで積む。

---

## ビジュアル言語

### tavern-dark

- 背景: ダークブラウン木目
- カード: 羊皮紙。紙めくれ**左下**
- ヘッダー: 太い梁

### tavern-light

- 背景: 温かみオフホワイト
- カード: 軽い羊皮紙。紙めくれ**左下**
- ヘッダー: ダークウッド（light/dark共通）

### 紙のめくれ

- `::after`疑似要素。**左下**
- done/servedにはめくれなし
- `pointer-events: none`

### タイポグラフィ

- 見出し: IM Fell English SC（控えめに）
- 本文: Instrument Sans
- コード: monospace

### アイコン

- SVG stroke-based, currentColor, 24x24, stroke-width 1.5
- チャッピー案1 → チュートリアル専用

### 温度表現

- order: 静か / prep: 暖かい / cook: pulse / served: golden + toast

---

## a11y（崩すな）

WCAG 2.2 AA。role/aria全部。focus-visible。キーボード完結。色非依存。reduced-motion対応。

---

## NGリスト

絵文字アイコン禁止。挨拶禁止。4枚均等禁止。Nunito/Inter/Roboto禁止。角丸もこもこ禁止。暖色ベタ塗り禁止。完了タスク非表示禁止。型定義変更禁止。勝手なステータス名禁止。
