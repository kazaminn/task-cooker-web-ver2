import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const PROJECT_ID = 'task-cooker-rules';
const FIRESTORE_HOST = process.env.FIRESTORE_RULES_TEST_HOST ?? '127.0.0.1';
const FIRESTORE_PORT = Number(process.env.FIRESTORE_RULES_TEST_PORT ?? '8080');

let testEnv: RulesTestEnvironment;

async function seedData() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await setDoc(doc(db, 'users/user-alice'), {
      displayName: 'Alice',
      email: 'alice@example.com',
      preferences: { theme: 'system', fontSize: 'medium', highContrast: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await setDoc(doc(db, 'users/user-bob'), {
      displayName: 'Bob',
      email: 'bob@example.com',
      preferences: { theme: 'system', fontSize: 'medium', highContrast: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await setDoc(doc(db, 'projects/project-1'), {
      slug: 'project-1',
      teamId: 'team-1',
      name: 'Project 1',
      overview: '',
      status: 'cooking',
      ownerId: 'user-alice',
      memberIds: ['user-alice'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await setDoc(doc(db, 'projects/project-2'), {
      slug: 'project-2',
      teamId: 'team-1',
      name: 'Project 2',
      overview: '',
      status: 'cooking',
      ownerId: 'user-bob',
      memberIds: ['user-bob'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await setDoc(doc(db, 'projects/project-1/tasks/task-1'), {
      displayId: 1,
      projectRef: 'project-1',
      teamId: 'team-1',
      title: 'Alice task',
      status: 'prep',
      priority: 'medium',
      linkedTaskIds: [],
      position: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await setDoc(doc(db, 'projects/project-2/tasks/task-2'), {
      displayId: 2,
      projectRef: 'project-2',
      teamId: 'team-1',
      title: 'Bob task',
      status: 'cook',
      priority: 'high',
      linkedTaskIds: [],
      position: 2000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
}

describe('Firestore security rules', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: FIRESTORE_HOST,
        port: FIRESTORE_PORT,
        rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8'),
      },
    });
  });

  afterEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  it('denies unauthenticated reads to user profiles', async () => {
    await seedData();

    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, 'users/user-alice')));
  });

  it('allows users to update only their own profile', async () => {
    await seedData();

    const aliceDb = testEnv.authenticatedContext('user-alice').firestore();
    const bobDb = testEnv.authenticatedContext('user-bob').firestore();

    await assertSucceeds(
      setDoc(
        doc(aliceDb, 'users/user-alice'),
        { bio: 'I like pancakes' },
        { merge: true }
      )
    );
    await assertFails(
      setDoc(
        doc(bobDb, 'users/user-alice'),
        { bio: 'spoofed' },
        { merge: true }
      )
    );
  });

  it('allows project members to read their tasks but blocks non-members', async () => {
    await seedData();

    const aliceDb = testEnv.authenticatedContext('user-alice').firestore();
    const bobDb = testEnv.authenticatedContext('user-bob').firestore();

    const aliceTaskRef = doc(aliceDb, 'projects/project-1/tasks/task-1');
    const bobAccessRef = doc(bobDb, 'projects/project-1/tasks/task-1');

    await assertSucceeds(getDoc(aliceTaskRef));
    await assertFails(getDoc(bobAccessRef));
  });

  it('allows project members to query their own task list', async () => {
    await seedData();

    const aliceDb = testEnv.authenticatedContext('user-alice').firestore();
    const bobDb = testEnv.authenticatedContext('user-bob').firestore();

    const aliceTasks = await assertSucceeds(
      getDocs(collection(aliceDb, 'projects/project-1/tasks'))
    );
    expect(aliceTasks.docs).toHaveLength(1);
    expect(aliceTasks.docs[0]?.data().title).toBe('Alice task');

    await assertFails(getDocs(collection(bobDb, 'projects/project-1/tasks')));
  });

  it('requires activity writes to use the authenticated user id and matching project id', async () => {
    await seedData();

    const aliceDb = testEnv.authenticatedContext('user-alice').firestore();
    const activityCol = collection(aliceDb, 'projects/project-1/activities');

    await assertSucceeds(
      addDoc(activityCol, {
        type: 'task_create',
        userId: 'user-alice',
        userName: 'Alice',
        text: 'created task',
        projectId: 'project-1',
        createdAt: new Date(),
      })
    );

    await assertFails(
      addDoc(activityCol, {
        type: 'task_create',
        userId: 'user-bob',
        userName: 'Bob',
        text: 'spoofed activity',
        projectId: 'project-1',
        createdAt: new Date(),
      })
    );
  });
});
