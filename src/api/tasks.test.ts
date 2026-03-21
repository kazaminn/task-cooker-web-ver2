import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTask, deleteTask, subscribeTasks, updateTask } from './tasks';

interface SnapshotDoc<T> {
  data: () => T;
}

interface SnapshotValue<T> {
  docs: SnapshotDoc<T>[];
}

interface CounterData {
  current: number;
}

interface StoredTaskSummary {
  id: string;
  displayId: number;
  title: string;
  teamId: string;
  status?: 'order' | 'prep' | 'cook' | 'serve';
}

const mocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  collectionGroup: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn(),
  createCurrentUserActivity: vi.fn(),
  db: { name: 'db' },
  taskConverter: { name: 'taskConverter' },
}));

vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc,
  collection: mocks.collection,
  collectionGroup: mocks.collectionGroup,
  deleteDoc: mocks.deleteDoc,
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  onSnapshot: mocks.onSnapshot,
  orderBy: mocks.orderBy,
  query: mocks.query,
  runTransaction: mocks.runTransaction,
  serverTimestamp: mocks.serverTimestamp,
  updateDoc: mocks.updateDoc,
  where: mocks.where,
}));

vi.mock('@/api/activities', () => ({
  createCurrentUserActivity: mocks.createCurrentUserActivity,
}));

vi.mock('@/libs/firestore-converters', () => ({
  taskConverter: mocks.taskConverter,
}));

vi.mock('./firebase', () => ({
  db: mocks.db,
}));

describe('api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.serverTimestamp.mockReturnValue('server-ts');
    mocks.collection.mockImplementation(() => ({
      withConverter: vi.fn().mockReturnValue('tasks-col'),
    }));
    mocks.collectionGroup.mockImplementation(() => ({
      withConverter: vi.fn().mockReturnValue('tasks-group'),
    }));
    mocks.orderBy.mockImplementation((...args) => ({ type: 'orderBy', args }));
    mocks.where.mockImplementation((...args) => ({ type: 'where', args }));
    mocks.query.mockImplementation((...args) => ({ type: 'query', args }));
    mocks.doc.mockImplementation((...segments) => ({
      path: segments.join('/'),
      withConverter: vi.fn().mockReturnValue({
        path: segments.join('/'),
        converted: true,
      }),
    }));
  });

  it('subscribes to project tasks in position order', () => {
    const callback = vi.fn();
    const unsubscribe = vi.fn();
    const task = {
      id: 'task-1',
      title: 'Prep ingredients',
      status: 'prep',
    };

    mocks.onSnapshot.mockImplementation(
      (
        _query: unknown,
        onNext: (value: SnapshotValue<typeof task>) => void
      ) => {
        onNext({
          docs: [{ data: () => task }],
        });
        return unsubscribe;
      }
    );

    const result = subscribeTasks('project-1', callback);

    expect(mocks.orderBy).toHaveBeenCalledWith('position', 'asc');
    expect(callback).toHaveBeenCalledWith([task]);
    expect(result).toBe(unsubscribe);
  });

  it('creates a task with displayId, position, and activity log', async () => {
    const transaction = {
      get: vi.fn().mockResolvedValue({
        exists: () => true,
        data: (): CounterData => ({ current: 2 }),
      }),
      set: vi.fn(),
    };

    mocks.runTransaction.mockImplementation(
      (
        _db: unknown,
        callback: (
          currentTransaction: typeof transaction
        ) => number | Promise<number>
      ) => callback(transaction)
    );
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: (): CounterData => ({ current: 3 }),
    });
    mocks.addDoc.mockResolvedValue({ id: 'task-3' });

    const taskId = await createTask('project-1', 'team-1', {
      title: 'Plate dessert',
      status: 'order',
      priority: 'medium',
    });

    expect(transaction.set).toHaveBeenCalledWith(expect.any(Object), {
      current: 3,
    });
    expect(
      (transaction.set.mock.calls[0]?.[0] as { path: string }).path
    ).toContain('projects/project-1/counters/task');
    expect(mocks.addDoc).toHaveBeenCalledWith(
      'tasks-col',
      expect.objectContaining({
        title: 'Plate dessert',
        displayId: 3,
        projectRef: 'project-1',
        teamId: 'team-1',
        position: 3000,
        createdAt: 'server-ts',
        updatedAt: 'server-ts',
      })
    );
    expect(mocks.createCurrentUserActivity).toHaveBeenCalledWith('project-1', {
      type: 'task_create',
      teamId: 'team-1',
      text: 'タスク #3「Plate dessert」を作成しました',
    });
    expect(taskId).toBe('task-3');
  });

  it('records a serve activity when status changes to serve', async () => {
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: (): StoredTaskSummary => ({
        id: 'task-1',
        displayId: 7,
        title: 'Finish sauce',
        status: 'cook',
        teamId: 'team-1',
      }),
    });

    await updateTask('project-1', 'task-1', { status: 'serve' });

    expect(mocks.updateDoc).toHaveBeenCalledWith(expect.any(Object), {
      status: 'serve',
      updatedAt: 'server-ts',
    });
    expect(
      (mocks.updateDoc.mock.calls[0]?.[0] as { path: string }).path
    ).toContain('projects/project-1/tasks/task-1');
    expect(mocks.createCurrentUserActivity).toHaveBeenCalledWith('project-1', {
      type: 'task_serve',
      teamId: 'team-1',
      text: 'タスク #7「Finish sauce」を提供済みにしました',
    });
  });

  it('records a delete activity with the deleted task title', async () => {
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: (): StoredTaskSummary => ({
        id: 'task-9',
        displayId: 9,
        title: 'Archive recipe',
        teamId: 'team-9',
      }),
    });

    await deleteTask('project-1', 'task-9');

    expect(mocks.deleteDoc).toHaveBeenCalledWith(expect.any(Object));
    expect(
      (mocks.deleteDoc.mock.calls[0]?.[0] as { path: string }).path
    ).toContain('projects/project-1/tasks/task-9');
    expect(mocks.createCurrentUserActivity).toHaveBeenCalledWith('project-1', {
      type: 'task_delete',
      teamId: 'team-9',
      text: 'タスク #9「Archive recipe」を削除しました',
    });
  });
});
