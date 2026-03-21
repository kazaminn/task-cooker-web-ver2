# TaskCooker Web 仕様書

last-updated: 2026-03-21

---

## 概要

TaskCooker のウェブ版。料理メタファーのタスク管理アプリ。
GitHub クローン的な位置づけで、Issue 管理 + Project Board を料理の工程で表現する。

ドメインモデル（ステータス・優先順位・型定義）は CLI 版が正。
CLI 仕様: `apps/task-cooker-cli/docs/tck-cli-spec.md`

---

## MVP スコープ

### 含める機能

- **認証** — Google OAuth ログイン。Landing + Login + Signup ページ分離
- **プロジェクト** — 一覧、作成、概要、設定
- **タスク CRUD** — 作成、編集、削除、ステータス/優先順位変更
- **リストビュー** — GitHub Issues 風のタスク一覧
- **カンバンビュー + DnD** — order/prep/cook/serve 4列、ドラッグ&ドロップでステータス遷移
- **ビュー切替** — リスト ↔ カンバン
- **フィルタ/検索** — タイトル検索、ステータス・優先順位フィルタ
- **タスクコメント** — コメント一覧・投稿（author: user/claude/codex）
- **チーム** — チーム一覧、作成、メンバー管理（userId 直指定で追加）
- **アクティビティログ** — Activity コレクション。クライアント側で記録。ダッシュボードに表示
- **貢献グラフ** — GitHub の草グラフ相当（pancake browning 5段階）。Activity から日別集計
- **ダークモード** — シンプルなダーク/ライトテーマ（酒場テーマなし）
- **レスポンシブ** — モバイルはリスト表示にフォールバック
- **アクセシビリティ** — WCAG 2.1 AA、react-aria-components

### 除外する機能（MVP後）

- **酒場テーマ（Kazamin's Tavern）** — 装飾は後回し。シンプルなダーク/ライトで十分
- **ゲーミフィケーション（フル）** — XP、レベル、ストリーク、実績バッジは MVP 後。貢献グラフのみ MVP に含む
- **Mix UI** — Phase 5
- **Markdown エディタ** — Phase 5
- **サブタスク** — Phase 5
- **全文検索** — Phase 5
- **テーブルビュー** — Phase 5

---

## ユーザーストーリー

### 認証

- ユーザーとして、Google でログインして自分のタスクにアクセスしたい
- ユーザーとして、ログアウトできる

### プロジェクト管理

- ユーザーとして、新しいプロジェクトを作成したい（名前 + slug）
- ユーザーとして、プロジェクト一覧からプロジェクトを切り替えたい
- ユーザーとして、ダッシュボードで全プロジェクト横断のタスクを見たい

### タスク管理（コア）

- ユーザーとして、タスクを作成したい（タイトル、優先順位、プロジェクト）
- ユーザーとして、カンバン上でタスクのステータスを一目で把握したい（order/prep/cook/serve）
- ユーザーとして、リスト表示でも管理したい（GitHub Issues 風）
- ユーザーとして、リストとカンバンを切り替えたい
- ユーザーとして、タスクをドラッグ＆ドロップでステータス遷移させたい
- ユーザーとして、タスクをクリックして詳細ページで見たい・編集したい
- ユーザーとして、タスクに本文を書きたい
- ユーザーとして、タスクにコメントを残したい（author: user/claude/codex）
- ユーザーとして、優先順位やステータスでフィルタリングしたい
- ユーザーとして、タイトルでタスクを検索したい
- ユーザーとして、タスクを削除したい

### 表示

- ユーザーとして、ダークモードとライトモードを切り替えたい
- ユーザーとして、スマホからも操作したい（レスポンシブ）

---

## 実装フェーズ

### Phase 0: domain 層の同期（完了済み）

1. CLI の `src/domain/` から型定義を読み取る
2. Web の `src/types/` を CLI 定義で上書き
3. ステータス・優先順位の定数・ラベル定義を作成
4. Firestore converter を実装

### Phase 0.5: 依存整理

