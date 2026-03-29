# Page Anatomy

last-updated: 2026-03-29

全ページのアナトミー定義。世界観・メタファーは `user-journey.md` を参照する。
`user-journey.md` は世界観資料であり、実装仕様の正本ではない。

---

## 共通レイアウト

### Root Layout

```
<RootLayout>
  <TopNav>                               // 固定。全ページ共通
    <AppLogo to="/home" />               // Left
    <GlobalNav>                          // Center
      <NavLink to="/home">Dashboard</NavLink>
      <NavLink to="/projects">Projects</NavLink>
      <NavLink to="/notes">Notes</NavLink>
    </GlobalNav>
    <UserMenu>                           // Right
      <UserAvatar />
      <DropdownMenu>                     // Profile / Settings / Logout
    </UserMenu>
  </TopNav>
  <main>                                 // スクロール可能。フル幅
    <Outlet />                           // ページごとのコンテンツ
  </main>
</RootLayout>
```

- **TopNav**: 高さ 48px。固定位置。sm ではハンバーガーメニュー → ドロワーで展開
- **main**: 残りのビューポートを占有

### レスポンシブブレークポイント

| ブレーク | 幅        | レイアウト                                |
| -------- | --------- | ----------------------------------------- |
| sm       | < 640px   | 1カラム。ハンバーガーメニュー             |
| md       | 640-960px | 1カラム。トップナビ                       |
| lg       | 960px+    | 1カラム。トップナビ（フル幅メインエリア） |

---

## パブリックページ

### Landing Page

| 項目          | 内容                                     |
| ------------- | ---------------------------------------- |
| パス          | `/`                                      |
| 説明          | 酒場の入口。初めての来店者を迎える       |
| Journey Stage | Journey Stage 1: 初来店                  |
| ファイル      | `features/landing/pages/LandingPage.tsx` |

#### コンポーネントツリー

```
<LandingPage>
  <LandingHeader>
    <AppLogo />
    <Button onPress={→ /login}>ログイン</Button>
  </LandingHeader>
  <HeroSection>
    <h1>かざみんの酒場へようこそ</h1>
    <p>料理メタファーで楽しくタスク管理 — 注文 → 仕込み → 調理 → 提供</p>
    <Button onPress={→ /signup}>始める（Google でサインアップ）</Button>
    <Link to="/login">ログイン</Link>
  </HeroSection>
  <FeatureCards>                          // sm: 縦積み / md+: 3カラム横並び
    <FeatureCard title="カンバンボード" />
    <FeatureCard title="草グラフ" />
    <FeatureCard title="ダークモード" />
  </FeatureCards>
  <Footer />
</LandingPage>
```

#### データ要件

- なし（静的ページ）

#### ユーザーアクション

- 「始める」→ `/signup` へ遷移
- 「ログイン」→ `/login` へ遷移

---

### Login Page

| 項目          | 内容                                |
| ------------- | ----------------------------------- |
| パス          | `/login`                            |
| 説明          | 酒場に入る。常連の帰還              |
| Journey Stage | Journey Stage 1: 初来店             |
| ファイル      | `features/auth/pages/LoginPage.tsx` |

#### コンポーネントツリー

```
<LoginPage>
  <AuthCard>
    <AppLogo />
    <h2>おかえりなさい、店主</h2>
    <GoogleLoginButton />                // Google OAuth → 成功時 /home へ
    <Link to="/signup">アカウントがない方はサインアップ</Link>
  </AuthCard>
</LoginPage>
```

#### データ要件

- Firebase Auth: Google Provider

---

### Signup Page

| 項目          | 内容                                 |
| ------------- | ------------------------------------ |
| パス          | `/signup`                            |
| 説明          | 酒場への初入店。新規登録             |
| Journey Stage | Journey Stage 1: 初来店              |
| ファイル      | `features/auth/pages/SignupPage.tsx` |

#### コンポーネントツリー

