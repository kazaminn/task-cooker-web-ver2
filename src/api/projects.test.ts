import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createProject,
  deleteProject,
  subscribeProject,
  subscribeProjects,
  updateProject,
} from './projects';

interface SnapshotDoc<T> {
  data: () => T;
  exists: () => boolean;
}

interface SnapshotValue<T> {
  docs: SnapshotDoc<T>[];
}

const mocks = vi.hoisted(() => {
  const collectionMock = vi.fn().mockImplementation(() => ({
    withConverter: vi.fn().mockReturnValue('projects-col'),
  }));
  return {
    addDoc: vi.fn(),
    collection: collectionMock,
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn(),
    query: vi.fn(),
    serverTimestamp: vi.fn(),
    updateDoc: vi.fn(),
    where: vi.fn(),
    createCurrentUserActivity: vi.fn(),
    db: { name: 'db' },
    projectConverter: { name: 'projectConverter' },
  };
});

vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc,
  collection: mocks.collection,
  deleteDoc: mocks.deleteDoc,
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  limit: mocks.limit,
  onSnapshot: mocks.onSnapshot,
  query: mocks.query,
  serverTimestamp: mocks.serverTimestamp,
  updateDoc: mocks.updateDoc,
  where: mocks.where,
}));

vi.mock('@/api/activities', () => ({
  createCurrentUserActivity: mocks.createCurrentUserActivity,
}));

vi.mock('@/libs/firestore-converters', () => ({
  projectConverter: mocks.projectConverter,
}));

vi.mock('./firebase', () => ({
  db: mocks.db,
}));

