# Design System & UI Structure

last-updated: 2026-03-21

---

## Core Principles

- **Accessibility First**: react-aria-components ベース。WCAG 2.1 AA 準拠
- **Consistency through Tokens**: 全デザイン値（色、間隔、タイポグラフィ、角丸）は `index.css` のデザイントークンで管理
- **Responsive Design**: sm/md/lg の3ブレークポイント。モバイルファースト

---

## デザイントーン

- **料理メタファー寄り**: 温かみのある配色、角丸カード、控えめなメタファー表現
- **テーマ**: OS 設定に追従（prefers-color-scheme）+ 手動切替可。酒場テーマは MVP 後
- **配色**: 温かみのあるニュートラルカラー + ステータス色（order:スレートブルー、prep:イエロー、cook:オレンジ、serve:アンバー）

### AIスロップ回避ガイドライン

1. **料理メタファーで個性を出す** — ステータスラベル（注文済み/仕込み中/調理中/提供済み）、UIコピーに自然な料理用語を織り交ぜる
2. **非対称・有機的なレイアウト** — 完璧な等間隔グリッドを避け、情報密度に応じて可変させる
3. **温かみのある不完全さ** — 完璧すぎない手触り感のあるUI（微妙な影、テクスチャ感のあるボーダー等）
4. **実用性優先** — 「見た目がきれい」より「使いやすい」。余白は目的を持たせる
5. **日本語ファースト** — UIコピーは自然な日本語。英語直訳フレーズを避ける

---

## Key Component Displays

### Task Status Display

Task status は **色 + テキスト** の組み合わせで伝達する。色だけに頼らない。

| ステータス | ラベル   | 色           | メタファー         |
| ---------- | -------- | ------------ | ------------------ |
| `order`    | 注文済み | Slate blue   | 注文されたが未着手 |
| `prep`     | 仕込み中 | Amber/yellow | 材料の準備中       |
| `cook`     | 調理中   | Orange/red   | 火にかけて調理中   |
| `serve`    | 提供済み | Golden amber | 料理を提供済み     |

表示: テキストラベル + ステータス色のドット or 左ボーダー

### Task Priority Display

優先順位は **方向アイコン + aria-label** で表現。色は使わない（ステータスと混同防止）。

| 優先順位 | アイコン | aria-label |
| -------- | -------- | ---------- |
| `urgent` | ⏫       | 緊急       |
| `high`   | ↑        | 高         |
| `medium` | →        | 中         |
| `low`    | ↓        | 低         |

---

## Root Layout

トップナビ型（サイドバーなし）。

- **TopNav** (48px, 固定位置):
  - Left: App Logo（`/home` へのリンク）
  - Center: グローバルナビゲーション（Dashboard / Projects）
  - Right: User Avatar（Profile / Settings / Logout のドロップダウン）
- **Main Content**: フル幅。スクロール可能。残りのビューポートを占有
- **モバイル**: ハンバーガーメニュー → ドロワーでナビ展開

---

## Kitchen Dashboard Page (`/home`)

GitHub ダッシュボード型。1カラム縦並び。

### A. Daily Summary (Daily Pulse)

- 本日の serve 数（達成感の可視化）
- 期限切れアラート（urgency の伝達）

### B. Active Tasks (On the Stove)

- 全PJ横断で prep/cook 中のタスクを表示
- Adaptive Display: personal PJ では assignee 非表示、team PJ では表示

### C. Contribution Graph

- パンケーキの焼き色 5段階の草グラフ（GitHub 相当）
- Activity から日別集計

### D. Project List (Recent Recipes)

- 全プロジェクトの進捗概要（`serve/total` の ProgressBar）
- 「+ New Project」ボタン

### E. Activity Feed (Kitchen Logs)

- 直近 5-10 件のアクティビティ

### F. Quick Add Input

- 1行入力。Enter で即 order 作成（デフォルトプロジェクト）

---

## Project Page Content

タブベースのナビゲーション。

- **ProjectHeader**: パンくずリスト（Projects > {ProjectName}）
- **ProjectTabs**:
  - Overview: 進捗メーター + 統計 + 概要テキスト + 最近のアクティビティ
  - Tasks: リスト/カンバン表示
  - Settings: プロジェクト編集・削除
  - ※ Mixes は MVP 外
- **Task Detail**: 全画面遷移（`/projects/:id/tasks/:taskId`）。ProjectLayout 内に表示

---

## Project Type and UI Adaptive Control

- **Personal Project** (`type: 'personal'`): Assignee フィールド非表示。メンバー管理不要
- **Team Project** (`type: 'team'`): Assignee アイコン表示。メンバーアクティビティ表示

---

## コンポーネント調達

- **starter kit** (`packages/kz-react-aria-tw-starter`) から src にコピー。util 関数は kz-shared-ui 仕様に合わせる
  - 対象: Button, Select, DatePicker, Dialog, Tabs, Menu, SearchField, etc.
- **新規作成**（features/ 内）
  - 対象: TaskCard, KanbanBoard, ContributionGraph, TopNav, ProjectCard, etc.

### 実装リファレンス

- **カンバン（DnD）** — react-aria 公式カンバンサンプル
- **テーブル（CRUD）** — react-aria 公式 CRUD テーブルサンプル

---

## Typography

Japanese support。`@theme` でフォントをオーバーライド。

```css
@theme {
  --font-sans:
    'Helvetica Neue', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Segoe UI',
    Arial, 'Noto Sans JP', Meiryo, sans-serif;
  --font-serif: 'BIZ UDPMincho', 'Noto Serif JP', serif;
  --font-mono: SFMono-Regular, Menlo, Monaco, Consolas, Meiryo, monospace;
}
```