```
<SignupPage>
  <AuthCard>
    <AppLogo />
    <h2>かざみんの酒場へようこそ</h2>
    <GoogleLoginButton />                // OAuth → Personal Team 自動作成 → /home へ
    <Link to="/login">すでにアカウントをお持ちの方はログイン</Link>
  </AuthCard>
</SignupPage>
```

#### データ要件

- Firebase Auth: Google Provider
- 初回登録時: Personal Team 自動作成

---

## Protected ページ

### Dashboard (Kitchen Dashboard)

| 項目          | 内容                                         |
| ------------- | -------------------------------------------- |
| パス          | `/home`                                      |
| 説明          | 厨房のカウンターから店内を見渡す。メインハブ |
| Journey Stage | Journey Stage 2-5                            |
| ファイル      | `features/dashboard/pages/DashboardPage.tsx` |

#### コンポーネントツリー

```
<DashboardPage>                          // 1カラム縦並び
  <DailyPulse>                           // 本日のサマリー
    <ServedCount count={3} />            // 今日の serve 数
    <BurntAlerts tasks={overdueTasks} /> // 期限切れアラート
  </DailyPulse>

  <OnTheStove tasks={activeTasksAllPJ}>  // prep/cook 中のタスク（全PJ横断）
    <TaskCard variant="compact" />       // タイトル + status + priority + due
    ...
  </OnTheStove>

  <ContributionGraph                     // パンケーキの焼き色 草グラフ
    data={contributions365days}
    levels={5}                           // pancake browning 5段階
  />

  <RecentRecipes>                        // プロジェクト一覧 + 進捗
    <ProjectCard>                        // 名前 + status + タスク数 + 進捗バー
      <ProgressMeter />
    </ProjectCard>
    ...
    <Button>+ New Project</Button>       // → CreateProjectDialog
  </RecentRecipes>

  <KitchenLogs                           // アクティビティフィード
    activities={recentActivities}        // 直近 5-10 件
  />

  <QuickAddInput />                      // 1行入力。Enter で即 order 作成
</DashboardPage>
```

#### データ要件

| データ                       | Firestore クエリ                                              | リアルタイム     |
| ---------------------------- | ------------------------------------------------------------- | ---------------- |
| プロジェクト一覧             | `projects` where memberIds contains userId, orderBy updatedAt | Yes (onSnapshot) |
| prep/cook タスク（全PJ横断） | collection group `tasks` where status in ['prep','cook']      | Yes (onSnapshot) |
| 本日 due のタスク            | collection group `tasks` where dueDate == today               | Yes (onSnapshot) |
| アクティビティ               | collection group `activities` orderBy createdAt desc limit 10 | Yes (onSnapshot) |
| 草グラフ                     | Activity から日別集計（直近365日）                            | No (1回読み)     |

#### ユーザーアクション

- On the Stove のタスク → `/projects/:id/tasks/:taskId` へ遷移
- Recent Recipes のプロジェクト → `/projects/:id` へ遷移
- Quick Add でタスク作成（デフォルトプロジェクトに order で追加）
- 「+ New Project」→ プロジェクト作成ダイアログ

#### レスポンシブ

- sm: 草グラフは直近6ヶ月に制限
- md+: フル表示

---

### Project List Page

| 項目          | 内容                                          |
| ------------- | --------------------------------------------- |
| パス          | `/projects`                                   |
| 説明          | メニュー帳。全プロジェクトの一覧              |
| Journey Stage | Journey Stage 3-5                             |
| ファイル      | `features/projects/pages/ProjectListPage.tsx` |

#### コンポーネントツリー

```
<ProjectListPage>
  <ProjectListHeader>
    <h1>プロジェクト一覧</h1>
    <Button>+ 新規プロジェクト</Button>     // → CreateProjectDialog
  </ProjectListHeader>
  <ProjectCardList>
    <ProjectCard>                          // status badge + 名前 + 概要
      <ProjectStatusBadge status="cooking" />
      <span>{name}</span>
      <span>{taskCount} tasks</span>
      <ProgressMeter value={doneRatio} />  // serve/total 進捗バー
    </ProjectCard>
    ...
  </ProjectCardList>
  <CreateProjectDialog />                  // モーダル
</ProjectListPage>
```

