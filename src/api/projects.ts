import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { createCurrentUserActivity } from '@/api/activities';
import { projectConverter } from '@/libs/firestore-converters';
import type { Project, ProjectFormInput } from '@/types/types';
import { db } from './firebase';

const projectsCol = collection(db, 'projects').withConverter(projectConverter);

export function subscribeProjects(
  userId: string,
  callback: (projects: Project[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(projectsCol, where('memberIds', 'array-contains', userId));
  return onSnapshot(
    q,
    (snap) =>
      callback(
        snap.docs
          .map((d) => d.data())
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      ),
    (err) => onError?.(err)
  );
}

export function subscribeProject(
  projectKey: string,
  callback: (project: Project | null) => void,
  onError?: (error: Error) => void
): () => void {
  const ref = doc(db, 'projects', projectKey).withConverter(projectConverter);
  let slugUnsubscribe: (() => void) | undefined;
  const unsubscribe = onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        slugUnsubscribe?.();
        slugUnsubscribe = undefined;
        callback(snap.data());
        return;
      }

      if (slugUnsubscribe) {
        return;
      }

      const slugQuery = query(
        projectsCol,
        where('slug', '==', projectKey),
        limit(1)
      );
      slugUnsubscribe = onSnapshot(
        slugQuery,
        (slugSnap) => callback(slugSnap.docs[0]?.data() ?? null),
        (err) => onError?.(err)
      );
    },
    (err) => onError?.(err)
  );

  return () => {
    unsubscribe();
    slugUnsubscribe?.();
  };
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

  await createCurrentUserActivity(docRef.id, {
    type: 'project_create',
    teamId: data.teamId,
    projectId: docRef.id,
    text: `プロジェクト「${data.name}」を作成しました`,
  });

  return docRef.id;
}

export async function updateProject(
  projectId: string,
  data: Partial<ProjectFormInput>
): Promise<void> {
  const readRef = doc(db, 'projects', projectId).withConverter(
    projectConverter
  );
  const writeRef = doc(db, 'projects', projectId);
  const currentSnap = await getDoc(readRef);
  const currentProject = currentSnap.exists() ? currentSnap.data() : null;
  await updateDoc(writeRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  if (!currentProject) {
    return;
  }

  await createCurrentUserActivity(projectId, {
    type: 'project_update',
    teamId: currentProject.teamId,
    projectId,
    text: `プロジェクト「${data.name ?? currentProject.name}」を更新しました`,
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  const readRef = doc(db, 'projects', projectId).withConverter(
    projectConverter
  );
  const writeRef = doc(db, 'projects', projectId);
  const currentSnap = await getDoc(readRef);
  const currentProject = currentSnap.exists() ? currentSnap.data() : null;

  if (currentProject) {
    await createCurrentUserActivity(projectId, {
      type: 'project_delete',
      teamId: currentProject.teamId,
      projectId,
      text: `プロジェクト「${currentProject.name}」を削除しました`,
    });
  }

  await deleteDoc(writeRef);
}
