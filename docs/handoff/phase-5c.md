# Phase 5C: staging準備

開始: 2026-03-23
status: order

## order (未着手)

（なし）

## prep (仕込み中)

（なし）

## cook (調理中)

（なし）

## serve (提供済み)

- [x] CI Node.jsバージョン統一 — 24.13.0→22.22.0に修正（Code）
- [x] Vercelデプロイ設定 — vercel.json + ignoreCommand（doc変更スキップ）（Code + ユーザー）
- [x] seedスクリプト本番対応 — --prod モード、テストユーザー3名(Opus/Haiku/Sonnet)、ユーザー入りチーム（Code）
- [x] Firestore Security Rules本番デプロイ（ユーザー）
- [x] ビルド出力先修正 — vite.config.ts outDir を ./dist に明示（Code）
- [x] release-checklist.md作成（Code）
- [x] CI/CD必須チェック確立 — CI修正 + Vercel自動デプロイで完了
- [x] Firebaseプロジェクト分離 → Phase 8に先送り（Functions導入時に再検討）

## 前フェーズ (5B) からの引き継ぎ

- カバレッジ計測環境整備済み（傾斜つきthresholds設定済み）
- P0テスト追加済み（api/projects, KanbanBoard, CreateTaskDialog）
- CI Prettierの不一致はNode 24 vs 22のBabel差分が原因。Node 22.22.0に統一で解決

## メモ

- `@trivago/prettier-plugin-sort-imports` はBabel依存のためNode大版数で挙動が変わる
- vitest.setup.tsのimport順序がNode 24で異なる出力になっていた
- CIは手動disable中だった → Node統一後に再有効化が必要
