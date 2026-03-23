# Phase 5B: テスト基盤の底上げ

開始: 2026-03-23
status: cook

## order (未着手)

- [ ] P0テスト: api/projects.ts — CRUD + subscribe
- [ ] P0テスト: KanbanBoard — DnD でのステータス遷移
- [ ] P0テスト: CreateTaskDialog — バリデーション、送信、リセット/close、エラー表示
- [ ] カバレッジ計測環境整備 (`vitest --coverage` の設定追加)

## prep (仕込み中)

（なし）

## cook (調理中)

（なし）

## serve (提供済み)

- [x] テスト戦略ドキュメント v2 作成 (Code + Codex レビュー, #49)
- [x] バンドルサイズ計測 — rollup-plugin-visualizer 導入済み (管理人)
- [x] TaskListView ビルドエラー修正 — filter(Boolean) の型ガード追加 (Code)
- [x] GitHub Issues連携用フィールド追加 — Task.githubIssueNumber/githubRepo, Project.githubRepo (Code, #50)

## 前フェーズ (5A) からの引き継ぎ

- service層導入済み (PR#48)。service層はre-exportのみなのでテスト不要。api/\*.tsをテストする
- subscribeTasks のAPI変更あり（PR#46で unsafe collection queries を除去）
- CI/CDは現状維持（ローカルチェックで品質保証）

## メモ

- 傾斜つきカバレッジ目標（v2修正済み）: api 80-85%, hooks 75-80%, components 60-70%, pages 50-60%, libs/types 90%
- service層(re-export)はカバレッジ対象外
- displayId採番はapi/tasks.tsで守る。CreateTaskDialogの責務ではない
- モック戦略はレイヤー別推奨デフォルト（詳細は docs/testing-strategy.md）
- NVDAを使う日はa11y監査に集中、それ以外の日にテスト作業
- バンドルサイズ: JS 1,534KB (gzip 461KB) — 500KB超えチャンクあり。code-splitを検討
