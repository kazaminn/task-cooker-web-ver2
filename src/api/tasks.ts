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
import { taskConverter } from '@/libs/firestore-converters';
import type { Task, TaskFormInput } from '@/types/types';
import { db } from './firebase';

function tasksCol(projectId: string) {
  return collection(db, 'projects', projectId, 'tasks').withConverter(
    taskConverter
  );
}

export function subscribeTasks(
  projectId: string,
  callback: (tasks: Task[]) => void
): () => void {
  const q = query(tasksCol(projectId), orderBy('position', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data()));
  });
}

export function subscribeTask(
  projectId: string,
  taskId: string,
  callback: (task: Task | null) => void
): () => void {
  const ref = doc(db, 'projects', projectId, 'tasks', taskId).withConverter(
    taskConverter
  );
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export function subscribeTasksCollectionGroup(
  statuses: string[],
  callback: (tasks: Task[]) => void
): () => void {
  const q = query(
    collectionGroup(db, 'tasks').withConverter(taskConverter),
    where('status', 'in', statuses)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data()));
  });
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
  return docRef.id;
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<TaskFormInput & { position: number }>
): Promise<void> {
  const ref = doc(db, 'projects', projectId, 'tasks', taskId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(
  projectId: string,
  taskId: string
): Promise<void> {
  await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
}