#### データ要件

| データ           | Firestore クエリ                                                   | リアルタイム     |
| ---------------- | ------------------------------------------------------------------ | ---------------- |
| プロジェクト一覧 | `projects` where memberIds contains userId, orderBy updatedAt desc | Yes (onSnapshot) |
| タスク数/進捗    | `projects/{projectId}/tasks`（集計）                               | Yes (onSnapshot) |

#### ユーザーアクション

- プロジェクトカード → `/projects/:id` へ遷移
- 「+ 新規プロジェクト」→ 作成ダイアログ

#### レスポンシブ

- lg: カードリスト（1カラム、幅制限）
- sm: フルワイド。進捗バーテキストを省略

---

### Project Layout

| 項目          | 内容                                                            |
| ------------- | --------------------------------------------------------------- |
| パス          | `/projects/:projectId`                                          |
| 説明          | プロジェクトの厨房。タブで内容切替                              |
| Journey Stage | Journey Stage 3-5                                               |
| ファイル      | `features/projects/pages/ProjectLayout.tsx`（入れ子レイアウト） |

#### コンポーネントツリー

```
<ProjectLayout>
  <ProjectHeader>
    <Breadcrumbs>Projects > {projectName}</Breadcrumbs>
  </ProjectHeader>
  <ProjectTabs>                            // react-aria TabList
    <Tab to=".">Overview</Tab>             // index route = overview 直表示
    <Tab to="tasks">Tasks</Tab>
    <Tab to="notes">Notes</Tab>
    <Tab to="settings">Settings</Tab>
  </ProjectTabs>
  <Outlet />                               // サブルートの中身
    // index:    → ProjectOverviewPage
    // tasks:    → ProjectTasksPage
    // tasks/:id → TaskDetailPage
    // notes:    → ProjectNotesPage
    // settings: → ProjectSettingsPage
</ProjectLayout>
```

#### データ要件

| データ           | Firestore クエリ       | リアルタイム     |
| ---------------- | ---------------------- | ---------------- |
| プロジェクト詳細 | `projects/{projectId}` | Yes (onSnapshot) |

#### レスポンシブ

- md/sm: タブは横スクロール可能

---

### Project Overview Page

| 項目          | 内容                                              |
| ------------- | ------------------------------------------------- |
| パス          | `/projects/:projectId`（index route）             |
| 説明          | メニューの紹介ページ。プロジェクトの概要と進捗    |
| Journey Stage | Journey Stage 3-5                                 |
| ファイル      | `features/projects/pages/ProjectOverviewPage.tsx` |

#### コンポーネントツリー

```
<ProjectOverviewPage>
  <ProjectHeader>
    <ProjectStatusBadge status="cooking" />  // 営業中 等
    <h1>{project.name}</h1>
    <p>{project.shortDescription}</p>        // 新規（input で入力。1行）
  </ProjectHeader>

  <ProgressSection>
    <ProgressMeter value={doneRatio} />    // 12/15 tasks  80%
    <StatusBreakdown>                      // order: 1  prep: 1  cook: 1  serve: 12
      <StatusCount status="order" count={1} />
      <StatusCount status="prep" count={1} />
      <StatusCount status="cook" count={1} />
      <StatusCount status="serve" count={12} />
    </StatusBreakdown>
  </ProgressSection>

  <OverviewText                            // overview フィールド
    text={project.overview}
    onEdit={updateOverview}                // インライン編集
  />

  <ProjectReadme                           // 新規（textarea。将来 Markdown エディタ）
    value={project.readme}
    onSave={updateReadme}
  />

  <RecentActivity                          // プロジェクト内の直近5件
    activities={projectActivities}
  />
</ProjectOverviewPage>
```

#### データ要件

