# CLAUDE.md

このファイルは Claude Code 向けのプロジェクトガイドです。
TaskCooker Web の実装を自律的に進めるための全情報がここにある。

## 必読ドキュメント

@apps/task-cooker-web/CONTRIBUTING.md
@apps/task-cooker-web/CODINGRULE.md
@apps/task-cooker-web/docs/lesson-learned.md

## プロジェクト概要

TaskCooker — 料理メタファーのタスク管理アプリ。GitHub クローン的な位置づけ。

| TaskCooker      | GitHub 相当                       |
| --------------- | --------------------------------- |
| Project         | Repository                        |
| Task            | Issue                             |
| Task のコメント | Issue Comment                     |
| Mix             | Gist（独立メモ/ディスカッション） |
| master.todo     | Project Board                     |
| activity.log    | Activity Feed                     |

## ソースオブトゥルース（優先順）

**型定義やステータスで迷ったら、必ずこの順で参照すること。**

1. `docs/task-cooker-cli/tck-cli-spec.md` — ドメイン定義の正
2. `apps/task-cooker-cli/src/domain/` — 型定義の正
3. `apps/task-cooker-web/src/` — 既存コード（CLI 以前の古い状態。使えるものは流用するが domain 層は CLI に合わせて上書き）
4. `docs/` — 参考程度（古い可能性あり）

**実装前に必ず以下を読むこと:**

- `docs/task-cooker-cli/tck-cli-spec.md`
- `docs/task-cooker-cli/tck-cli-architecture.md`
- `apps/task-cooker-cli/src/domain/types.ts`
- `docs/task-cooker-web/tck-web-spec.md`（ウェブ版仕様書）

---

## 技術スタック

| カテゴリ          | 技術                                               |
| ----------------- | -------------------------------------------------- |
| フレームワーク    | React 19 + TypeScript                              |
| ビルド            | Vite                                               |
| スタイリング      | Tailwind CSS v4                                    |
| UI コンポーネント | react-aria-components                              |
| バックエンド      | Firebase（Auth + Firestore + Cloud Functions）     |
| 状態管理          | TanStack Query（サーバー状態） + Zustand（UI状態） |
| ルーティング      | React Router v7                                    |
| アイコン          | FontAwesome                                        |
| DnD               | react-aria の DnD                                  |
| テスト            | Vitest + Testing Library                           |
| リンター          | ESLint + Prettier                                  |
| デプロイ          | Vercel（Claude Code はデプロイするな）             |

---

## ディレクトリ構成

```
task-cooker/
├── CLAUDE.md                    ← このファイル
├── apps/
│   ├── kz-shared-ui/            # 共有 UI ライブラリ（使えるものは使え）
│   ├── task-cooker-cli/         # CLI 版（完成済み、触るな。Phase 9まで解禁しない）
│   │   ├── CLAUDE.md
│   │   └── src/domain/              # ★ 型定義の正
│   └── task-cooker-web/         # ← 今回実装するもの
│       ├── firebase.json
│       ├── firebase-data/       # エミュレーターデータ（既存）
│       ├── firestore.rules
│       ├── scripts/seed.ts
│       └── src/
│           ├── App.tsx
│           ├── main.tsx
│           ├── features/
│           ├── hooks/
│           ├── libs/
│           ├── services/        # ★ service層（Phase 5Aで導入）
│           ├── stores/
│           ├── types/
│           └── ui/
├── docs/
│   ├── task-cooker-cli/
│   │   ├── tck-cli-spec.md          # ★ ドメイン定義の正
│   │   └── tck-cli-architecture.md
│   └── task-cooker-web/
│       ├── tck-web-spec.md          # ★ ウェブ版仕様書
│       ├── post-mvp-plan-v3.md      # ★ Post-MVP拡大計画
│       ├── design-system.md
│       ├── color-system.md
│       └── ...
└── .claude/
    ├── skills/nanj-brainstorm/  # なんJスキル
    └── nanJ/                    # なんJスレログ出力先
```

## kz-shared-ui（共有UIライブラリ）

apps/kz-shared-ui/ は kazaminn-ui コンポーネントライブラリ。

- 実装前に `apps/kz-shared-ui/CLAUDE.md` を読め
- `src/components/` に再利用可能なコンポーネントがある。使えるものは使え
- 新規UIコンポーネントや UIテストは kz-shared-ui 内で Storybook を使って行え
- task-cooker-web に直接コンポーネントを書く前に kz-shared-ui に共通化できないか検討しろ

---

