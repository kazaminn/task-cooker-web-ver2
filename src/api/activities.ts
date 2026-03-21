import {
  addDoc,
  collection,
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  limit as firestoreLimit,
} from 'firebase/firestore';
import type { Activity, ActivityFormInput } from '@/types/types';
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
  callback: (activities: Activity[]) => void
): () => void {
  const q = query(
    activitiesCol(projectId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data()));
  });
}

export function subscribeAllActivities(
  limitCount: number,
  callback: (activities: Activity[]) => void
): () => void {
  const q = query(
    collectionGroup(db, 'activities').withConverter(activityConverter),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data()));
  });
}

export function subscribeUserActivities(
  userId: string,
  callback: (activities: Activity[]) => void
): () => void {
  const q = query(
    collectionGroup(db, 'activities').withConverter(activityConverter),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data()));
  });
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
