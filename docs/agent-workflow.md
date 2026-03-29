# エージェントワークフロー

TaskCooker Web で AI エージェントが作業する際の標準フロー。
`.claude/` が正本であり、Codex 側は必要な内容だけ `.codex/` に同期する。

---

## 共通ルール

1. ブランチを切る
2. `docs/` とルールを先に読む
3. 既存構造を確認してから実装する
4. 1PR = 1機能 + テスト
5. main への直接 push は禁止

---

## Claude Code Workflow

### 実装フロー

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

### テストフロー

| 種別           | 生成              | 実行               |
| -------------- | ----------------- | ------------------ |
| ユニットテスト | `@test-writer`    | `pnpm test`        |
| E2E テスト     | `/playwright-gen` | `@e2e-runner`      |
| a11y テスト    | `/a11y-audit`     | `@a11y-checker`    |
| カバレッジ     | —                 | `/coverage-report` |

### 品質チェックフロー

1. `@simplify-check` で軽量判定
2. 必要なら `/simplify`
3. `@code-reviewer` で規約レビュー
4. `/codex-review` で第三者レビュー

### Claude 用スキル

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
| `/simplify`           | opus   | コード品質改善               |

### Claude 用エージェント

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

---

## Codex Workflow

### 実装フロー

1. ブランチを切る（`.codex/rules/branch-workflow.md` 参照）
2. 必要なら `.codex/skills/component-scaffold/SKILL.md` を参照して雛形を作る
3. 実装
4. `docs/review-checklist.md` と `.codex/rules/` を基準にセルフチェックする
5. 必要なら `.codex/skills/coverage-report/SKILL.md` を参照してカバレッジ確認
6. 必要なら `.codex/skills/storybook-gen/SKILL.md` を参照して stories を追加
7. 必要なら `.codex/skills/handoff-writer/SKILL.md` を参照して handoff を更新
8. コミット
9. PR 作成 → ユーザーマージ

### テストフロー

| 種別           | 参照スキル                                      | 実行コマンド                     |
| -------------- | ----------------------------------------------- | -------------------------------- |
| ユニットテスト | 必要に応じて `.codex/skills/component-scaffold` | `pnpm test` / `pnpm exec vitest` |
| E2E テスト     | `.codex/skills/playwright-gen/SKILL.md`         | `pnpm exec playwright test`      |
| a11y テスト    | `.codex/skills/a11y-audit/SKILL.md`             | vitest / axe ベースで確認        |
| カバレッジ     | `.codex/skills/coverage-report/SKILL.md`        | `pnpm vitest --coverage`         |

### 品質チェックフロー

1. `docs/review-checklist.md` を基準に対象ファイルを通読する
2. `.codex/rules/coding-standards.md` を基準に規約違反を確認する
3. `.codex/rules/testing.md` を基準にテスト不足を確認する
4. 必要ならユーザーにレビュー依頼する

### Codex で参照する主な資産

| パス                                        | 用途                           |
| ------------------------------------------- | ------------------------------ |
| `.codex/rules/`                             | Codex 用ルールミラー           |
| `.codex/skills/component-scaffold/SKILL.md` | 雛形作成                       |
| `.codex/skills/commit-msg/SKILL.md`         | コミットメッセージ生成         |
| `.codex/skills/coverage-report/SKILL.md`    | カバレッジ確認                 |
| `.codex/skills/handoff-writer/SKILL.md`     | handoff 更新                   |
| `.codex/skills/playwright-gen/SKILL.md`     | E2E スケルトン生成             |
| `.codex/skills/storybook-gen/SKILL.md`      | Storybook stories 作成         |
| `.codex/skills/a11y-audit/SKILL.md`         | a11y 監査                      |
| `.codex/skills/tailwindcss-v4/SKILL.md`     | Tailwind v4 実装指針           |
| `.codex/skills/project-manager/SKILL.md`    | 仕様整理・ストーリーマッピング |

---

## 同期ルール

- `.claude/` が正本
- `.codex/` は Codex 用ミラー
- `.codex/` の再生成は `scripts/sync-codex.sh` を使う
