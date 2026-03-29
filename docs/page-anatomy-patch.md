# Page Anatomy — 差分パッチ (2026-03-29)

既存の page-anatomy.md (2026-03-21) に対する変更箇所のみ記載。
実装担当（Codex）は page-anatomy.md を読んだ上で、本パッチの内容を反映すること。

---

## 変更1: データ要件サマリーテーブルに追加

| ページ        | パス                  | 主要クエリ                            | リアルタイム |
| ------------- | --------------------- | ------------------------------------- | ------------ |
| Note List     | `/notes`              | notes where ownerId == userId         | Yes          |
| Note Detail   | `/notes/:noteId`      | notes/{noteId}                        | Yes          |
| Project Notes | `/projects/:id/notes` | notes where tags contains project.tag | Yes          |

---

## 変更2: ProjectLayout のタブ変更

```
// 変更前
<ProjectTabs>
  <Tab to=".">Overview</Tab>
  <Tab to="tasks">Tasks</Tab>
  <Tab to="mixes">Mixes</Tab>      ← 削除
  <Tab to="settings">Settings</Tab>
</ProjectTabs>

// 変更後
<ProjectTabs>
  <Tab to=".">Overview</Tab>
  <Tab to="tasks">Tasks</Tab>
  <Tab to="notes">Notes</Tab>      ← 追加
  <Tab to="settings">Settings</Tab>
</ProjectTabs>
```

---

## 変更3: TopNav のグローバルナビ

```
// 変更前
<GlobalNav>
  <NavLink to="/home">Dashboard</NavLink>
  <NavLink to="/projects">Projects</NavLink>
</GlobalNav>

// 変更後
<GlobalNav>
  <NavLink to="/home">Dashboard</NavLink>
  <NavLink to="/projects">Projects</NavLink>
  <NavLink to="/notes">Notes</NavLink>      ← 追加
</GlobalNav>
```

---

## 変更4: ProjectOverviewPage — shortDescription + readme 追加

```
<ProjectOverviewPage>
  <ProjectHeader>
    <h1>{project.name}</h1>
    <p>{project.shortDescription}</p>          ← 新規（input で入力。1行）
  </ProjectHeader>

  <ProjectOverview value={project.overview} />  ← 既存。変更なし

  <ProjectReadme                                ← 新規（textarea。将来 Markdown エディタ）
    value={project.readme}
    onSave={updateReadme}
  />

  <ProgressMeter ... />                         ← 既存
  <ProjectStats ... />                          ← 既存
  <RecentActivity ... />                        ← 既存
</ProjectOverviewPage>
```

データ要件に追加:
| データ | Firestore クエリ | リアルタイム |
|---|---|---|
| project.readme | projects/{id} 内のフィールド | Yes (既存の onSnapshot で取得済み) |

---

## 変更5: TaskDetailPage — textarea 化 + linkedNoteId

```
<TaskDetailPage>
  ...
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

  <CommentThread>
    ...
    <CommentInput                          // 変更: input → textarea
      as="textarea"
      rows={3}
      onSubmit={addComment}                // Ctrl+Enter or ボタンで送信
    />
  </CommentThread>
</TaskDetailPage>
```

データ要件に追加:
| データ | Firestore クエリ | リアルタイム |
|---|---|---|
| リンク先 Note | notes/{linkedNoteId} | No (1回読み) |

---

## 新規ページ: NoteListPage

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| パス     | `/notes`                                |
| 説明     | 帳簿棚。全ノートの一覧                  |
| ファイル | `features/notes/pages/NoteListPage.tsx` |

### コンポーネントツリー（v1: 空ページ）

```
<NoteListPage>
  <h1>ノート一覧</h1>
  <EmptyState message={getCopy('emptyNotes')} />
</NoteListPage>
```

> **v1 スコープ**: 空ページ + 空状態メッセージのみ。CRUD は v2。

### データ要件

| データ   | Firestore クエリ                                        | リアルタイム |
| -------- | ------------------------------------------------------- | ------------ |
| 全ノート | `notes` where ownerId == userId, orderBy updatedAt desc | Yes          |

---

## 新規ページ: NoteDetailPage

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| パス     | `/notes/:noteId`                          |
| 説明     | 帳簿の中身。ノートの閲覧・編集            |
| ファイル | `features/notes/pages/NoteDetailPage.tsx` |

### コンポーネントツリー（v1: 空ページ）

```
<NoteDetailPage>
  <h1>ノート詳細</h1>
  <p>noteId: {params.noteId}</p>
</NoteDetailPage>
```

> **v1 スコープ**: ルーティング確認用の空ページのみ。Markdown エディタ・タグ管理・相互参照は v2。

### データ要件（v2 で実装）

| データ         | Firestore クエリ               | リアルタイム     |
| -------------- | ------------------------------ | ---------------- |
| ノート詳細     | `notes/{noteId}`               | Yes (onSnapshot) |
| リンク先タスク | linkedTaskIds から各タスク取得 | No (1回読み)     |

---

## 新規ページ: ProjectNotesPage

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| パス     | `/projects/:projectId/notes`                           |
| 説明     | プロジェクトに紐づくノートの一覧（タグベースフィルタ） |
| ファイル | `features/projects/pages/ProjectNotesPage.tsx`         |

### コンポーネントツリー（v1: 空ページ）

```
<ProjectNotesPage>
  <h1>{project.name} のノート</h1>
  <EmptyState message={getCopy('emptyNotes')} />
</ProjectNotesPage>
```

> **v1 スコープ**: 空ページのみ。タグフィルタ表示は v2。

### データ要件（v2 で実装）

| データ             | Firestore クエリ                              | リアルタイム |
| ------------------ | --------------------------------------------- | ------------ |
| プロジェクトのタグ | `projects/{projectId}` の tag フィールド      | Yes          |
| タグ一致ノート     | `notes` where tags array-contains project.tag | Yes          |

### ユーザーアクション（v2）

- ノートカードクリック → `/notes/:noteId` に遷移

---

## 変更6: AppSettingsPage — テーマ切替の変更

```
<AppSettingsPage>
  <h1>設定</h1>

  <SettingsSection title="テーマ">
    <ThemeToggle>                           // 2テーマ切替
      <ToggleButton>Light</ToggleButton>
      <ToggleButton>Tavern Dark</ToggleButton>
    </ThemeToggle>
  </SettingsSection>

  ...（以下既存と同じ）
</AppSettingsPage>
```
