# CLAUDE.md — TaskCooker Web 指示書

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

@.claude/rules/phase-constraints.md を読め

## ルール

- **コーディング規約**: @CODINGRULE.md + @.claude/rules/coding-standards.md
- **テスト**: @.claude/rules/testing.md
- **a11y**: @.claude/rules/a11y.md
- **テーマ**: @.claude/rules/tavern-theme.md
- **Firebase**: @.claude/rules/firebase-boundary.md
- **ブランチ/PR**: @.claude/rules/branch-workflow.md
- **レビュー**: @docs/review-checklist.md

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
6. コミットフォーマット: @CONTRIBUTING.md

## ドキュメントの優先順位

矛盾がある場合の優先順位（上が勝つ）:

1. ユーザーの直接指示
2. `.claude/` 配下（CLAUDE.md, rules/, skills/）
3. `docs/` 配下
4. コードベースの既存実装
