# Phase 6A: テーマ基盤 — tavern-light / tavern-dark 切替システム

開始: 2026-03-29
status: cook

## order (未着手)

- [ ] PR2: UI文字列辞書 + 酒場コピー + コンポーネント装飾
- [ ] PR3: P0 テスト追加（カバレッジ引き上げ）
- [ ] PR4: P1 テスト追加
- [ ] PR5: P2 テスト + CI カバレッジゲート
- [ ] PR6: Storybook 導入 + 主要コンポーネント Stories
- [ ] PR7: Playwright E2E 導入

## prep (仕込み中)

（なし）

## cook (調理中)

- [ ] PR1 レビュー待ち: テーマ基盤 (#53) (Code)

## serve (提供済み)

- [x] Phase 6 実装計画策定 (Code)
- [x] tavern-light / tavern-dark CSS 変数基盤 (Code)
- [x] 装飾 CSS クラス 5 種定義: wood-grain, parchment, ledger, rivet, iron-frame (Code)
- [x] ember pulse アニメーション + prefers-reduced-motion ガード (Code)
- [x] uiStore Theme 型移行 + localStorage キー `tck-theme` (Code)
- [x] index.html FOUC 防止スクリプト更新 (Code)
- [x] types.d.ts テーマ型統一 (Code)
- [x] Firebase API テストをローカル vitest から除外 (Code)

## 前フェーズ (5D) からの引き継ぎ

- Vercel 自動デプロイ稼働中（main マージ → デプロイ）
- i18n べた書き外出しは Phase 6 PR2 で対応予定
- テスターは Opus / Haiku / Sonnet の 3 名
- ユーザー実使用による不具合洗い出し中

## メモ

- カバレッジ: Statements 85.13%, Branches 67.91%, Functions 76.05%, Lines 85.6%
- テスト: 全 98 件パス（18 ファイル）
- ステータス色はテーマ不変（theme-invariant）を維持
- `useDarkTheme.ts` の `isDark` は現在未使用だが、PR2 の装飾適用で使用予定のため残置
- PR2 以降は PR1 マージ後に着手可能（PR2 / PR3 / PR7 は並行可能）