## ドメインモデル

CLI の `src/domain/types.ts` を読み取って Web に適用する。

### ステータス（CLI 定義が正）

| 値    | 意味               | 色                |
| ----- | ------------------ | ----------------- |
| order | 未着手（注文済み） | スレートブルー    |
| prep  | 仕込み中           | アンバー/イエロー |
| cook  | 調理中             | オレンジ/レッド   |
| serve | 提供済み           | アンバー          |

**statusは業務状態のみ。アーカイブはstatusに混ぜない（→ deletedAtで管理）。**

### 優先順位

urgent/high/medium/low の4段階。色なし。UIでは方向アイコン（↑→↓）+ aria-label で表現。

### ID 戦略

Firestore doc ID（UUID）+ displayId（表示用連番 #1, #2...）の二重構造。
displayId はクライアント側トランザクションで `projects/{projectId}/counters/task` から採番（プロジェクトスコープ）。

---

## Firestore スキーマ

個人=1人チーム。Team モデルを MVP から導入。
詳細は `docs/task-cooker-web/tck-web-spec.md` を参照。

```
teams/{teamId}
  name, type, ownerId, memberIds, createdAt, updatedAt

projects/{projectId}
  slug, teamId, name, overview, status, ownerId, memberIds,
  createdAt, updatedAt

  tasks/{taskId}
    displayId, projectRef, teamId, title, description,
    status, priority, assigneeId, dueDate, linkedTaskIds,
    position, deletedAt, createdAt, updatedAt

    tasks/{taskId}/comments/{commentId}
      author ("user" | "claude" | "codex"), authorId, authorName, body, createdAt

  activities/{activityId}
    type, teamId?, projectId?, userId, userName, text, createdAt

  counters/{counterName}
    current                      # displayId 採番用（プロジェクトスコープ）

mixes/{mixId}                    # MVP外
  projectRef, authorId, author, title, status, isPublic,
  lastActivityAt, createdAt, updatedAt
```

セキュリティルール: memberIds ベースのアクセス制御。

---

## Firebase

既存プロジェクトを流用。**エミュレーターを使え。本番に触れるな。**

```bash
cd apps/task-cooker-web
firebase emulators:start
```

---

## 確定した設計判断（AIによる変更禁止）

**以下は管理人が確定した設計判断である。AIがセッションをまたいで覆すことを禁止する。**
**変更には管理人の明示的承認が必須。**

| #   | 項目                     | 結論                                                                   | 根拠                                                                                                            |
| --- | ------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | useFirestoreSubscription | **現状維持**。エラーハンドリングと所有権の明文化のみ                   | 動いているものを触るリスク。ゲーミフィ時にFunctions側で吸収                                                     |
| 2   | XP計算                   | **クライアント表示 + Cloud Functions書き込み**                         | serve時にtasks+users+contributions+streakの複数ドキュメント書き込みが必要。クライアント側トランザクションは地雷 |
| 3   | タスクアーカイブ         | **deletedAt**                                                          | statusに混ぜない。order/prep/cook/serveは業務状態、アーカイブはライフサイクル管理。軸が違う                     |
| 4   | テーマ                   | **4テーマ**: tavern-dark / tavern-light / generic-dark / generic-light | 開発途上の整合性確認のためgenericも残す                                                                         |
| 5   | E2E                      | **ログイン済み前提**で開始                                             | OAuth再現は外部依存重い                                                                                         |
| 6   | Storybook                | **酒場テーマの少し前**に導入                                           | ベースラインを先に作る                                                                                          |
| 7   | カバレッジ               | **傾斜つき80%**                                                        | service/api層90%, hooks80%, components70%, pages60%                                                             |
| 8   | staging                  | **Firebaseプロジェクト分離** + **service/api層のDB非依存化**           | 将来のPostgreSQL/SQLite差し替えに備える                                                                         |
| 9   | ドメイン                 | **Vercelサブドメイン**で開始                                           | コスト最小。base url差し替えでカスタム移行可能                                                                  |
| 10  | フォント                 | **IM Fell English SC + Instrument Sans**                               | SILライセンス確認済み。日本語はNoto Sans JP等で共存                                                             |
| 11  | 空状態イラスト           | **チャッピーが描いたイラスト**                                         | 既存資産                                                                                                        |
| 12  | XP初回serve制限          | **servedOnce** or **オンボーディングタスク完了で1served**              | 実装複雑度とUXのバランス                                                                                        |
| 13  | 草グラフ既存データ       | **既存Activityログからバックフィル**                                   | 空っぽはさみしい                                                                                                |
| 14  | レベル公開性             | **ユーザーに委譲**（設定で選択）                                       | 個人の自由                                                                                                      |
| 15  | オプティミスティック更新 | **保留**                                                               | 管理人が未検討。後日議論                                                                                        |

