# Phase 5B: テスト基盤の底上げ

開始: 2026-03-23
status: cook

## order (未着手)

（なし）

## prep (仕込み中)

（なし）

## cook (調理中)

（なし）

## serve (提供済み)

- [x] テスト戦略ドキュメント v2 作成 (Code + Codex レビュー, #49)
- [x] バンドルサイズ計測 — rollup-plugin-visualizer 導入済み (管理人)
- [x] TaskListView ビルドエラー修正 — filter(Boolean) の型ガード追加 (Code)
- [x] GitHub Issues連携用フィールド追加 — Task.githubIssueNumber/githubRepo, Project.githubRepo (Code, #50)
- [x] P0テスト: api/projects.ts — CRUD + subscribe (Code)
- [x] P0テスト: KanbanBoard — moveTasks純粋関数 + コンポーネントDnDフロー (Code)
- [x] P0テスト: CreateTaskDialog — バリデーション、送信、エラー表示、close (Code)
- [x] カバレッジ計測環境整備 — vitest --coverage + 傾斜つきthresholds設定 (Code)

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

## coverage report

```txt
 % Coverage report from v8
-----------------------------------|---------|----------|---------|---------|--------------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------------------|---------|----------|---------|---------|--------------------------
All files                          |   73.39 |    58.29 |   65.68 |   73.72 |
 api                               |    61.8 |    45.07 |   46.42 |   61.97 |
  activities.ts                    |      50 |       40 |   42.85 |   54.54 | 27-35,57
  auth.ts                          |    4.54 |        0 |       0 |    4.54 | 18-79
  firebase.ts                      |       0 |        0 |       0 |       0 |
  projects.ts                      |   92.85 |    93.75 |   85.71 |   92.85 | 57,68-71
  tasks.ts                         |    85.1 |    57.69 |   73.33 |   84.78 | 41-57,129,161
  users.ts                         |       0 |        0 |       0 |       0 | 13-37
  utils.ts                         |   18.75 |        0 |       0 |   18.75 | 10,26-31,52-57,72-77
 features/auth/components          |     100 |      100 |     100 |     100 |
  AuthGuard.tsx                    |     100 |      100 |     100 |     100 |
 features/auth/hooks               |   39.58 |    14.28 |      50 |   39.58 |
  useAuth.ts                       |   39.58 |    14.28 |      50 |   39.58 | ...,40-47,59,64-71,76-83
 features/auth/store               |   66.66 |       50 |      75 |      60 |
  authStore.ts                     |   66.66 |       50 |      75 |      60 | 31-35
 features/dashboard/components     |      75 |    70.96 |   68.75 |      75 |
  AttentionSection.tsx             |   33.33 |       50 |   33.33 |   33.33 | 15-19
  DashboardTaskCard.tsx            |     100 |      100 |     100 |     100 |
  KitchenLogsSection.tsx           |      50 |      100 |      50 |      50 | 15
  QuickAddSection.tsx              |     100 |    85.71 |     100 |     100 | 27
  RecentProjectsSection.tsx        |      80 |       70 |      75 |      80 | 51
  StoveSection.tsx                 |      75 |       50 |   66.66 |      75 | 38
 features/dashboard/hooks          |   42.66 |     57.5 |   38.09 |   43.93 |
  useDashboardData.ts              |   42.66 |     57.5 |   38.09 |   43.93 | 39-67,74-104,111-140,188
 features/projects/components      |   94.73 |       80 |   91.66 |   94.73 |
  ProgressMeter.tsx                |     100 |       50 |     100 |     100 | 9
  ProjectMetaGrid.tsx              |     100 |      100 |     100 |     100 |
  ProjectOverviewEditor.tsx        |    90.9 |    83.33 |      80 |    90.9 | 48
  ProjectProgressSection.tsx       |     100 |      100 |     100 |     100 |
  ProjectRecentActivitySection.tsx |     100 |      100 |     100 |     100 |
 features/tasks/components         |   92.27 |     76.8 |   88.54 |    93.2 |
  CreateTaskDialog.tsx             |      90 |    65.38 |   78.57 |      90 | 128,145-159
  FilterBar.tsx                    |    91.3 |    66.66 |     100 |   89.47 | 39,61
  KanbanBoard.tsx                  |   94.44 |    77.27 |   96.66 |   96.96 | 49,187
  TaskCard.tsx                     |     100 |       80 |     100 |     100 | 62-108
  TaskDangerZone.tsx               |   85.71 |      100 |      75 |   85.71 | 17
  TaskDescriptionEditor.tsx        |    90.9 |    83.33 |      80 |    90.9 | 44
  TaskListView.tsx                 |    97.5 |     93.1 |     100 |     100 | 40,72
  TaskMetadataSection.tsx          |      50 |       50 |      50 |      50 | 39,52,67-78
  TaskTitleEditor.tsx              |    92.3 |      100 |      80 |    92.3 | 36
  ViewToggle.tsx                   |     100 |       50 |     100 |     100 | 16
 features/tasks/hooks              |   77.33 |    36.36 |      60 |   76.47 |
  useTaskDetailActions.ts          |   72.22 |      100 |    37.5 |   72.22 | 17,21,27,31,35
  useTasks.ts                      |   78.94 |    36.36 |   68.18 |      78 | 20-24,65-73,100-111
 features/tasks/pages              |   84.61 |     62.5 |      50 |   84.61 |
  TaskDetailPage.tsx               |   84.61 |     62.5 |      50 |   84.61 | 36,64
 hooks                             |   84.61 |       88 |   73.07 |   84.61 |
  queryKeys.ts                     |   53.84 |      100 |      50 |   53.84 | 4-6,22-28,37
  useFirestoreSubscription.ts      |    92.3 |    85.71 |   92.85 |    92.3 | 47,62,98,107
 libs                              |   60.78 |    29.31 |   16.66 |   60.78 |
  firebase.ts                      |     100 |       90 |     100 |     100 | 31
  firestore-converters.ts          |   19.04 |        0 |       0 |   19.04 | ...-20,38-43,66-71,85-90
  tv.ts                            |      70 |    66.66 |   66.66 |      70 | 40-44
  variants.ts                      |     100 |      100 |     100 |     100 |
 stores                            |   81.13 |       55 |      88 |   82.22 |
  uiStore.ts                       |   81.13 |       55 |      88 |   82.22 | 49,86,122-124,131-133
 types                             |     100 |      100 |     100 |     100 |
  constants.ts                     |     100 |      100 |     100 |     100 |
  schemas.ts                       |     100 |      100 |     100 |     100 |
 ui/components                     |   61.11 |    57.14 |   45.45 |    64.7 |
  Avatar.tsx                       |      80 |       60 |   66.66 |   88.88 | 79
  Field.tsx                        |   16.66 |      100 |   16.66 |   16.66 | 31-64
  ProgressBar.tsx                  |     100 |       50 |     100 |     100 | 31-32
-----------------------------------|---------|----------|---------|---------|--------------------------

=============================== Coverage summary ===============================
Statements   : 73.39% ( 607/827 )
Branches     : 58.29% ( 260/446 )
Functions    : 65.68% ( 224/341 )
Lines        : 73.72% ( 578/784 )
================================================================================
```