| データ               | Firestore クエリ                                                 | リアルタイム                       |
| -------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| プロジェクト詳細     | `projects/{projectId}`                                           | Yes (onSnapshot)                   |
| タスク一覧（集計用） | `projects/{projectId}/tasks`                                     | Yes (onSnapshot)                   |
| アクティビティ       | `projects/{projectId}/activities` orderBy createdAt desc limit 5 | Yes (onSnapshot)                   |
| project.readme       | `projects/{projectId}` 内のフィールド                            | Yes (既存の onSnapshot で取得済み) |

#### ユーザーアクション

- ステータスバッジ → ステータス変更ドロップダウン
- shortDescription テキスト → インライン編集
- overview テキスト → インライン編集
- readme テキスト → インライン編集（将来 Markdown エディタ）

#### レスポンシブ

- ステータス別カウントは sm で折り返し表示

---

### Project Tasks Page

| 項目          | 内容                                           |
| ------------- | ---------------------------------------------- |
| パス          | `/projects/:projectId/tasks`                   |
| 説明          | オーダーボード。タスクの一覧表示と管理         |
| Journey Stage | Journey Stage 3-5                              |
| ファイル      | `features/projects/pages/ProjectTasksPage.tsx` |

#### コンポーネントツリー — リストビュー

```
<ProjectTasksPage>
  <TaskToolbar>
    <Button>+ 新しい注文</Button>           // → CreateTaskDialog
    <FilterBar>
      <Select label="status" />
      <Select label="priority" />
      <Select label="due" />
    </FilterBar>
    <SearchField placeholder="タイトル検索..." />
    <ViewToggle>
      <ToggleButton selected>List</ToggleButton>
      <ToggleButton>Kanban</ToggleButton>
    </ViewToggle>
  </TaskToolbar>

  <TaskListView>                           // GitHub Issues 風
    <TaskRow>                              // 2行表示
      <StatusDot status="cook" />
      <span>#12 UIState不具合調査</span>   // title + displayId
      <PriorityIcon priority="high" />     // ↑ + aria-label
      <span>3/20</span>                    // dueDate
    </TaskRow>
    <TaskRow>
      <StatusDot status="prep" />
      <span>#15 API設計書作成</span>
      <PriorityIcon priority="medium" />
      <span>3/22</span>
    </TaskRow>
    ...
  </TaskListView>

  <CreateTaskDialog />
</ProjectTasksPage>
```

#### コンポーネントツリー — カンバンビュー

```
<ProjectTasksPage>
  <TaskToolbar>...</TaskToolbar>           // 同上（ViewToggle で Kanban 選択時）

  <KanbanBoard>                            // 4列。react-aria DnD
    <KanbanColumn status="order" count={1}>
      <TaskCard>                           // title + priority icon + due
        <span>#16 README整備</span>
        <PriorityIcon priority="low" />
      </TaskCard>
    </KanbanColumn>
    <KanbanColumn status="prep" count={1}>
      <TaskCard>
        <span>#15 API設計</span>
        <PriorityIcon priority="medium" />
        <span>3/22</span>
      </TaskCard>
    </KanbanColumn>
    <KanbanColumn status="cook" count={1}>
      <TaskCard>
        <span>#12 UIState</span>
        <PriorityIcon priority="high" />
        <span>3/20</span>
      </TaskCard>
    </KanbanColumn>
    <KanbanColumn status="serve" count={12}>
      <TaskCard>...</TaskCard>
      ...
    </KanbanColumn>
  </KanbanBoard>
</ProjectTasksPage>
```

#### データ要件

| データ         | Firestore クエリ                                   | リアルタイム     |
| -------------- | -------------------------------------------------- | ---------------- |
| タスク一覧     | `projects/{projectId}/tasks` orderBy position      | Yes (onSnapshot) |
| displayId 採番 | `projects/{projectId}/counters/task` (transaction) | No               |

#### ユーザーアクション