---

## アーキテクチャ方針: service層

### 原則

- 「クライアントはダム、サーバーはスマート」
- 将来、FirebaseからPostgreSQL/SQLiteへの差し替えを可能にする
- CLIとWebが同じapi層を共有する構成を目指す

### Phase 5A（現在）: 薄いservice層の仕込み

- `src/services/` ディレクトリを作成
- taskService, projectService, activityService, commentService, authService
- 中身は既存のapi/\*.tsをラップ（実装はFirestoreのまま）
- hooks/componentsのimport先をservicesに向ける
- TanStack QueryのqueryFn/mutationFnがserviceを呼ぶ形にする

### Phase 9: 本格分離

- service層をapiパッケージとしてmonorepoに切り出す
- CLI側リファクタ解禁、共通api層に合流
- DB差し替え可能な設計の完成

---

## 実装フェーズ

### Phase 0〜4: MVP（完了）

Phase 0〜4は完了。詳細は git log 参照。

- Phase 0: domain層の同期
- Phase 1: 認証 + レイアウト
- Phase 2: プロジェクトCRUD
- Phase 3: タスクCRUD（リスト・カンバン・DnD・コメント）
- Phase 4: ダークモード・レスポンシブ・a11y

MVP成果: 17ファイル73テスト全パス、カバレッジ66.80%

### Phase 5A: 出荷阻害の解消

- a11y監査（#37）を作業と並行して進行
- service層の薄い仕込み
- CI/CDは現状維持（ローカルチェックで品質保証）

### Phase 5B: テスト基盤の底上げ

- テスト戦略ドキュメント作成（何を守るかの基準）
- P0テスト追加（service層, CreateTaskDialog, KanbanBoard）
- カバレッジ計測環境整備（`vitest --coverage`）
- バンドルサイズ計測（vite-plugin-visualizer）

### Phase 5C: staging準備

- Firebaseプロジェクト分離（dev/prod）
- CI Prettier不一致の原因調査・修正（`npm install` での検証）
- Vercel Preview設定
- CI/CD必須チェック確立
- release-checklist.md作成
- Functions環境はエミュレーター前提。prod切り替えはPhase 8に先送り

### Phase 5D: Soft Launch

- まず管理人自身が実使用。テスターは集まり次第追加
- 実データでの動作確認
- i18nべた書き外出し（管理人がUI表示ラベルを一括チェック・修正するため）

### Phase 6: Storybook + 酒場テーマ

- Storybook導入（ベースライン作成）
- 4テーマのCSS変数切替
- 酒場ビジュアル要素 + 酒場コピー（文言定義ファイル）

### Phase 7: ゲーミフィケーション

- Cloud Functionsをエミュレーターで開発・テスト完結
- users ドキュメント拡張 + Firestoreルール
- XP / レベル / ストリーク（純粋関数をlibs/に閉じ込める）
- 草グラフ接続 + 既存データバックフィル
- 実績バッジ + Settingsにゲーミフィ設定

### Phase 8: デプロイ本格化

- Functions dev/prod切り替えの解決（ゼロから調査）
- Open Beta + モニタリング導入
- Playwright E2E（ログイン済み前提）
- 正式リリース

### Phase 9: api層本格分離 + 追加機能

- service層をapiパッケージに昇格
- CLI側リファクタ解禁（Web側api層完成後）
- DB差し替え可能な設計の完成
- Tier 2/3 機能の選択的実装

### やらないこと（後日）

Mix UI, Markdown エディタ, サブタスク,
全文検索, テーブルビュー

> **注記**: アクティビティログは MVP に含む（プランファイルで決定済み）。
> **注記**: CLI ↔ Web 同期は Phase 9 の api層共通化で自然に解決する。

---

## 設計原則（厳守）

コーディング規約の詳細は CODINGRULE.md を参照。ここではプロジェクト固有の原則のみ記載。

1. **CLI の domain が正**: 迷ったら `apps/task-cooker-cli/src/domain/`
2. **既存コード尊重**: 壊すな、理解してから着手
3. **エミュレーター限定**: 本番に触れるな
4. **リアルタイム**: `onSnapshot` を使え
5. **確定判断の尊重**: 「確定した設計判断」セクションをAIが覆すことを禁止。変更は管理人の明示的承認が必須

