import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { teamConverter } from '@/libs/firestore-converters';
import type { Team } from '@/types/types';
import { db } from './firebase';

const teamsCol = collection(db, 'teams').withConverter(teamConverter);

export function subscribeTeams(
  userId: string,
  callback: (teams: Team[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(teamsCol, where('memberIds', 'array-contains', userId));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => d.data()));
    },
    (error) => onError?.(error)
  );
}

export function subscribeTeam(
  teamId: string,
  callback: (team: Team | undefined) => void,
  onError?: (error: Error) => void
): () => void {
  const ref = doc(db, 'teams', teamId).withConverter(teamConverter);
  return onSnapshot(
    ref,
    (snap) => {
      callback(snap.exists() ? snap.data() : undefined);
    },
    (error) => onError?.(error)
  );
}

export async function createTeam(data: {
  name: string;
  type: 'personal' | 'team';
  ownerId: string;
  memberIds: string[];
}): Promise<string> {
  const docRef = await addDoc(teamsCol, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as unknown as Team);
  return docRef.id;
}

export async function createPersonalTeam(userId: string): Promise<string> {
  return createTeam({
    name: 'Personal',
    type: 'personal',
    ownerId: userId,
    memberIds: [userId],
  });
}

export async function deleteTeam(teamId: string): Promise<void> {
  await deleteDoc(doc(db, 'teams', teamId));
}

export async function addMember(teamId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'teams', teamId), {
    memberIds: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
}

export async function removeMember(
  teamId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, 'teams', teamId), {
    memberIds: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });
}
