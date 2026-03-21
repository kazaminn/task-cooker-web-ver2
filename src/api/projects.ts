import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { projectConverter } from '@/libs/firestore-converters';
import type { Project, ProjectFormInput } from '@/types/types';
import { db } from './firebase';

const projectsCol = collection(db, 'projects').withConverter(projectConverter);

export function subscribeProjects(
  userId: string,
  callback: (projects: Project[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    projectsCol,
    where('memberIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data())),
    (err) => onError?.(err)
  );
}

export function subscribeProject(
  projectId: string,
  callback: (project: Project | null) => void,
  onError?: (error: Error) => void
): () => void {
  const ref = doc(db, 'projects', projectId).withConverter(projectConverter);
  return onSnapshot(
    ref,
    (snap) => callback(snap.exists() ? snap.data() : null),
    (err) => onError?.(err)
  );
}

export async function createProject(
  data: ProjectFormInput & {
    teamId: string;
    ownerId: string;
    memberIds: string[];
  }
): Promise<string> {
  const docRef = await addDoc(projectsCol, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as unknown as Project);
  return docRef.id;
}

export async function updateProject(
  projectId: string,
  data: Partial<ProjectFormInput>
): Promise<void> {
  const ref = doc(db, 'projects', projectId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', projectId));
}
