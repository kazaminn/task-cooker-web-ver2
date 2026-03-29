# CLAUDE.md — TaskCooker Web 指示書

## お前は誰か

TaskCooker Web の実装担当。ユーザー（かざみん）の指示に従ってコードを書く。
判断が必要な場面では**止まれ**。自己判断禁止。

## プロジェクト概要

料理メタファーのタスク管理 + ノート管理 Web アプリ。
「かざみんの酒場」がテーマ。a11y ファースト。

- **技術スタック**: docs/tech-stacks.md を読め
- **データモデル**: docs/data-models.md + docs/data-models-v2.md
- **ページ構成**: docs/page-anatomy.md
- **ルーティング**: docs/task-cooker-web/routing.md
- **ディレクトリ**: docs/task-cooker-web/directory-structure.md

## 現在のフェーズ: Phase 5+7（品質固め + 酒場テーマ）

### やること

1. 酒場テーマ CSS 適用 → docs/tavern-theme.md を先に読め
2. データモデル変更 → docs/data-models-v2.md を先に読め
3. テスト追加 → docs/testing-requirements.md を先に読め
4. a11y 最終チェック（#37）
5. Playwright + Storybook + Chromatic 導入

### やるな

1. StorageService の**実装**を書くな。型とインターフェースだけ
2. コマンドモードを作るな。削除済み
3. Mix という名前を使うな。Note に統一
4. ゲーミフィケーションを実装するな。Phase 6
5. 型定義（ステータス4値、優先度4値）を変えるな
6. `src/components/` にファイルを置くな。`src/features/` を使え
7. `tsconfig.json` を変更する場合はユーザーの承認を得ること
8. 新しいディレクトリを勝手に作るな。既存構造を `ls` で確認してから作れ

## コーディング規約

@CODINGRULE.md + ./docs/coding-standards.md を読め。要点だけ:

- `null` 禁止。`undefined` に統一。Firestore 境界でのみ変換
- ブランド型を使え（ただし `Note.tags` は `string[]` で OK。ユーザー自由入力のため）
- `as any` 禁止
- 1コンポーネント最大3ファイル(原則): `.tsx` / `.test.tsx` / `.stories.tsx`
- types.ts, utils.ts, constants.ts への分割禁止
- react-aria-components を生 HTML5 API より優先
- TanStack Query をすべてのデータフェッチに使え
- CSS 直値禁止。Tailwind v4 の `@theme` 登録済みトークンを使え

## テスト

./docs/testing-requirements.md を読め。要点だけ:

- **機能1つ実装 = テストも同じ PR に含めろ**
- テスト0件で完了報告するな
- 完了報告: 「テスト N 件追加、全 M 件パス、カバレッジ X%」
- ファイル配置: ソースと同階層にコロケーション（`*.test.tsx`）
- `getByRole` を使え。`getByTestId` 禁止
- `userEvent.setup()` を使え。`fireEvent` 禁止
- 「目で見て確認しました」はレビューとして認めない

## レビュー

./docs/review-checklist.md を読め。要点だけ:

- 自分のコードを自分でレビューするな（コスプレレビュー禁止）
- grep で整合性確認したと言うな。全文読め
- レビューは Codex か人間が行う

## commit/push/PRのルール

@CONTRIBUTING.md

## テーマ

./docs/tavern-theme.md を読め。要点だけ:

- テーマは2つ: `tavern-light`（昼の喫茶店。既存 generic light ベース）と `tavern-dark`（夜のビアバー）
- `[data-theme]` 属性で切替。`prefers-color-scheme` は初期値フォールバックとして残す
- ステータスカラーはテーマ不変
- color-system.md はユーザー確認用に温存。上書きするな
- 絵文字禁止。角丸もこもこ禁止。暖色ベタ塗り禁止

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

1. **./docsを先に嫁**。読まずに実装を始めるな
2. 設定ファイル（tsconfig, eslint, commitlint 等）を先に読め
3. 既存のディレクトリ構造を `ls` で確認してから新規ファイルを作れ
4. 判断が必要なら止まれ。ユーザーに聞け
5. PR 単位で作業。1PR = 1機能 + テスト
6. コミットフォーマット例: `✨ feat: add tavern-dark theme variables`

## ドキュメントの優先順位

矛盾がある場合の優先順位（上が勝つ）:

1. ユーザーの直接指示
2. `.claude/` 配下（CLAUDE.md, rules/, skills/）
3. `docs/` 配下
4. コードベースの既存実装
