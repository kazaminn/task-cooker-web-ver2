/* eslint-disable @typescript-eslint/no-explicit-any */
import * as readline from 'node:readline';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {
  User,
  Team,
  Project,
  Task,
  Mix,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
} from '../src/types/types';

// ---------------------------------------------------------------------------
// Mode detection
// ---------------------------------------------------------------------------
type SeedMode = 'emulator' | 'prod';

const isProd =
  process.argv.includes('--prod') || process.env.SEED_TARGET === 'prod';
const mode: SeedMode = isProd ? 'prod' : 'emulator';

const PROD_OWNER_UID = 'omSnJ1C3P7UZUf4VMLkkE7IBGrF2';

// ---------------------------------------------------------------------------
// Firebase initialization
// ---------------------------------------------------------------------------
if (mode === 'emulator') {
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
  const authHost =
    process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.AUTH_EMULATOR_HOST;

  if (!firestoreHost || !authHost) {
    console.error('\n❌ Error: Emulator host information not found.');
    process.exit(1);
  }

  process.env.FIREBASE_AUTH_EMULATOR_HOST = authHost;
  process.env.FIRESTORE_EMULATOR_HOST = firestoreHost;

  const projectId = process.env.GCLOUD_PROJECT || 'task-cooker';
  console.log(`\n🔧 [emulator] Initializing Admin SDK (${projectId})`);
  initializeApp({ projectId });
} else {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const keyPath = path.resolve(
    import.meta.dirname,
    'config/serviceAccountKey.json'
  );

  if (!fs.existsSync(keyPath)) {
    console.error(`\n❌ Service account key not found: ${keyPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(keyPath, 'utf-8');
  let key: any;
  try {
    key = JSON.parse(raw);
  } catch {
    console.error('❌ serviceAccountKey.json is not valid JSON.');
    process.exit(1);
  }

  console.log(`\n🔧 [prod] Initializing Admin SDK (${key.project_id})`);
  initializeApp({ credential: cert(key) });
}

const auth = getAuth();
const db = getFirestore();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

// ---------------------------------------------------------------------------
// Cleanup (prod only)
// ---------------------------------------------------------------------------
async function cleanupProd() {
  console.log('\n🧹 Cleaning up existing data...');

  const knownProjectIds = [
    // Legacy test data
    'project_01',
    'project_02',
    'project_03',
    'project_04',
    'project_05',
    // Emulator seed data
    'project-pancake',
    'project-bbq',
    'project-mvp',
    'project-alice-life',
    // Prod seed data
    'project-my-tasks',
    'project-task-cooker-dev',
  ];

  const knownTeamIds = [
    'team-alice-personal',
    'team-weekend-party',
    'team-startup-launch',
    'team-personal',
    'team-dev',
  ];

  const knownUserIds = [
    'user-alice',
    'user-bob',
    'user-charlie',
    'user-dave',
    'user-eve',
    'tester-opus',
    'tester-haiku',
    'tester-sonnet',
  ];

  for (const id of knownProjectIds) {
    const ref = db.collection('projects').doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      await db.recursiveDelete(ref);
      console.log(`  🗑️  projects/${id} (recursive)`);
    }
  }

  for (const id of knownTeamIds) {
    const ref = db.collection('teams').doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
      console.log(`  🗑️  teams/${id}`);
    }
  }

  for (const id of knownUserIds) {
    const ref = db.collection('users').doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
      console.log(`  🗑️  users/${id}`);
    }
  }

  // Clean userProfiles collection (test data)
  const profileSnap = await db.collection('userProfiles').get();
  for (const doc of profileSnap.docs) {
    await doc.ref.delete();
    console.log(`  🗑️  userProfiles/${doc.id}`);
  }

  // Clean tasks top-level collection (legacy)
  const tasksSnap = await db.collection('tasks').get();
  for (const doc of tasksSnap.docs) {
    await doc.ref.delete();
    console.log(`  🗑️  tasks/${doc.id}`);
  }

  console.log('✅ Cleanup done.');
}

// ---------------------------------------------------------------------------
// Seed data builders
// ---------------------------------------------------------------------------
// Prod test users (email/password auth)
const PROD_TEST_USERS = [
  {
    uid: 'tester-opus',
    email: 'opus@taskcooker.test',
    name: 'Opus',
    seed: 'Opus',
  },
  {
    uid: 'tester-haiku',
    email: 'haiku@taskcooker.test',
    name: 'Haiku',
    seed: 'Haiku',
  },
  {
    uid: 'tester-sonnet',
    email: 'sonnet@taskcooker.test',
    name: 'Sonnet',
    seed: 'Sonnet',
  },
];
const PROD_TEST_PASSWORD = 'taskcooker2026';

function buildUsers(): {
  users: User[];
  authCreate: 'emulator' | 'prod' | false;
} {
  if (mode === 'prod') {
    const owner: User = {
      id: PROD_OWNER_UID,
      displayName: '管理人',
      email: '',
      preferences: { theme: 'system', fontSize: 'medium', highContrast: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const testers: User[] = PROD_TEST_USERS.map((u) => ({
      id: u.uid,
      displayName: u.name,
      email: u.email,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.seed}`,
      preferences: {
        theme: 'system' as const,
        fontSize: 'medium' as const,
        highContrast: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return { authCreate: 'prod', users: [owner, ...testers] };
  }

  const usersData = [
    {
      uid: 'user-alice',
      email: 'alice@example.com',
      name: 'アリス',
      seed: 'Alice',
    },
    { uid: 'user-bob', email: 'bob@example.com', name: 'ボブ', seed: 'Bob' },
    {
      uid: 'user-charlie',
      email: 'charlie@example.com',
      name: 'チャーリー',
      seed: 'Charlie',
    },
    {
      uid: 'user-dave',
      email: 'dave@example.com',
      name: 'デイブ',
      seed: 'Felix',
    },
    { uid: 'user-eve', email: 'eve@example.com', name: 'イヴ', seed: 'Eve' },
  ];

  return {
    authCreate: 'emulator' as const,
    users: usersData.map((u) => ({
      id: u.uid,
      displayName: u.name,
      email: u.email,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.seed}`,
      preferences: {
        theme: 'system' as const,
        fontSize: 'medium' as const,
        highContrast: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
}

function buildTeams(ownerUid: string): Team[] {
  if (mode === 'prod') {
    const testerIds = PROD_TEST_USERS.map((u) => u.uid);
    return [
      {
        id: 'team-personal',
        name: '個人用ワークスペース',
        type: 'personal',
        ownerId: ownerUid,
        memberIds: [ownerUid],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'team-dev',
        name: 'Task Cooker 開発チーム',
        type: 'team',
        ownerId: ownerUid,
        memberIds: [ownerUid, ...testerIds],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  return [
    {
      id: 'team-alice-personal',
      name: '個人用ワークスペース',
      type: 'personal',
      ownerId: 'user-alice',
      memberIds: ['user-alice'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'team-weekend-party',
      name: '週末パーティ計画',
      type: 'team',
      ownerId: 'user-alice',
      memberIds: ['user-alice', 'user-bob', 'user-charlie'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'team-startup-launch',
      name: 'スタートアップ開発',
      type: 'team',
      ownerId: 'user-alice',
      memberIds: ['user-alice', 'user-dave', 'user-eve'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

interface ProjectSeed {
  id: string;
  slug: string;
  name: string;
  team: Team;
  overview: string;
  taskCandidates: { title: string; desc: string }[];
  mixTitle: string;
  mixPost: string;
}

function buildProjects(teams: Team[]): ProjectSeed[] {
  if (mode === 'prod') {
    const personal = teams[0];
    const devTeam = teams[1];
    return [
      {
        id: 'project-my-tasks',
        slug: 'my-tasks',
        name: '個人タスク',
        team: personal,
        overview: '# 個人タスク\n日々のタスク管理。',
        taskCandidates: [
          { title: 'アプリの動作確認', desc: '各画面を一通り触って確認する' },
          { title: 'テスターへの案内準備', desc: 'ログイン手順をまとめる' },
        ],
        mixTitle: 'メモ',
        mixPost: 'Soft Launch開始。',
      },
      {
        id: 'project-task-cooker-dev',
        slug: 'task-cooker-dev',
        name: 'Task Cooker 開発',
        team: devTeam,
        overview:
          '# Task Cooker\n料理メタファーのタスク管理アプリ開発プロジェクト。',
        taskCandidates: [
          {
            title: 'Phase 5C: staging準備',
            desc: 'Firebase分離、CI確立、リリースチェックリスト',
          },
          {
            title: 'Phase 5D: Soft Launch',
            desc: '実データでの動作確認、i18nべた書き外出し',
          },
          {
            title: 'Phase 6: Storybook + 酒場テーマ',
            desc: 'ベースライン作成、テーマCSS変数切替',
          },
          {
            title: 'セキュリティルール整備',
            desc: 'memberIdsベースのアクセス制御を確認',
          },
        ],
        mixTitle: '開発メモ',
        mixPost: 'Phase 5Bまで完了。テスト基盤が整った。',
      },
    ];
  }

  return [
    {
      id: 'project-pancake',
      slug: 'pancake-breakfast',
      name: '日曜のパンケーキ朝食',
      team: teams[1],
      overview:
        '# パンケーキ計画\n最高にふわふわなパンケーキを作るための準備リストです。\n\n## 達成条件\n- 全員が満足する\n- 生地をダマにしない',
      taskCandidates: [
        {
          title: '材料の買い出し',
          desc: '薄力粉、卵、牛乳、メープルシロップを購入する',
        },
        {
          title: '生地の作成',
          desc: '卵と牛乳を混ぜた後、粉をふるいながら入れる',
        },
        {
          title: 'トッピングの準備',
          desc: 'フルーツをカットし、ホイップクリームを作る',
        },
        { title: 'フライパンの予熱', desc: '弱火でじっくり温める' },
        { title: '盛り付け', desc: '見た目も美しく仕上げる' },
        { title: 'コーヒーの抽出', desc: 'パンケーキに合う豆を用意する' },
      ],
      mixTitle: '味付けの相談',
      mixPost: 'ブルーベリーを生地に混ぜ込むのはどうかな？',
    },
    {
      id: 'project-bbq',
      slug: 'summer-bbq',
      name: '夏のバーベキュー大会',
      team: teams[1],
      overview:
        '# BBQロジスティクス\n場所の確保から機材の準備まで。\n\n- 参加人数: 10名程度\n- 予算: 一人3000円',
      taskCandidates: [
        { title: '会場の予約確認', desc: '河川敷の利用許可を確認する' },
        { title: '肉の仕入れ', desc: '地元の精肉店でカルビとタンを予約' },
        { title: '炭と機材のチェック', desc: 'トング、網、着火剤の在庫確認' },
        { title: '飲み物の手配', desc: 'クーラーボックスの準備も忘れずに' },
        { title: 'ゴミ袋の用意', desc: '分別用の袋を多めに持参する' },
        {
          title: '当日のタイムスケジュール作成',
          desc: '集合から片付けまでの流れを固める',
        },
      ],
      mixTitle: '雨天時の対応',
      mixPost: '予報が雨の場合は、近所のレンタルスペースに変更しましょうか。',
    },
    {
      id: 'project-mvp',
      slug: 'app-mvp',
      name: 'Task Cooker MVP開発',
      team: teams[2],
      overview:
        '# 開発ロードマップ\n3月末のリリースを目指します。\n\n- React + Tailwind 4.0\n- Firebase Backend',
      taskCandidates: [
        {
          title: '認証機能の実装',
          desc: 'Googleログインとメール認証を有効にする',
        },
        {
          title: 'Firestoreスキーマ設計',
          desc: 'チームとプロジェクトの階層構造を定義',
        },
        {
          title: 'Storybookのセットアップ',
          desc: '主要なUIコンポーネントをカタログ化する',
        },
        {
          title: 'タスク一覧画面の構築',
          desc: 'フィルタリング機能を含むUIを実装',
        },
        { title: 'セキュリティルールの記述', desc: 'データ保護を確実に行う' },
        { title: 'パフォーマンステスト', desc: '大量データ時の描画速度を確認' },
      ],
      mixTitle: 'UIデザインの方向性',
      mixPost: '「調理」をテーマにしたアイコンを積極的に使っていきたいです。',
    },
    {
      id: 'project-alice-life',
      slug: 'my-life',
      name: '自分磨きプロジェクト',
      team: teams[0],
      overview: '# My Life\n個人的な目標と日々のタスク管理。',
      taskCandidates: [
        {
          title: '読書（技術書）',
          desc: '今月はReactのデザインパターンを読み切る',
        },
        { title: '部屋の掃除', desc: 'デスク周りの配線を整理する' },
        { title: 'ジムでトレーニング', desc: '週3回のランニングを維持' },
        { title: '週末の作り置き', desc: '月曜から水曜までの副菜を準備' },
        { title: '英会話の練習', desc: 'オンラインレッスン30分' },
      ],
      mixTitle: '今月の振り返り',
      mixPost:
        '今週は少しタスクを詰め込みすぎたかもしれない。来週は余裕を持たせよう。',
    },
  ];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function seed() {
  console.log(`\n🌱 Starting database seeding... [mode: ${mode}]`);

  if (mode === 'prod') {
    console.log('\n⚠️  WARNING: You are about to seed PRODUCTION Firestore.');
    console.log(
      '   This will DELETE existing test data and write new seed data.'
    );
    const ok = await confirm('\n   Type "yes" to continue: ');
    if (!ok) {
      console.log('❌ Aborted.');
      process.exit(0);
    }
    await cleanupProd();
  }

  try {
    // 1. Users
    const { users, authCreate } = buildUsers();

    if (authCreate === 'emulator') {
      const pw = 'password123';
      for (const user of users) {
        try {
          await auth.createUser({
            uid: user.id,
            email: user.email,
            password: pw,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        } catch (e: any) {
          if (e.code !== 'auth/email-already-exists') throw e;
        }
      }
      console.log(`✅ ${users.length} auth users created (password: ${pw}).`);
    } else if (authCreate === 'prod') {
      // Create test users only (owner already exists via OAuth)
      for (const tu of PROD_TEST_USERS) {
        try {
          await auth.createUser({
            uid: tu.uid,
            email: tu.email,
            password: PROD_TEST_PASSWORD,
            displayName: tu.name,
          });
        } catch (e: any) {
          if (e.code !== 'auth/uid-already-exists') throw e;
        }
      }
      console.log(
        `✅ ${PROD_TEST_USERS.length} test users created (password: ${PROD_TEST_PASSWORD}).`
      );
    }

    for (const user of users) {
      await db.collection('users').doc(user.id!).set(user);
    }
    console.log(`✅ ${users.length} user profiles written.`);

    // 2. Teams
    const ownerUid = mode === 'prod' ? PROD_OWNER_UID : 'user-alice';
    const teams = buildTeams(ownerUid);

    for (const team of teams) {
      await db.collection('teams').doc(team.id!).set(team);
    }
    console.log(`✅ ${teams.length} teams created.`);

    // 3. Projects / Tasks / Mixes
    const projectsData = buildProjects(teams);
    const TASK_STATUSES: TaskStatus[] = ['order', 'prep', 'cook', 'serve'];
    const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

    for (const p of projectsData) {
      const batch = db.batch();
      const projectRef = db.collection('projects').doc(p.id);
      const teamMembers = users.filter((u) => p.team.memberIds.includes(u.id!));

      // Tasks
      for (let i = 0; i < p.taskCandidates.length; i++) {
        const candidate = p.taskCandidates[i];
        const taskId = `task-${p.id}-${i}`;
        const taskRef = projectRef.collection('tasks').doc(taskId);

        const status = getRandomItem(TASK_STATUSES);
        const priority = getRandomItem(TASK_PRIORITIES);
        const assignee = getRandomItem(teamMembers);
        const createdDate = getRandomDate(new Date(2026, 0, 1), new Date());

        const task: Task = {
          id: taskId,
          displayId: i + 1,
          projectRef: p.id,
          teamId: p.team.id!,
          title: candidate.title,
          description: candidate.desc,
          status,
          priority,
          linkedTaskIds: [],
          position: i,
          createdAt: createdDate,
          updatedAt: createdDate,
        };

        if (p.team.type !== 'personal') {
          task.assigneeId = assignee.id;
        }

        batch.set(taskRef, task);
      }

      // Mix
      const mixId = `mix-${p.id}-0`;
      const mixRef = projectRef.collection('mixes').doc(mixId);
      const author = getRandomItem(teamMembers);
      const createdDate = getRandomDate(new Date(2026, 0, 1), new Date());

      const mix: Mix = {
        id: mixId,
        projectRef: p.id,
        authorId: author.id!,
        author: {
          id: author.id!,
          name: author.displayName,
          photoURL: author.photoURL,
        },
        title: p.mixTitle,
        status: 'open',
        isPublic: true,
        lastActivityAt: createdDate,
        createdAt: createdDate,
        updatedAt: createdDate,
      };

      batch.set(mixRef, mix);

      // Post
      const postRef = mixRef.collection('posts').doc('post-0');
      batch.set(postRef, {
        id: 'post-0',
        author: {
          id: author.id!,
          name: author.displayName,
          photoURL: author.photoURL,
        },
        content: p.mixPost,
        createdAt: createdDate,
      });

      // Project
      const project: Project = {
        id: p.id,
        slug: p.slug,
        teamId: p.team.id!,
        name: p.name,
        overview: p.overview,
        status: 'cooking' as ProjectStatus,
        ownerId: p.team.ownerId,
        memberIds: p.team.memberIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      batch.set(projectRef, project);

      // Counter
      const counterRef = projectRef.collection('counters').doc('task');
      batch.set(counterRef, { current: p.taskCandidates.length });

      await batch.commit();
    }

    console.log(
      `✅ ${projectsData.length} projects set up with realistic data.`
    );
    console.log('\n🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
