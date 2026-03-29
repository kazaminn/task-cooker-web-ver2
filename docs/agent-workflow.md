# エージェントワークフロー

AI エージェント（Claude Code / Codex）が TaskCooker Web で作業する際の標準フロー。

## 実装フロー（標準）

1. ブランチを切る（`.claude/rules/branch-workflow.md` 参照）
2. `/component-scaffold` で雛形生成（新規コンポーネント時）
3. 実装
4. `/simplify` で品質チェック
5. `/commit-msg` でコミットメッセージ生成
6. `/coverage-report` でカバレッジ確認
7. `/storybook-gen` で stories 作成
8. `/codex-review` で Codex レビュー実行
9. `@code-reviewer` で Claude レビュー
10. `/handoff-writer` でフェーズ引継ぎ更新
11. PR 作成（`@pr-summarizer` が本文生成）→ ユーザーマージ

## テストフロー

| 種別           | 生成              | 実行               |
| -------------- | ----------------- | ------------------ |
| ユニットテスト | `@test-writer`    | `pnpm test`        |
| E2E テスト     | `/playwright-gen` | `@e2e-runner`      |
| a11y テスト    | `/a11y-audit`     | `@a11y-checker`    |
| カバレッジ     | —                 | `/coverage-report` |

## 品質チェックフロー

1. `@simplify-check`（haiku、軽量判定 — /simplify が必要か判断）
2. 必要なら `/simplify`（opus、実修正）
3. `@code-reviewer`（sonnet、プロジェクト規約レビュー）
4. `/codex-review`（Codex、第三者レビュー）

## スキル一覧

| スキル                | モデル | 用途                         |
| --------------------- | ------ | ---------------------------- |
| `/project-manager`    | sonnet | ユーザーストーリーマッピング |
| `/a11y-audit`         | sonnet | アクセシビリティ監査         |
| `/commit-msg`         | haiku  | コミットメッセージ生成       |
| `/handoff-writer`     | sonnet | フェーズ引継ぎ文書生成       |
| `/storybook-gen`      | sonnet | stories 自動生成             |
| `/coverage-report`    | haiku  | カバレッジレポート生成       |
| `/component-scaffold` | haiku  | コンポーネント雛形生成       |
| `/playwright-gen`     | sonnet | E2E テストスケルトン生成     |
| `/codex-review`       | haiku  | Codex レビューコマンド生成   |
| `/simplify`           | opus   | コード品質改善（グローバル） |

## エージェント一覧

| エージェント      | モデル | 用途                 |
| ----------------- | ------ | -------------------- |
| `@explorer`       | haiku  | 高速コードベース探索 |
| `@code-reviewer`  | sonnet | 規約レビュー         |
| `@a11y-checker`   | sonnet | a11y 検証            |
| `@test-writer`    | sonnet | テスト作成           |
| `@docs-sync`      | haiku  | docs/ 整合性検証     |
| `@pr-summarizer`  | haiku  | PR 本文生成          |
| `@e2e-runner`     | haiku  | Playwright 実行      |
| `@simplify-check` | haiku  | 軽量品質判定         |
