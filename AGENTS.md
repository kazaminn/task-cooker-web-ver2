# AGENTS.md — TaskCooker Web 指示書

## お前は誰か

TaskCooker Web の実装担当。ユーザー（かざみん）の指示に従ってコードを書く。
判断が必要な場面では**止まれ**。自己判断禁止。

## プロジェクト概要

料理メタファーのタスク管理 + ノート管理 Web アプリ。
「かざみんの酒場」がテーマ。a11y ファースト。

- **技術スタック**: docs/tech-stacks.md を読め
- **データモデル**: docs/data-models.md
- **ページ構成**: docs/page-anatomy.md
- **ルーティング**: docs/routing.md
- **ワークフロー**: docs/agent-workflow.md を読め

## 現在のフェーズ: Phase 6（品質固め + 酒場テーマ）

### やること

1. 酒場テーマ CSS 適用 → docs/tavern-theme.md を先に読め
2. データモデル変更 → docs/data-models.md を先に読め
3. テスト追加 → docs/testing-requirements.md を先に読め
4. a11y 最終チェック（#37）
5. Playwright + Storybook + Chromatic 導入

### やるな

@.codex/rules/phase-constraints.md を読め

## ルール

- **コーディング規約**: @CODINGRULE.md + @.codex/rules/coding-standards.md
- **テスト**: @.codex/rules/testing.md
- **a11y**: @.codex/rules/a11y.md
- **テーマ**: @.codex/rules/tavern-theme.md
- **Firebase**: @.codex/rules/firebase-boundary.md
- **ブランチ/PR**: @CONTRIBUTING.md + @.codex/rules/branch-workflow.md
- **レビュー**: @docs/review-checklist.md

## Codex 資産

- `.claude/` が正。更新はまず `.claude/` に入れる
- `.codex/` は Codex 用ミラー。必要なものだけ同期する
- `rules/` は参照用の正規ミラー
- `skills/` は Codex で再利用価値があるものだけ残す
- `agents/` は持たない。Codex の標準機能で置き換える

## ディレクトリ構造

```
src/
├── features/           ← 機能ごとにコロケーション
│   ├── auth/           ←   pages/, components/, hooks/
│   ├── dashboard/
│   ├── projects/
│   ├── tasks/
│   ├── notes/          ← 新規追加（v1 では空ページ + 型定義のみ）
│   ├── teams/
│   ├── profile/
│   └── settings/
├── ui/                 ← 共通 UI（react-aria ベース）
│   ├── components/
│   ├── layouts/
│   └── index.css       ← デザイントークン（@theme）
├── api/                ← 共通 API（auth, storage インターフェース）
├── libs/               ← ユーティリティ（Firebase 以外）
└── types/              ← 型定義集約
```

- 共通の API（auth, storage）は `src/api/`
- 機能固有の API（tasks, projects, notes）は `src/features/{feature}/api/`
- 新規ファイルは既存構造に合わせろ

## 作業の進め方

1. **docs/ を先に読め**。読まずに実装を始めるな
2. 設定ファイル（tsconfig, eslint, commitlint 等）を先に読め
3. 既存のディレクトリ構造を `ls` で確認してから新規ファイルを作れ
4. 判断が必要なら止まれ。ユーザーに聞け
5. PR 単位で作業。1PR = 1機能 + テスト
6. main への直接 push 禁止。ブランチを切って PR で提出
7. コミットフォーマット: @CONTRIBUTING.md

## ドキュメントの優先順位

矛盾がある場合の優先順位（上が勝つ）:

1. ユーザーの直接指示
2. `.claude/` 配下
3. `AGENTS.md` + `.codex/` 配下
4. `docs/` 配下
5. コードベースの既存実装
