---
name: tailwindcss-v4
description: >
  Tailwind CSS v4 の正しい書き方ガイド。v4 は CSS-first に刷新され、
  tailwind.config.js を廃止、@theme / @utility / @variant 等の CSS ディレクティブで構成する。
  Tailwind を使うタスク（CSS スタイリング、デザイントークン設定、ダークモード、
  レスポンシブ、カスタムユーティリティ）を行う際に必ず参照すること。
  v3 の書き方（tailwind.config.js, @tailwind base, bg-opacity-*, flex-grow-* 等）を
  書こうとしたら即座にこのスキルを読め。
---

# Tailwind CSS v4 ガイド

> バージョン: v4.2（現行最新）  
> ソース: https://tailwindcss.com/docs  
> 最終確認: 2026-03-27  
> ブラウザ要件: Safari 16.4+ / Chrome 111+ / Firefox 128+

**このドキュメントの目的**: 人間が読んでも Codex が読んでも、v4 のコードを正しく書けるようにする。
公式ドキュメントの Core Concepts + Upgrade Guide を凝縮し、各項に公式 URL を付記した。
**迷ったら公式を読め。このガイドは公式の要約であり代替ではない。**

---

## 目次

1. [セットアップ](#1-セットアップ)
2. [v3 から消えたもの・変わったもの](#2-v3-から消えたもの変わったもの)
3. [デザイントークン: @theme](#3-デザイントークン-theme)
4. [ダークモード](#4-ダークモード)
5. [レスポンシブデザイン](#5-レスポンシブデザイン)
6. [状態バリアント](#6-状態バリアント)
7. [カスタムスタイルの追加](#7-カスタムスタイルの追加)
8. [ソースファイル検出](#8-ソースファイル検出)
9. [色](#9-色)
10. [プロジェクト構成例: Vite + React](#10-プロジェクト構成例-vite--react)
11. [コード生成前チェックリスト](#11-コード生成前チェックリスト)

---

## 1. セットアップ

📖 https://tailwindcss.com/docs/installation

### CSS のエントリーポイント

v4 ではこの 1 行だけ書く:

```css
@import 'tailwindcss';
```

この 1 行で theme / preflight(リセット) / utilities の 3 層がネイティブ `@layer` で読み込まれる。
v3 で使っていた `@tailwind base; @tailwind components; @tailwind utilities;` は廃止された。

### ビルドツール別の導入

**Vite（推奨）:**

```bash
pnpm add tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

PostCSS 設定ファイルは不要。Vite プラグインがすべて処理する。

**PostCSS:**

```bash
pnpm add tailwindcss @tailwindcss/postcss
```

```js
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

autoprefixer は不要（ベンダープレフィックスは内蔵）。
postcss-import も不要（`@import` は内蔵処理）。
postcss-nesting も不要（ネストは内蔵対応）。

**CLI:**

```bash
npx @tailwindcss/cli -i input.css -o output.css
```

パッケージ名が `tailwindcss` → `@tailwindcss/cli` に変わった。

---

## 2. v3 から消えたもの・変わったもの

📖 https://tailwindcss.com/docs/upgrade-guide

### tailwind.config.js は廃止

JavaScript の設定ファイルは v4 に存在しない。すべて CSS の `@theme` / `@plugin` / `@source` で書く。
`corePlugins`, `safelist`, `separator` オプションも廃止。safelist が必要な場合は `@source inline()` を使う。

### 削除されたユーティリティ → 代替

| 削除（v3）              | 代替（v4）                       |
| ----------------------- | -------------------------------- |
| `bg-opacity-*`          | `bg-black/50` （スラッシュ記法） |
| `text-opacity-*`        | `text-black/50`                  |
| `border-opacity-*`      | `border-black/50`                |
| `divide-opacity-*`      | `divide-black/50`                |
| `ring-opacity-*`        | `ring-black/50`                  |
| `placeholder-opacity-*` | `placeholder-black/50`           |
| `flex-shrink-*`         | `shrink-*`                       |
| `flex-grow-*`           | `grow-*`                         |
| `overflow-ellipsis`     | `text-ellipsis`                  |
| `decoration-slice`      | `box-decoration-slice`           |
| `decoration-clone`      | `box-decoration-clone`           |

### リネームされたユーティリティ

スケール名が整理された。**v3 で名前なし（bare）だったものに `-sm` が付き、元の `-sm` は `-xs` に繰り下がる**:

| v3                 | v4                                                    |
| ------------------ | ----------------------------------------------------- |
| `shadow-sm`        | `shadow-xs`                                           |
| `shadow`           | `shadow-sm`                                           |
| `drop-shadow-sm`   | `drop-shadow-xs`                                      |
| `drop-shadow`      | `drop-shadow-sm`                                      |
| `blur-sm`          | `blur-xs`                                             |
| `blur`             | `blur-sm`                                             |
| `backdrop-blur-sm` | `backdrop-blur-xs`                                    |
| `backdrop-blur`    | `backdrop-blur-sm`                                    |
| `rounded-sm`       | `rounded-xs`                                          |
| `rounded`          | `rounded-sm`                                          |
| `outline-none`     | `outline-hidden`（a11y 用の不可視アウトラインを保持） |
| `ring`             | `ring-3`（デフォルト幅が 3px → 1px に変更されたため） |

真に `outline-style: none` にしたい場合は新設の `outline-none` を使う。

### デフォルト値の変更

| 項目                    | v3         | v4                        |
| ----------------------- | ---------- | ------------------------- |
| `border` のデフォルト色 | `gray-200` | `currentColor`            |
| `ring` のデフォルト幅   | 3px        | 1px                       |
| `ring` のデフォルト色   | `blue-500` | `currentColor`            |
| プレースホルダーの色    | `gray-400` | 現在のテキスト色 50%      |
| ボタンのカーソル        | `pointer`  | `default`（ブラウザ標準） |

**border には色を明示せよ**: `<div class="border border-gray-200">` のように書く。

### CSS 変数の省略記法

```html
<!-- v3: 角括弧 -->
<div class="bg-[--brand-color]"></div>

<!-- v4: 丸括弧 -->
<div class="bg-(--brand-color)"></div>
```

### !important 修飾子の位置

```html
<!-- v3: 先頭（バリアントの後） -->
<div class="hover:!bg-red-500"></div>

<!-- v4: 末尾 -->
<div class="hover:bg-red-500!"></div>
```

v3 の書き方は互換性のため動くが非推奨。

### バリアントのスタック順序

v3 では右から左に適用されたが、v4 では**左から右**に適用される（CSS の記述順と一致）:

```html
<!-- v3 -->
<ul class="first:*:pt-0">
  <!-- v4 -->
  <ul class="*:first:pt-0"></ul>
</ul>
```

### hover バリアントの変更

v4 では `hover:` に `@media (hover: hover)` が追加された。
タッチデバイスではタップ時に hover が発動しなくなる。
以前の動作に戻す場合: `@custom-variant hover (&:hover);`

### @layer の意味変化

v4 ではネイティブ CSS の `@layer` を使っている。
v3 の `@layer utilities { .my-class { ... } }` は v4 では `@utility my-class { ... }` に書き換える。

### space-x/y と divide-x/y のセレクタ変更

v3: `:not([hidden]) ~ :not([hidden])` → v4: `:not(:last-child)`
方向が逆になる（margin-top → margin-bottom 等）。問題が出たら `flex` + `gap` への移行を推奨。

### hidden 属性の優先度

v4 では `hidden` 属性が `block` や `flex` 等の display クラスより優先される。
要素を表示したい場合は `hidden` 属性を外す。

---

## 3. デザイントークン: @theme

📖 https://tailwindcss.com/docs/theme

### 基本

```css
@import 'tailwindcss';

@theme {
  --color-brand: #316ff6;
  --font-display: 'Satoshi', sans-serif;
  --breakpoint-3xl: 120rem;
}
```

`@theme` 内で定義した CSS 変数はテーマ変数になり、対応するユーティリティクラスが自動生成される:

- `--color-brand` → `bg-brand`, `text-brand`, `border-brand` 等
- `--font-display` → `font-display`
- `--breakpoint-3xl` → `3xl:` バリアント

テーマ変数は通常の CSS 変数としても使える: `var(--color-brand)`

### @theme と :root の使い分け

- **@theme**: ユーティリティクラスを生成したいデザイントークン
- **:root**: ユーティリティに紐づけたくない普通の CSS 変数

### 名前空間一覧

| 名前空間           | 生成されるもの                                  |
| ------------------ | ----------------------------------------------- |
| `--color-*`        | bg-, text-, border- 等の色ユーティリティ        |
| `--font-*`         | font-family ユーティリティ                      |
| `--text-*`         | font-size ユーティリティ                        |
| `--font-weight-*`  | font-weight ユーティリティ                      |
| `--tracking-*`     | letter-spacing ユーティリティ                   |
| `--leading-*`      | line-height ユーティリティ                      |
| `--breakpoint-*`   | レスポンシブバリアント (sm:, md: 等)            |
| `--container-*`    | コンテナクエリバリアント + max-w ユーティリティ |
| `--spacing-*`      | padding, margin, gap, width, height 等          |
| `--radius-*`       | border-radius ユーティリティ                    |
| `--shadow-*`       | box-shadow ユーティリティ                       |
| `--inset-shadow-*` | inset box-shadow ユーティリティ                 |
| `--drop-shadow-*`  | drop-shadow フィルタユーティリティ              |
| `--blur-*`         | blur フィルタユーティリティ                     |
| `--perspective-*`  | perspective ユーティリティ                      |
| `--aspect-*`       | aspect-ratio ユーティリティ                     |
| `--ease-*`         | transition-timing-function ユーティリティ       |
| `--animate-*`      | animation ユーティリティ                        |

### デフォルトテーマの上書き

```css
@theme {
  /* 単一値の上書き */
  --color-gray-500: #6b7280;

  /* 名前空間全体をリセットしてカスタム値だけにする */
  --color-*: initial;
  --color-white: #fff;
  --color-brand: #316ff6;
}
```

---

## 4. ダークモード

📖 https://tailwindcss.com/docs/dark-mode

### 書き方

```html
<div class="bg-white dark:bg-gray-800">
  <p class="text-gray-900 dark:text-white">テキスト</p>
</div>
```

デフォルトでは `prefers-color-scheme: dark` メディアクエリで動作する。

### クラスベースのダークモード（手動切替）

ユーザーがスイッチで切り替える場合、CSS にこれを追加:

```css
@custom-variant dark (&:where(.dark *));
```

`<html class="dark">` のとき `dark:` バリアントが有効になる。

v3 の `darkMode: 'class'` 設定は廃止。上記の `@custom-variant` が代替。

### FOUC 対策（公式推奨パターン）

`<head>` 内、CSS より前に置く:

```html
<script>
  document.documentElement.classList.toggle(
    'dark',
    localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
</script>
```

---

## 5. レスポンシブデザイン

📖 https://tailwindcss.com/docs/responsive-design

### デフォルトのブレークポイント

| プレフィックス | 最小幅         | 想定デバイス   |
| -------------- | -------------- | -------------- |
| sm             | 40rem (640px)  | 大きめスマホ横 |
| md             | 48rem (768px)  | タブレット     |
| lg             | 64rem (1024px) | ノートPC       |
| xl             | 80rem (1280px) | デスクトップ   |
| 2xl            | 96rem (1536px) | 大画面         |

モバイルファースト: プレフィックスなし = 全幅。`sm:` = 40rem 以上。

### カスタムブレークポイント

```css
@theme {
  --breakpoint-*: initial; /* デフォルト全削除 */
  --breakpoint-tablet: 40rem;
  --breakpoint-laptop: 64rem;
  --breakpoint-desktop: 80rem;
}
```

### 任意の値

```html
<div class="max-[600px]:bg-sky-300 min-[320px]:text-center"></div>
```

### コンテナクエリ

```html
<div class="@container">
  <div class="flex flex-col @sm:flex-row">...</div>
</div>
```

---

## 6. 状態バリアント

📖 https://tailwindcss.com/docs/hover-focus-and-other-states

```html
<button
  class="bg-sky-500 hover:bg-sky-700 focus:outline-2 active:bg-sky-800 disabled:opacity-50"
></button>
```

バリアントのスタック（v4 では**左から右**に適用）:

```html
<button class="bg-sky-500 disabled:hover:bg-sky-500"></button>
```

よく使うバリアント: `hover:`, `focus:`, `focus-visible:`, `active:`, `disabled:`,
`first:`, `last:`, `odd:`, `even:`, `group-hover:`, `peer-checked:`,
`dark:`, `motion-reduce:`, `motion-safe:`, `print:`

v4 の新規バリアント: `inert:`, `nth-*:`, `in-*:`（group 不要版）, `open:`（popover 対応）

---

## 7. カスタムスタイルの追加

📖 https://tailwindcss.com/docs/adding-custom-styles

### カスタムユーティリティ: @utility

```css
@utility tab-4 {
  tab-size: 4;
}
```

これで `tab-4` が `hover:tab-4`, `lg:tab-4` 等のバリアント付きで使える。
複数プロパティを持つユーティリティ（コンポーネント級）も `@utility` で定義する:

```css
@utility btn {
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ButtonFace;
}
```

v3 の `@layer components { ... }` / `@layer utilities { ... }` は v4 では `@utility` に書き換える。

### カスタムバリアント: @custom-variant

```css
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

→ `theme-midnight:bg-black` のように使える。

### CSS 内でバリアントを適用: @variant

```css
.my-element {
  background: white;
  @variant dark {
    background: black;
  }
}
```

### @apply（既存ユーティリティの埋め込み）

```css
.legacy-class {
  @apply rounded-sm p-4 shadow-sm;
}
```

サードパーティ CSS の上書き等に使う。通常の開発では極力使わない。

### @reference（Vue/Svelte の scoped style 用）

```html
<style>
  @reference "../../app.css";
  h1 {
    @apply text-2xl font-bold;
  }
</style>
```

---

## 8. ソースファイル検出

📖 https://tailwindcss.com/docs/detecting-classes-in-source-files

v4 はソースファイルを自動検出する。`.gitignore` とバイナリファイルは自動除外。
v3 の `content: [...]` 設定は不要。

追加のソースを指定する場合:

```css
@source '../node_modules/@my-company/ui-lib';
```

**重要**: クラス名は完全な文字列として記述する。動的結合は検出されない:

```js
// ❌ 検出されない
const color = `bg-${colorName}-500`;

// ✅ 検出される
const colorClass = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
}[colorName];
```

---

## 9. 色

📖 https://tailwindcss.com/docs/colors

- デフォルトパレットは OKLCH 色空間で定義されている
- CSS 変数として参照可能: `var(--color-blue-500)`
- 不透明度はスラッシュ記法: `bg-blue-500/50`
- CSS 内での不透明度調整: `--alpha(var(--color-blue-500) / 50%)`
- カスタム色の追加: `@theme { --color-brand: #316ff6; }`

---

## 10. プロジェクト構成例: Vite + React

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm add tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/app.css */
@import 'tailwindcss';

/* 手動ダークモード切替を使う場合 */
@custom-variant dark (&:where(.dark *));

@theme {
  /* ここにプロジェクト固有のデザイントークンを定義 */
}
```

**不要なもの**: tailwind.config.js / postcss.config.js / autoprefixer / postcss-import / postcss-nesting

---

## 11. コード生成前チェックリスト

コードを書く前にこのリストを確認する。1 つでも該当したら修正する。

- [ ] `tailwind.config.js` を作ろうとしていないか？ → 不要。@theme を使う
- [ ] `@tailwind base/components/utilities` を書こうとしていないか？ → `@import "tailwindcss"` に置換
- [ ] `content: [...]` を設定しようとしていないか？ → 自動検出。必要なら @source
- [ ] `darkMode: 'class'` を設定しようとしていないか？ → `@custom-variant dark` に置換
- [ ] `bg-opacity-*` / `text-opacity-*` を使おうとしていないか？ → スラッシュ記法 `bg-black/50`
- [ ] `flex-grow-*` / `flex-shrink-*` を使おうとしていないか？ → `grow-*` / `shrink-*`
- [ ] `shadow-sm` は v4 で `shadow-xs` にリネームされた。意図した値か確認
- [ ] `rounded-sm` は v4 で `rounded-xs` にリネームされた。意図した値か確認
- [ ] `outline-none` は v4 で `outline-hidden` にリネームされた。意図したか確認
- [ ] `ring` は v4 で 1px。3px が必要なら `ring-3` を使う
- [ ] `border` に色を明示しているか？（v4 のデフォルトは currentColor）
- [ ] `@layer utilities { ... }` を書こうとしていないか？ → `@utility` に置換
- [ ] autoprefixer を追加しようとしていないか？ → 不要（内蔵）
- [ ] postcss-import を追加しようとしていないか？ → 不要（内蔵）
- [ ] CSS 変数の省略記法で角括弧 `[--var]` を使っていないか？ → 丸括弧 `(--var)` に置換
- [ ] `!` の位置は末尾か？ → `hover:bg-red-500!` が正しい
- [ ] バリアントのスタック順は左から右か？ → `*:first:pt-0` が v4 の正しい順序
- [ ] クラス名を動的に文字列結合していないか？ → オブジェクトマップを使う

---

## 公式ドキュメントへのリンク集

| ページ               | URL                                                            |
| -------------------- | -------------------------------------------------------------- |
| インストール         | https://tailwindcss.com/docs/installation                      |
| エディタ設定         | https://tailwindcss.com/docs/editor-setup                      |
| アップグレードガイド | https://tailwindcss.com/docs/upgrade-guide                     |
| ユーティリティクラス | https://tailwindcss.com/docs/styling-with-utility-classes      |
| 状態バリアント       | https://tailwindcss.com/docs/hover-focus-and-other-states      |
| レスポンシブデザイン | https://tailwindcss.com/docs/responsive-design                 |
| ダークモード         | https://tailwindcss.com/docs/dark-mode                         |
| テーマ変数           | https://tailwindcss.com/docs/theme                             |
| 色                   | https://tailwindcss.com/docs/colors                            |
| カスタムスタイル     | https://tailwindcss.com/docs/adding-custom-styles              |
| ソースファイル検出   | https://tailwindcss.com/docs/detecting-classes-in-source-files |
| 関数とディレクティブ | https://tailwindcss.com/docs/functions-and-directives          |
| Preflight            | https://tailwindcss.com/docs/preflight                         |

_このガイドは Tailwind CSS 公式ドキュメントの要約です。最新情報は必ず公式を参照してください。_
