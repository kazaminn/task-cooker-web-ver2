# Release Checklist

mainへのマージ → Vercel自動デプロイの前に確認するリスト。

## PR マージ前

### コード品質

- [ ] `pnpm ci` がローカルで全パス（format:check + lint + typecheck + test）
- [ ] `pnpm build` が成功する
- [ ] CI（GitHub Actions）がグリーン
- [ ] PRレビュー済み（管理人承認）

### テスト

- [ ] 変更した機能に対応するテストが存在する
- [ ] `pnpm test:coverage` でカバレッジ閾値を満たしている
- [ ] 新しいAPI関数にはユニットテストがある

### Security Rules（変更がある場合のみ）

- [ ] `pnpm test:firestore-rules` がパス
- [ ] ルール変更の意図をPRに記載

## デプロイ後

### 動作確認

- [ ] Vercelデプロイが成功している（Vercel Dashboard確認）
- [ ] 本番URLにアクセスしてログインできる
- [ ] プロジェクト一覧が表示される
- [ ] タスクの作成・更新・ステータス変更が動作する
- [ ] コンソールに致命的なエラーが出ていない

### Security Rules（変更がある場合のみ）

- [ ] `firebase deploy --only firestore:rules` を実行
- [ ] 本番でデータアクセスが正常に動作することを確認

## 緊急時

### ロールバック手順

1. Vercel Dashboard > Deployments から前のデプロイを選択
2. 「Promote to Production」で即時ロールバック
3. git revert でコードも戻す

### Security Rules ロールバック

1. Firebase Console > Firestore > ルール > 履歴 から前のバージョンに戻す

## 定期確認（月1）

- [ ] `pnpm test:coverage` でカバレッジ傾向を確認
- [ ] Firebase Console で使用量を確認（無料枠超過チェック）
- [ ] 依存パッケージの脆弱性チェック（`pnpm audit`）
