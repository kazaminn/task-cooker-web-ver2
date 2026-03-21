import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import type { User } from '@/types/types';
import { db } from './firebase';
import { userConverter } from './utils';

function userRef(userId: string) {
  return doc(db, 'users', userId).withConverter(userConverter);
}

export async function getUser(userId: string): Promise<User | null> {
  const snap = await getDoc(userRef(userId));
  return snap.exists() ? snap.data() : null;
}

export async function createUser(
  userId: string,
  data: Pick<User, 'displayName' | 'email' | 'photoURL'>
): Promise<void> {
  await setDoc(userRef(userId), {
    ...data,
    preferences: { theme: 'system', fontSize: 'medium', highContrast: false },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as unknown as User);
}

export async function updateUser(
  userId: string,
  data: Partial<Pick<User, 'displayName' | 'bio' | 'photoURL'>>
): Promise<void> {
  await updateDoc(userRef(userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