- タスクカード/行クリック → `/projects/:id/tasks/:taskId` へ遷移（全画面）
- DnD でカンバン列間移動 → ステータス遷移
- 「+ 新しい注文」→ タスク作成ダイアログ
- フィルター / 検索でタスク絞り込み
- ビュー切替（リスト ↔ カンバン）

#### レスポンシブ

- lg: カンバンは4列表示
- md: カンバンは横スクロール
- sm: カンバン非表示。リストにフォールバック

---

### Task Detail Page

| 項目          | 内容                                      |
| ------------- | ----------------------------------------- |
| パス          | `/projects/:projectId/tasks/:taskId`      |
| 説明          | 注文の詳細。タスクの全情報と編集          |
| Journey Stage | Journey Stage 3-5                         |
| ファイル      | `features/tasks/pages/TaskDetailPage.tsx` |

#### コンポーネントツリー

```
<TaskDetailPage>                           // 全画面遷移（ProjectLayout 内）
  <TaskDetailHeader>
    <TaskTitleEditor                       // インライン編集
      displayId={12}
      title="UIState不具合調査"
    />
    <DeleteTaskButton />                   // 確認ダイアログ付き → 削除後タスクリストへ
  </TaskDetailHeader>

  <TaskMetadata>
    <StatusSelect value="cook" />          // react-aria Select（料理メタファーラベル）
    <PrioritySelect value="high" />        // react-aria Select
    <DatePicker value="2026-03-20" />      // react-aria DatePicker
    <AssigneeSelect                        // チームプロジェクト時のみ表示
      members={teamMembers}
    />
  </TaskMetadata>

  <TaskDescription                         // 変更: input → textarea
    as="textarea"                          // react-aria TextArea
    rows={6}
    value={task.description}
    onSave={updateDescription}
  />

  <LinkedNote                              // 新規: linkedNoteId がある場合に表示
    noteId={task.linkedNoteId}
    onNavigate={() => navigate(`/notes/${task.linkedNoteId}`)}
    onUnlink={unlinkNote}
  />

  <CommentThread>                          // コメント一覧
    <CommentItem
      author="user"
      authorName="タクミ"
      body="原因はZustandの..."
      createdAt="3/19 10:30"
    />
    <CommentItem
      author="claude"
      authorName="Claude"
      body="useShallowを使うと..."
      createdAt="3/19 11:00"
    />
    <CommentInput                          // 変更: input → textarea
      as="textarea"
      rows={3}
      onSubmit={addComment}                // Ctrl+Enter or ボタンで送信
    />
  </CommentThread>
</TaskDetailPage>
```

#### データ要件

| データ                       | Firestore クエリ                                                 | リアルタイム     |
| ---------------------------- | ---------------------------------------------------------------- | ---------------- |
| タスク詳細                   | `projects/{projectId}/tasks/{taskId}`                            | Yes (onSnapshot) |
| コメント                     | `projects/{projectId}/tasks/{taskId}/comments` orderBy createdAt | Yes (onSnapshot) |
| チームメンバー（assignee用） | `teams/{teamId}` の memberIds                                    | No               |
| リンク先 Note                | `notes/{linkedNoteId}`                                           | No (1回読み)     |

#### ユーザーアクション

- タイトル・本文のインライン編集
- ステータス / 優先順位 / 期限 / 担当者の変更
- コメント投稿
- タスク削除 → 確認ダイアログ → タスクリストにリダイレクト

#### レスポンシブ

- メタデータは sm で縦積み

---

### Project Settings Page

| 項目          | 内容                                              |
| ------------- | ------------------------------------------------- |
| パス          | `/projects/:projectId/settings`                   |
| 説明          | メニューの設定。プロジェクトの編集・削除          |
| Journey Stage | Journey Stage 3-5                                 |
| ファイル      | `features/projects/pages/ProjectSettingsPage.tsx` |

#### コンポーネントツリー

