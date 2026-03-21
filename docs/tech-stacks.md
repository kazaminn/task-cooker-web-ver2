# Technology Stacks

last-updated: 2026-03-21

---

## Core Framework

- **React 19** — UI ライブラリ
- **TypeScript** — 型安全性
- **Vite** — ビルドツール

## State Management

- **TanStack Query** — サーバー状態（Firestore データ取得・キャッシュ・onSnapshot 統合）
- **Zustand** — クライアント状態（selectedView, filters, theme, モーダル開閉）

## Routing

- **React Router v7** — クライアントサイドルーティング（`react-router` パッケージ）

## Forms

- **React Hook Form** — フォーム状態管理
- **Zod** — スキーマバリデーション + 型推論

## Styling

- **Tailwind CSS v4** — ユーティリティファースト CSS
- **tailwind-variants** — バリアント管理（tv 関数）

## UI & Accessibility

- **react-aria-components** — アクセシブルな unstyled コンポーネント基盤
- **FontAwesome** — アイコン
- **@uiw/react-md-editor** — Markdown エディタ（MVP ではプレーンテキスト、将来用に残す）

## Development & Testing

- **Vitest** — ユニット/統合テスト ✅ MVP
- **React Testing Library** — コンポーネントテスト ✅ MVP
- **Storybook** — コンポーネントカタログ（MVP 後）
- **Chromatic** — ビジュアルリグレッション（MVP 後）
- **Playwright** — E2E テスト（MVP 後）

## Code Quality

- **ESLint** — リンター
- **Prettier** — コードフォーマッター
- **Husky + lint-staged** — Git フック

## Backend

- **Firebase Auth** — Google OAuth 認証
- **Cloud Firestore** — データベース（リアルタイム onSnapshot）
- [Future] Firebase Storage — ファイル添付
- [Future] Algolia — 全文検索
