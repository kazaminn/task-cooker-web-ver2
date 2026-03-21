import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { createCurrentUserActivity } from '@/api/activities';
import { taskConverter } from '@/libs/firestore-converters';
import { TASK_STATUS_META } from '@/types/constants';
import type { Task, TaskFormInput } from '@/types/types';
import { db } from './firebase';

function tasksCol(projectId: string) {
  return collection(db, 'projects', projectId, 'tasks').withConverter(
    taskConverter
  );
}

export function subscribeTasks(
  projectId: string,
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(tasksCol(projectId), orderBy('position', 'asc'));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data())),
    (err) => onError?.(err)
  );
}

export function subscribeTask(
  projectId: string,
  taskId: string,
  callback: (task: Task | null) => void,
  onError?: (error: Error) => void
): () => void {
  const ref = doc(db, 'projects', projectId, 'tasks', taskId).withConverter(
    taskConverter
  );
  return onSnapshot(
    ref,
    (snap) => callback(snap.exists() ? snap.data() : null),
    (err) => onError?.(err)
  );
}

export function subscribeTasksCollectionGroup(
  statuses: string[],
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collectionGroup(db, 'tasks').withConverter(taskConverter),
    where('status', 'in', statuses)
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data())),
    (err) => onError?.(err)
  );
}

export function subscribeAllTasksCollectionGroup(
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collectionGroup(db, 'tasks').withConverter(taskConverter));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data())),
    (err) => onError?.(err)
  );
}

async function getNextDisplayId(projectId: string): Promise<number> {
  const counterRef = doc(db, 'projects', projectId, 'counters', 'task');
  return runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const current = counterDoc.exists()
      ? (counterDoc.data().current as number)
      : 0;
    const next = current + 1;
    transaction.set(counterRef, { current: next });
    return next;
  });
}

export async function createTask(
  projectId: string,
  teamId: string,
  data: TaskFormInput
): Promise<string> {
  const displayId = await getNextDisplayId(projectId);
  const col = tasksCol(projectId);
  const snap = await getDoc(doc(db, 'projects', projectId, 'counters', 'task'));
  const position = snap.exists()
    ? (snap.data().current as number) * 1000
    : 1000;

  const docRef = await addDoc(col, {
    ...data,
    displayId,
    projectRef: projectId,
    teamId,
    linkedTaskIds: [],
    position,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as unknown as Task);

  await createCurrentUserActivity(projectId, {
    type: 'task_create',
    teamId,
    text: `タスク #${displayId}「${data.title}」を作成しました`,
  });

  return docRef.id;
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<TaskFormInput & { position: number }>
): Promise<void> {
  const readRef = doc(db, 'projects', projectId, 'tasks', taskId).withConverter(
    taskConverter
  );
  const writeRef = doc(db, 'projects', projectId, 'tasks', taskId);
  const currentSnap = await getDoc(readRef);
  const currentTask = currentSnap.exists() ? currentSnap.data() : null;
  await updateDoc(writeRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  if (!currentTask) {
    return;
  }

  const nextTitle = data.title ?? currentTask.title;
  const nextStatus = data.status ?? currentTask.status;
  const statusChanged = data.status && data.status !== currentTask.status;
  const activityType =
    statusChanged && nextStatus === 'serve' ? 'task_serve' : 'task_update';
  const text = statusChanged
    ? `タスク #${currentTask.displayId}「${nextTitle}」を${TASK_STATUS_META[nextStatus].ja}にしました`
    : `タスク #${currentTask.displayId}「${nextTitle}」を更新しました`;

  await createCurrentUserActivity(projectId, {
    type: activityType,
    teamId: currentTask.teamId,
    text,
  });
}

export async function deleteTask(
  projectId: string,
  taskId: string
): Promise<void> {
  const readRef = doc(db, 'projects', projectId, 'tasks', taskId).withConverter(
    taskConverter
  );
  const writeRef = doc(db, 'projects', projectId, 'tasks', taskId);
  const currentSnap = await getDoc(readRef);
  const currentTask = currentSnap.exists() ? currentSnap.data() : null;
  await deleteDoc(writeRef);

  if (!currentTask) {
    return;
  }

  await createCurrentUserActivity(projectId, {
    type: 'task_delete',
    teamId: currentTask.teamId,
    text: `タスク #${currentTask.displayId}「${currentTask.title}」を削除しました`,
  });
}