```
<ProjectSettingsPage>
  <h1>プロジェクト設定</h1>

  <ProjectSettingsForm>                    // 基本情報
    <TextField label="名前" value={name} />
    <TextField label="Slug" value={slug} />
    <TextArea label="概要" value={overview} />
    <Select label="Status" value={status} />  // planning/cooking/on_hold/completed
    <Button type="submit">保存</Button>
  </ProjectSettingsForm>

  <DangerZone>                             // 危険ゾーン
    <p>プロジェクトを削除（この操作は取り消せません）</p>
    <Button variant="danger"               // → 確認ダイアログ → 削除後 /projects へ
      onPress={openDeleteConfirm}
    >削除する</Button>
  </DangerZone>
</ProjectSettingsPage>
```

#### データ要件

| データ           | Firestore クエリ       | リアルタイム     |
| ---------------- | ---------------------- | ---------------- |
| プロジェクト詳細 | `projects/{projectId}` | Yes (onSnapshot) |

#### ユーザーアクション

- フォーム編集 → 保存
- プロジェクト削除（確認ダイアログ付き）→ `/projects` へリダイレクト

---

### Team List Page

| 項目          | 内容                                    |
| ------------- | --------------------------------------- |
| パス          | `/teams`                                |
| 説明          | 酒場の経営体制。チーム一覧              |
| Journey Stage | Journey Stage 5                         |
| ファイル      | `features/teams/pages/TeamListPage.tsx` |

#### コンポーネントツリー

```
<TeamListPage>
  <TeamListHeader>
    <h1>チーム一覧</h1>
    <Button>+ 新規チーム</Button>            // → CreateTeamDialog
  </TeamListHeader>
  <TeamCardList>
    <TeamCard>                               // チーム名 + type badge + メンバー数
      <TeamTypeBadge type="personal" />      // personal / team
      <span>{teamName}</span>
      <span>メンバー: {memberCount}人</span>
    </TeamCard>
    ...
  </TeamCardList>
  <CreateTeamDialog />
</TeamListPage>
```

#### データ要件

| データ     | Firestore クエリ                        | リアルタイム     |
| ---------- | --------------------------------------- | ---------------- |
| チーム一覧 | `teams` where memberIds contains userId | Yes (onSnapshot) |

#### ユーザーアクション

- チームカード → `/teams/:id/members` へ遷移
- 「+ 新規チーム」→ 作成ダイアログ
- Personal Team は削除不可

---

### Team Members Page

| 項目          | 内容                                       |
| ------------- | ------------------------------------------ |
| パス          | `/teams/:teamId/members`                   |
| 説明          | 厨房スタッフの管理。メンバー一覧と招待     |
| Journey Stage | Journey Stage 5                            |
| ファイル      | `features/teams/pages/TeamMembersPage.tsx` |

#### コンポーネントツリー

```
<TeamMembersPage>
  <TeamMembersHeader>
    <h1>{teamName} — メンバー管理</h1>
    <Button>+ メンバー招待</Button>          // → InviteMemberDialog
  </TeamMembersHeader>
  <MemberList>
    <MemberCard>                             // アバター + 名前 + role + email
      <Avatar />
      <span>{name} (owner)</span>
      <span>{email}</span>
    </MemberCard>
    <MemberCard>
      <Avatar />
      <span>{name}</span>
      <span>{email}</span>
      <Button variant="danger">除外</Button> // owner は除外不可
    </MemberCard>
    ...
  </MemberList>
  <InviteMemberDialog />                     // userId 直指定で追加
</TeamMembersPage>
```

#### データ要件

| データ       | Firestore クエリ                 | リアルタイム     |
| ------------ | -------------------------------- | ---------------- |
| チーム詳細   | `teams/{teamId}`                 | Yes (onSnapshot) |
| メンバー情報 | memberIds から各ユーザー情報取得 | No               |

#### ユーザーアクション

- メンバー招待（userId 直指定）
- メンバー除外（確認ダイアログ付き）
- owner は除外不可

---

### Profile Page

