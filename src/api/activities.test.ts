import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createActivity,
  createCurrentUserActivity,
  subscribeUserActivities,
} from './activities';

interface SnapshotDoc<T> {
  data: () => T;
}

interface SnapshotValue<T> {
  docs: SnapshotDoc<T>[];
}

const mocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  collectionGroup: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(),
  where: vi.fn(),
  getCurrentUser: vi.fn(),
  db: { name: 'db' },
  activityConverter: { name: 'activityConverter' },
}));

vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc,
  collection: mocks.collection,
  collectionGroup: mocks.collectionGroup,
  limit: mocks.limit,
  onSnapshot: mocks.onSnapshot,
  orderBy: mocks.orderBy,
  query: mocks.query,
  serverTimestamp: mocks.serverTimestamp,
  where: mocks.where,
}));

vi.mock('./auth', () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock('./firebase', () => ({
  db: mocks.db,
}));

vi.mock('./utils', () => ({
  activityConverter: mocks.activityConverter,
}));

describe('api/activities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.serverTimestamp.mockReturnValue('server-ts');
    mocks.collection.mockImplementation(() => ({
      withConverter: vi.fn().mockReturnValue('activities-col'),
    }));
    mocks.collectionGroup.mockImplementation(() => ({
      withConverter: vi.fn().mockReturnValue('activities-group'),
    }));
    mocks.limit.mockImplementation((count: number) => ({
      type: 'limit',
      count,
    }));
    mocks.orderBy.mockImplementation((...args) => ({ type: 'orderBy', args }));
    mocks.where.mockImplementation((...args) => ({ type: 'where', args }));
    mocks.query.mockImplementation((...args) => ({ type: 'query', args }));
  });

  it('subscribes to user activities filtered by userId', () => {
    const callback = vi.fn();
    const unsubscribe = vi.fn();
    const activity = {
      id: 'activity-1',
      type: 'task_update',
      userId: 'user-1',
      userName: 'Alice',
      text: 'updated',
      createdAt: new Date(),
    };

    mocks.onSnapshot.mockImplementation(
      (
        _query: unknown,
        onNext: (value: SnapshotValue<typeof activity>) => void
      ) => {
        onNext({
          docs: [{ data: () => activity }],
        });
        return unsubscribe;
      }
    );

    const result = subscribeUserActivities('user-1', callback);

    expect(mocks.where).toHaveBeenCalledWith('userId', '==', 'user-1');
    expect(callback).toHaveBeenCalledWith([activity]);
    expect(result).toBe(unsubscribe);
  });

  it('creates an activity document with a server timestamp', async () => {
    mocks.addDoc.mockResolvedValue({ id: 'activity-1' });

    const id = await createActivity('project-1', {
      type: 'task_create',
      teamId: 'team-1',
      userId: 'user-1',
      userName: 'Alice',
      text: 'created',
    });

    expect(mocks.addDoc).toHaveBeenCalledWith(
      'activities-col',
      expect.objectContaining({
        projectId: 'project-1',
        type: 'task_create',
        createdAt: 'server-ts',
      })
    );
    expect(id).toBe('activity-1');
  });

  it('creates a current-user activity with a fallback display name', async () => {
    mocks.getCurrentUser.mockReturnValue({
      uid: 'user-1',
      displayName: '',
      email: 'alice@example.com',
    });
    mocks.addDoc.mockResolvedValue({ id: 'activity-2' });

    await createCurrentUserActivity('project-1', {
      type: 'task_update',
      teamId: 'team-1',
      text: 'updated',
    });

    expect(mocks.addDoc).toHaveBeenCalledWith(
      'activities-col',
      expect.objectContaining({
        userId: 'user-1',
        userName: '',
        type: 'task_update',
      })
    );
  });
});
