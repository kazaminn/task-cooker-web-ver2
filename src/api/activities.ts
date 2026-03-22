import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  limit as firestoreLimit,
} from 'firebase/firestore';
import type { Activity, ActivityFormInput } from '@/types/types';
import { getCurrentUser } from './auth';
import { db } from './firebase';
import { activityConverter } from './utils';

function activitiesCol(projectId: string) {
  return collection(db, 'projects', projectId, 'activities').withConverter(
    activityConverter
  );
}

export function subscribeProjectActivities(
  projectId: string,
  limitCount: number,
  callback: (activities: Activity[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    activitiesCol(projectId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limitCount)
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data())),
    (err) => onError?.(err)
  );
}

export async function createActivity(
  projectId: string,
  data: ActivityFormInput
): Promise<string> {
  const docRef = await addDoc(activitiesCol(projectId), {
    ...data,
    projectId,
    createdAt: serverTimestamp(),
  } as unknown as Activity);
  return docRef.id;
}

export async function createCurrentUserActivity(
  projectId: string,
  data: Omit<ActivityFormInput, 'userId' | 'userName'>
): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) {
    return null;
  }

  return createActivity(projectId, {
    ...data,
    userId: user.uid,
    userName: user.displayName ?? user.email ?? 'Unknown user',
  });
}