| 項目          | 内容                                     |
| ------------- | ---------------------------------------- |
| パス          | `/profile`                               |
| 説明          | 料理人の経歴。プロフィールと貢献グラフ   |
| Journey Stage | Journey Stage 6                          |
| ファイル      | `features/profile/pages/ProfilePage.tsx` |

#### コンポーネントツリー

```
<ProfilePage>
  <ProfileHeader>
    <Avatar src={user.photoURL} size="lg" />
    <h1>{user.displayName}</h1>
    <span>{user.email}</span>
  </ProfileHeader>

  <ContributionGraph                       // パンケーキの焼き色 草グラフ（フルサイズ版）
    data={contributions365days}
    levels={5}                             // pancake browning 5段階
  />

  <StatsSection>                           // 統計情報
    <StatItem label="総 serve 数" value={142} />
    <StatItem label="総タスク作成数" value={203} />
  </StatsSection>
</ProfilePage>
```

> **MVP スコープ**: XP / レベル / ストリーク / 実績バッジは MVP 後。草グラフ + 基本統計のみ。

#### データ要件

| データ       | Firestore クエリ                   | リアルタイム     |
| ------------ | ---------------------------------- | ---------------- |
| ユーザー情報 | `users/{userId}`                   | Yes (onSnapshot) |
| 草グラフ     | Activity から日別集計（直近365日） | No (1回読み)     |
| 統計         | タスクの集計                       | No (1回読み)     |

#### ユーザーアクション

- 草グラフのセルホバー → ツールチップ（日付 + アクション数）

#### レスポンシブ

- sm: 草グラフは直近6ヶ月に制限

---

### Note List Page

| 項目          | 内容                                    |
| ------------- | --------------------------------------- |
| パス          | `/notes`                                |
| 説明          | 帳簿棚。全ノートの一覧                  |
| Journey Stage | Journey Stage 5+                        |
| ファイル      | `features/notes/pages/NoteListPage.tsx` |

#### コンポーネントツリー（v1: 空ページ）

```
<NoteListPage>
  <h1>ノート一覧</h1>
  <EmptyState message={getCopy('emptyNotes')} />
</NoteListPage>
```

> **v1 スコープ**: 空ページ + 空状態メッセージのみ。CRUD は v2。

#### データ要件

| データ   | Firestore クエリ                                        | リアルタイム |
| -------- | ------------------------------------------------------- | ------------ |
| 全ノート | `notes` where ownerId == userId, orderBy updatedAt desc | Yes          |

---

### Note Detail Page

| 項目          | 内容                                      |
| ------------- | ----------------------------------------- |
| パス          | `/notes/:noteId`                          |
| 説明          | 帳簿の中身。ノートの閲覧・編集            |
| Journey Stage | Journey Stage 5+                          |
| ファイル      | `features/notes/pages/NoteDetailPage.tsx` |

#### コンポーネントツリー（v1: 空ページ）

```
<NoteDetailPage>
  <h1>ノート詳細</h1>
  <p>noteId: {params.noteId}</p>
</NoteDetailPage>
```

> **v1 スコープ**: ルーティング確認用の空ページのみ。Markdown エディタ・タグ管理・相互参照は v2。

#### データ要件（v2 で実装）

| データ         | Firestore クエリ               | リアルタイム     |
| -------------- | ------------------------------ | ---------------- |
| ノート詳細     | `notes/{noteId}`               | Yes (onSnapshot) |
| リンク先タスク | linkedTaskIds から各タスク取得 | No (1回読み)     |

---

### Project Notes Page

| 項目          | 内容                                                   |
| ------------- | ------------------------------------------------------ |
| パス          | `/projects/:projectId/notes`                           |
| 説明          | プロジェクトに紐づくノートの一覧（タグベースフィルタ） |
| Journey Stage | Journey Stage 5+                                       |
| ファイル      | `features/projects/pages/ProjectNotesPage.tsx`         |

#### コンポーネントツリー（v1: 空ページ）

```
<ProjectNotesPage>
  <h1>{project.name} のノート</h1>
  <EmptyState message={getCopy('emptyNotes')} />
</ProjectNotesPage>
```

