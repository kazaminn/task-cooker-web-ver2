import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { type Comment, commentConverter } from './utils';

function commentsCol(projectId: string, taskId: string) {
  return collection(
    db,
    'projects',
    projectId,
    'tasks',
    taskId,
    'comments'
  ).withConverter(commentConverter);
}

export function subscribeComments(
  projectId: string,
  taskId: string,
  callback: (comments: Comment[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(commentsCol(projectId, taskId), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => d.data()));
    },
    (error) => onError?.(error)
  );
}

export async function createComment(
  projectId: string,
  taskId: string,
  data: Omit<Comment, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(commentsCol(projectId, taskId), {
    ...data,
    createdAt: serverTimestamp(),
  } as unknown as Comment);
  return docRef.id;
}

export async function deleteComment(
  projectId: string,
  taskId: string,
  commentId: string
): Promise<void> {
  await deleteDoc(
    doc(db, 'projects', projectId, 'tasks', taskId, 'comments', commentId)
  );
}

export type { Comment } from './utils';
