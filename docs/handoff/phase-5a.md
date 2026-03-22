# Phase 5A: 出荷阻害の解消

開始: 2026-03-22
status: cook

## order (未着手)

（なし）

## prep (仕込み中)

- [ ] a11y監査 (#37, 人間, 並行作業)

## cook (調理中)

- [ ] service層の薄い仕込み — PR#48 レビュー待ち (#47, Code)

## serve (提供済み)

- [x] Open issue封鎖 (#9, #19, #20, #22, #29, #34, #35, #36)
- [x] Post-MVP拡大計画 v3 策定
- [x] 引き継ぎファイル運用ルール策定
- [x] PR#46 マージ + rebase解決
- [x] Codexによるレビュー: Phase 5A→5Bの順序妥当性確認
- [x] CLAUDE.md 更新（CLAUDE_DRAFT.md → 本体反映）(Code + 管理人)
- [x] .claude/commands/ 整備 — /chat, /do コマンド作成 (Code)

## 次フェーズ (5B) への申し送り

- P0テスト追加: service層, CreateTaskDialog, KanbanBoard
- vitest --coverage の足場作り
- バンドルサイズ計測 (vite-plugin-visualizer)
- テスト戦略ドキュメント作成

## メモ

- CI/CDは現状維持（ローカルチェックで品質保証）。Prettier問題の調査は5Cに先送り
- subscribeTasks のAPI変更あり（PR#46で unsafe collection queries を除去）