> **v1 スコープ**: 空ページのみ。タグフィルタ表示は v2。

#### データ要件（v2 で実装）

| データ             | Firestore クエリ                              | リアルタイム |
| ------------------ | --------------------------------------------- | ------------ |
| プロジェクトのタグ | `projects/{projectId}` の tag フィールド      | Yes          |
| タグ一致ノート     | `notes` where tags array-contains project.tag | Yes          |

#### ユーザーアクション（v2）

- ノートカードクリック → `/notes/:noteId` に遷移

---

### App Settings Page

| 項目          | 内容                                          |
| ------------- | --------------------------------------------- |
| パス          | `/settings`                                   |
| 説明          | 酒場の設定。テーマ・アクセシビリティ          |
| Journey Stage | Journey Stage 4-5                             |
| ファイル      | `features/settings/pages/AppSettingsPage.tsx` |

#### コンポーネントツリー

```
<AppSettingsPage>
  <h1>設定</h1>

  <SettingsSection title="テーマ">
    <ThemeToggle>                           // 2テーマ切替
      <ToggleButton>Light</ToggleButton>
      <ToggleButton>Tavern Dark</ToggleButton>
    </ThemeToggle>
  </SettingsSection>

  <SettingsSection title="アクセシビリティ">
    <Switch label="モーション軽減" />        // prefers-reduced-motion 連動
  </SettingsSection>

  <SettingsSection title="アカウント">
    <Button                                // Firebase Auth signOut → /login へ
      variant="secondary"
      onPress={signOut}
    >ログアウト</Button>
  </SettingsSection>
</AppSettingsPage>
```

> **MVP スコープ**: ゲーミフィケーション設定（XP通知 / ストリーク通知）は MVP 後。

#### データ要件

| データ       | Firestore クエリ      | リアルタイム |
| ------------ | --------------------- | ------------ |
| ユーザー設定 | localStorage (テーマ) | No           |

#### ユーザーアクション

- テーマ切替 → 即時反映（localStorage + data-theme 属性）
- モーション軽減 → CSS prefers-reduced-motion 連動
- ログアウト → Firebase Auth signOut → `/login` へリダイレクト

---

## データ要件サマリーテーブル

全ページ × Firestore クエリ × リアルタイム要否の一覧。

| ページ           | パス                          | 主要クエリ                             | リアルタイム |
| ---------------- | ----------------------------- | -------------------------------------- | ------------ |
| Landing          | `/`                           | なし                                   | —            |
| Login            | `/login`                      | Firebase Auth                          | —            |
| Signup           | `/signup`                     | Firebase Auth + Team 作成              | —            |
| Dashboard        | `/home`                       | projects, tasks(横断), activities      | Yes          |
| Project List     | `/projects`                   | projects, tasks(集計)                  | Yes          |
| Project Layout   | `/projects/:id`               | projects/{id}                          | Yes          |
| Project Overview | `/projects/:id` (index)       | projects/{id}, tasks(集計), activities | Yes          |
| Project Tasks    | `/projects/:id/tasks`         | projects/{id}/tasks, counters/task     | Yes          |
| Task Detail      | `/projects/:id/tasks/:taskId` | tasks/{id}, comments, teams/{id}       | Yes          |
| Project Settings | `/projects/:id/settings`      | projects/{id}                          | Yes          |
| Team List        | `/teams`                      | teams                                  | Yes          |
| Team Members     | `/teams/:id/members`          | teams/{id}                             | Yes          |
| Note List        | `/notes`                      | notes where ownerId == userId          | Yes          |
| Note Detail      | `/notes/:noteId`              | notes/{noteId}                         | Yes          |
| Project Notes    | `/projects/:id/notes`         | notes where tags contains project.tag  | Yes          |
| Profile          | `/profile`                    | user, activities(集計)                 | 部分的       |
| App Settings     | `/settings`                   | localStorage                           | No           |