describe('api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.serverTimestamp.mockReturnValue('server-ts');
    mocks.collection.mockImplementation(() => ({
      withConverter: vi.fn().mockReturnValue('projects-col'),
    }));
    mocks.where.mockImplementation((...args) => ({ type: 'where', args }));
    mocks.limit.mockImplementation((count: number) => ({
      type: 'limit',
      count,
    }));
    mocks.query.mockImplementation((...args) => ({ type: 'query', args }));
    mocks.doc.mockImplementation((...segments) => ({
      path: segments.join('/'),
      withConverter: vi.fn().mockReturnValue({
        path: segments.join('/'),
        converted: true,
      }),
    }));
  });

  describe('subscribeProjects', () => {
    it('subscribes with memberIds filter and sorts by updatedAt desc', () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();
      const now = new Date();
      const earlier = new Date(now.getTime() - 10000);
      const projectA = { id: 'p-1', name: 'Old', updatedAt: earlier };
      const projectB = { id: 'p-2', name: 'New', updatedAt: now };

      mocks.onSnapshot.mockImplementation(
        (
          _query: unknown,
          onNext: (value: SnapshotValue<typeof projectA>) => void
        ) => {
          onNext({
            docs: [
              { data: () => projectA, exists: () => true },
              { data: () => projectB, exists: () => true },
            ],
          });
          return unsubscribe;
        }
      );

      const result = subscribeProjects('user-1', callback);

      expect(mocks.where).toHaveBeenCalledWith(
        'memberIds',
        'array-contains',
        'user-1'
      );
      expect(callback).toHaveBeenCalledWith([projectB, projectA]);
      expect(result).toBe(unsubscribe);
    });

    it('forwards errors to the onError callback', () => {
      const callback = vi.fn();
      const onError = vi.fn();
      const error = new Error('permission-denied');

      mocks.onSnapshot.mockImplementation(
        (_query: unknown, _onNext: unknown, onErr: (e: Error) => void) => {
          onErr(error);
          return vi.fn();
        }
      );

      subscribeProjects('user-1', callback, onError);

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('subscribeProject', () => {
    it('returns project data when doc exists by ID', () => {
      const callback = vi.fn();
      const project = { id: 'p-1', name: 'My Project' };

      mocks.onSnapshot.mockImplementation(
        (
          _ref: unknown,
          onNext: (snap: {
            exists: () => boolean;
            data: () => typeof project;
          }) => void
        ) => {
          onNext({ exists: () => true, data: () => project });
          return vi.fn();
        }
      );

      subscribeProject('p-1', callback);

      expect(callback).toHaveBeenCalledWith(project);
    });

    it('falls back to slug query when doc does not exist', () => {
      const callback = vi.fn();
      const project = { id: 'p-1', name: 'By Slug' };
      let slugOnNext:
        | ((snap: SnapshotValue<typeof project>) => void)
        | undefined;

      mocks.onSnapshot.mockImplementationOnce(
        (_ref: unknown, onNext: (snap: { exists: () => boolean }) => void) => {
          onNext({ exists: () => false });
          return vi.fn();
        }
      );

      mocks.onSnapshot.mockImplementationOnce(
        (
          _query: unknown,
          onNext: (snap: SnapshotValue<typeof project>) => void
        ) => {
          slugOnNext = onNext;
          return vi.fn();
        }
      );

      subscribeProject('my-slug', callback);

      slugOnNext?.({
        docs: [{ data: () => project, exists: () => true }],
      });

      expect(mocks.where).toHaveBeenCalledWith('slug', '==', 'my-slug');
      expect(mocks.limit).toHaveBeenCalledWith(1);
      expect(callback).toHaveBeenCalledWith(project);
    });

    it('returns null from slug query when no match', () => {
      const callback = vi.fn();

      mocks.onSnapshot.mockImplementationOnce(
        (_ref: unknown, onNext: (snap: { exists: () => boolean }) => void) => {
          onNext({ exists: () => false });
          return vi.fn();
        }
      );

      mocks.onSnapshot.mockImplementationOnce(
        (_query: unknown, onNext: (snap: SnapshotValue<never>) => void) => {
          onNext({ docs: [] });
          return vi.fn();
        }
      );

      subscribeProject('nonexistent', callback);

      expect(callback).toHaveBeenCalledWith(null);
    });

    it('cleans up both listeners on unsubscribe', () => {
      const idUnsub = vi.fn();
      const slugUnsub = vi.fn();

      mocks.onSnapshot.mockImplementationOnce(
        (_ref: unknown, onNext: (snap: { exists: () => boolean }) => void) => {
          onNext({ exists: () => false });
          return idUnsub;
        }
      );

      mocks.onSnapshot.mockImplementationOnce(() => slugUnsub);

      const unsub = subscribeProject('my-slug', vi.fn());
      unsub();

      expect(idUnsub).toHaveBeenCalled();
      expect(slugUnsub).toHaveBeenCalled();
    });
  });

  describe('createProject', () => {
    it('creates a project doc and records activity', async () => {
      mocks.addDoc.mockResolvedValue({ id: 'p-new' });

      const id = await createProject({
        slug: 'my-project',
        name: 'My Project',
        overview: '',
        status: 'planning',
        teamId: 'team-1',
        ownerId: 'user-1',
        memberIds: ['user-1'],
      });

      expect(mocks.addDoc).toHaveBeenCalledWith(
        'projects-col',
        expect.objectContaining({
          slug: 'my-project',
          name: 'My Project',
          teamId: 'team-1',
          createdAt: 'server-ts',
          updatedAt: 'server-ts',
        })
      );
      expect(mocks.createCurrentUserActivity).toHaveBeenCalledWith('p-new', {
        type: 'project_create',
        teamId: 'team-1',
        projectId: 'p-new',
        text: 'プロジェクト「My Project」を作成しました',
      });
      expect(id).toBe('p-new');
    });
  });

  describe('updateProject', () => {
    it('updates project and records activity with project name', async () => {
      mocks.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ name: 'Old Name', teamId: 'team-1' }),
      });

      await updateProject('p-1', { name: 'New Name' });

      expect(mocks.updateDoc).toHaveBeenCalledWith(expect.any(Object), {
        name: 'New Name',
        updatedAt: 'server-ts',
      });
      expect(mocks.createCurrentUserActivity).toHaveBeenCalledWith('p-1', {
        type: 'project_update',
        teamId: 'team-1',
        projectId: 'p-1',
        text: 'プロジェクト「New Name」を更新しました',
      });
    });

    it('uses current name when update data has no name', async () => {
      mocks.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ name: 'Current', teamId: 'team-1' }),
      });

      await updateProject('p-1', { overview: 'updated' });

      expect(mocks.createCurrentUserActivity).toHaveBeenCalledWith(
        'p-1',
        expect.objectContaining({
          text: 'プロジェクト「Current」を更新しました',
        })
      );
    });

    it('skips activity when project does not exist', async () => {
      mocks.getDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      await updateProject('p-missing', { name: 'X' });

      expect(mocks.updateDoc).toHaveBeenCalled();
      expect(mocks.createCurrentUserActivity).not.toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('records activity before deleting the project', async () => {
      const callOrder: string[] = [];
      mocks.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ name: 'Doomed', teamId: 'team-1' }),
      });
      mocks.createCurrentUserActivity.mockImplementation(() => {
        callOrder.push('activity');
        return Promise.resolve();
      });
      mocks.deleteDoc.mockImplementation(() => {
        callOrder.push('delete');
        return Promise.resolve();
      });

      await deleteProject('p-1');

      expect(mocks.createCurrentUserActivity).toHaveBeenCalledWith('p-1', {
        type: 'project_delete',
        teamId: 'team-1',
        projectId: 'p-1',
        text: 'プロジェクト「Doomed」を削除しました',
      });
      expect(mocks.deleteDoc).toHaveBeenCalled();
      expect(callOrder).toEqual(['activity', 'delete']);
    });

    it('skips activity and still deletes when project does not exist', async () => {
      mocks.getDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      await deleteProject('p-missing');

      expect(mocks.createCurrentUserActivity).not.toHaveBeenCalled();
      expect(mocks.deleteDoc).toHaveBeenCalled();
    });
  });
});