- **Lucide React 削除** → **FontAwesome に統一**
- react-router-dom 削除（React Router v7 は react-router に統合）
- @uiw/react-md-editor は残す（MVP ではプレーンテキスト、将来 Markdown 対応時に使用）
- seed スクリプトを新スキーマ（projects/ 配下ネスト型）に更新
- starter kit コンポーネントのコピー時に Lucide アイコン参照を FontAwesome に差し替え

### Phase 1: 認証 + レイアウト

- Landing ページ（`/`）
- Login ページ（`/login`）— Google OAuth
- Signup ページ（`/signup`）— Google OAuth
- AuthGuard
- AppLayout（トップナビ: Dashboard / Projects / Settings + フル幅メインエリア）
- ルーティング設定（React Router v7、TanStack Query でフェッチ）
- personal チーム自動作成（初回ログイン時）
  - 失敗時: 次回ログイン時に Team 存在チェック → なければ再作成
- api/ レイヤー基盤（firebase.ts, auth.ts, userConverter）
- ダークモード土台: CSS変数ベースのダーク/ライト切替スケルトン
- hooks/useFirestoreSubscription.ts（TanStack Query + onSnapshot 統合）

### Phase 2: プロジェクト

- Firestore プロジェクト repository（onSnapshot）
- useProjects フック
- プロジェクト一覧ページ（`/projects`）
- プロジェクト作成ダイアログ
- プロジェクト概要・設定ページ

### Phase 3: タスク（コア）

- api/tasks.ts（onSnapshot, CRUD, displayId 採番）
- api/activities.ts（タスク操作時に Activity 自動記録）
- useTasks フック
- リストビュー（GitHub Issues 風）
- カンバンビュー（4列）— react-aria DnD
- ビュー切替
- TaskCard コンポーネント
- タスク作成ダイアログ
- タスク詳細ページ（`/projects/:id/tasks/:taskId`、全画面遷移）
- DnD ステータス遷移
- タイトル検索 + フィルタ
- ダッシュボードのアクティビティフィード表示

### Phase 4: タスクコメント

- コメント一覧表示
- コメント投稿
- author タイプ（user/claude/codex）表示

### Phase 5: チーム

- チーム一覧ページ
- チーム作成
- メンバー管理（userId 直指定で追加）

### Phase 6: 貢献グラフ + プロフィール

- 貢献グラフ（pancake browning 5段階）
- プロフィールページ

### Phase 7: 仕上げ

- ダークモード最終調整
- レスポンシブ対応（モバイル: リストフォールバック）
- アクセシビリティ最終チェック

---

## 画面構成

詳細なコンポーネントツリーは `page-anatomy.md` を参照。

### レイアウト

- **トップナビ型**（サイドバーなし）。高さ 48px のナビバー + フル幅メインエリア
- ナビバー: ロゴ + グローバルナビ（Dashboard / Projects）+ ユーザーアバター
- モバイル: ハンバーガーメニュー → ドロワーでナビ展開

### ルート構成

```
/                          LandingPage (public)
/login                     LoginPage (public)
/signup                    SignupPage (public)
/home                      DashboardPage (protected, AppLayout)
/projects                  ProjectListPage (protected, AppLayout)
/projects/:id              ProjectOverviewPage (protected, AppLayout > ProjectLayout)
/projects/:id/tasks        ProjectTasksPage (protected, AppLayout > ProjectLayout)
/projects/:id/tasks/:taskId TaskDetailPage (protected, AppLayout > ProjectLayout)
/projects/:id/settings     ProjectSettingsPage (protected, AppLayout > ProjectLayout)
/teams                     TeamListPage (protected, AppLayout)
/teams/:id/members         TeamMembersPage (protected, AppLayout)
/profile                   ProfilePage (protected, AppLayout)
/settings                  AppSettingsPage (protected, AppLayout)
*                          NotFoundPage (404)
```

### 削除フロー