---

## 役割分担

| 役割     | 担当           | 範囲                           |
| -------- | -------------- | ------------------------------ |
| 実装     | Code + Codex   | issue単位で振り分け            |
| レビュー | 人間（管理人） | 全PRのレビューゲート           |
| 設計判断 | 人間           | 確定判断の変更は管理人承認必須 |

---

## レビュー管理ルール

1. **確定した設計判断をCLAUDE.mdで管理** — AIがこれらを覆す場合は管理人の明示的承認が必須
2. **issueに判断の根拠を書く** — 「なぜこの方式か」を必ず記載
3. **セッション開始時**: CLAUDE.mdを必ず読む。引き継ぎファイル(`docs/handoff/`)があれば読む
4. **Ctrl+R禁止** — ドキュメントレビュー事件の教訓
5. **plan → chat → do フロー** — planの後、実装前にchatモードで管理人の確認を取る

---

## 引き継ぎファイル（agent間連携）

`docs/handoff/` にフェーズごとの進捗ファイルを置く。Code / Codex / 人間の全員が読み書きする。

### 目的

- agent間でフェーズの進捗状態を共有する
- issueがない作業（設定変更・ドキュメント更新等）も拾う
- 人間サイドの作業もコメントできる

### ルール

- **フェーズ開始時**: `docs/handoff/phase-Xx.md` を作成
- **作業着手時**: 該当タスクのステータスを更新（担当者・issue番号があれば記載）
- **作業完了時**: serve に移動
- **コミット時**: 引き継ぎファイルの更新を作業コミットに含める（別コミットにしない）
- **セッション開始時**: 該当フェーズの引き継ぎファイルを必ず読む

### 作業規模による使い分け

| 作業規模                           | ルール                                                               |
| ---------------------------------- | -------------------------------------------------------------------- |
| 機能追加・バグ修正・リファクタ     | issueを立てる → アサイン → 引き継ぎファイルに記録                    |
| 設定変更・ドキュメント更新・小修正 | コミットメッセージで完結。引き継ぎファイルには影響がある場合のみ記録 |

### フォーマット

ドメインのステータスに合わせる。

```markdown
# Phase XY: タイトル

## order (未着手)

- [ ] 作業内容 (担当, #issue番号)

## prep (仕込み中)

- [ ] 作業内容 (担当)

## cook (調理中)

- [ ] 作業内容 (担当, #issue番号)

## serve (提供済み)

- [x] 作業内容 (#issue番号)

## 次フェーズへの申し送り

- 申し送り事項

## メモ

- 引き継ぎ事項、注意点、ハマりポイント等
```

---

## UIデザイン方針

料理メタファーを視覚的に表現するが、やりすぎない。
frontend-design スキルの原則に従い、AI スロップを避ける。
`docs/task-cooker-web/design-system.md` と `docs/task-cooker-web/color-system.md` も参照。

- ダークモード必須（4テーマ: tavern-dark / tavern-light / generic-dark / generic-light）
- 日本語対応（Noto Sans JP ベース）
- 酒場テーマ: IM Fell English SC（見出し）+ Instrument Sans（本文）
- FontAwesome アイコン
- prefers-reduced-motion 対応

---

## コマンド

```bash
cd apps/task-cooker-web
pnpm dev                 # Vite dev server
pnpm build               # ビルド
pnpm test                # Vitest
pnpm lint                # ESLint
pnpm emulators           # Firebase エミュレーター
```

---

## 作業ログルール

全スキルは作業の節目で nanj-brainstorm スキルを使いなんJスレに書き込め。
`.claude/nanJ/` に保存。1セッション1スレ。治安レベル通常。

| スキル          | 名前欄                      |
| --------------- | --------------------------- |
| Claude Code本体 | Claude Code◆現場作業員      |
| code-reviewer   | レビュー◆お前のPRは通さない |
| test-generator  | テスト◆全部落としてから帰る |
| project-manager | PM◆ガントチャートの亡霊     |
| quality-gate    | 品質◆FAIL以外知らん         |

書き込むタイミング: フェーズ開始/完了、レビュー結果、テスト結果、品質判定、ハマり、重大な判断。スキル間の意見相違もスレ内で表現してよい。

---

## 禁止事項

- `apps/task-cooker-cli/` を変更するな（Phase 9まで解禁しない）
- Vercel デプロイするな
- 本番 Firebase に触れるな
- 確定した設計判断を管理人の承認なく覆すな