- **タスク削除**: タスク詳細ページに削除ボタン → 確認ダイアログ → 削除後タスクリストにリダイレクト
- **プロジェクト削除**: プロジェクト設定ページの危険ゾーンに削除ボタン → 確認ダイアログ → 削除後プロジェクト一覧にリダイレクト

### 空状態（Empty State）

- **プロジェクトゼロ**: 「最初のプロジェクトを作成しましょう」+ 作成ボタン
- **タスクゼロ**: 「最初の注文を入れましょう」+ 作成ボタン（料理メタファー活用）
- **コメントゼロ**: 「まだコメントはありません」
- **チームメンバーゼロ（personal以外）**: 「メンバーを招待しましょう」

---

## Firestore スキーマ

個人=1人チームとして扱う。Team モデルを MVP から導入。

```
teams/{teamId}
  name, type, ownerId, memberIds, createdAt, updatedAt

projects/{projectId}
  slug, teamId, name, overview, status, ownerId, memberIds, createdAt, updatedAt

  tasks/{taskId}
    displayId: number            # ユーザー向け連番 (#1, #2, ...)。プロジェクトスコープ
    projectRef: string
    teamId: string
    title: string
    description: string
    status: "order" | "prep" | "cook" | "serve"
    priority: "urgent" | "high" | "medium" | "low"
    assigneeId?: string
    dueDate: timestamp | null
    linkedTaskIds: string[]      # Firestore doc ID の配列
    position: number
    createdAt: timestamp
    updatedAt: timestamp

  tasks/{taskId}/comments/{commentId}
    author: string               # "user" | "claude" | "codex"
    authorId: string
    authorName: string
    body: string
    createdAt: timestamp

  activities/{activityId}
    type: ActivityType
    teamId?: string
    projectId?: string
    userId: string
    userName: string
    text: string
    createdAt: timestamp

  counters/{counterName}         # displayId 採番用（プロジェクトスコープ）
    current: number

counters/{counterName}           # グローバルカウンター（必要に応じて）
  current: number

mixes/{mixId}                    # MVP外
  projectRef, authorId, author, title, status, isPublic,
  lastActivityAt, createdAt, updatedAt

  mixes/{mixId}/comments/{commentId}
    author, body, createdAt
```

### displayId 採番

クライアント側 Firestore トランザクションで `projects/{projectId}/counters/task` の `current` を atomic increment する。
プロジェクトスコープで #1 から採番。Cloud Functions は使わない。

### linkedTaskIds 整合性

Phase 3 後半で Cloud Functions (onDelete トリガー) を実装予定。
MVP 時点ではリンク先が削除されても孤児リンクは残る（UI 上で「削除済みタスク」と表示）。

### Activity ログ

- **コレクション**: `projects/{projectId}/activities`
- **書き込み**: クライアント側。タスク/プロジェクト操作時に api/ 内で Activity ドキュメントを同時作成
- **ActivityType**: task_create, task_update, project_create, project_update, team_create, user_signup, profile_update 等

### 貢献グラフデータ

- Activity コレクションから日別に集計して表示（別コレクションは不要）

---

## ドメインモデル（型定義）

CLI の `apps/task-cooker-cli/src/domain/types.ts` が正。
Web 用の型定義は `apps/task-cooker-web/src/types/` に配置:

- `types.d.ts` — インターフェース定義
- `constants.ts` — ステータス・優先順位の定数・ラベル
- `schemas.ts` — Zod スキーマ（フォームバリデーション等）

実装の詳細は上記ファイルを直接参照すること。

---

## アクセシビリティ要件

- WCAG 2.1 AA 準拠
- react-aria-components で ARIA 対応
- キーボードナビゲーション完全対応
- フォーカスリング表示
- スキップリンク
- 色だけに依存しない情報伝達（アイコン + テキスト + 色）
- prefers-reduced-motion 対応
- DnD はキーボードでも操作可能にする

---

## セキュリティ

- Firebase Auth: Google Provider のみ
- Firestore ルール: memberIds ベースのアクセス制御
- 環境変数は `.env.local` で管理（git 追跡しない）
- Firebase エミュレーターでテスト。本番に触れない
