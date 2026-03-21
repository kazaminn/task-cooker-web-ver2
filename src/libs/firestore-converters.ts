/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument -- Firestore converters handle untyped DocumentData by design */
import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type { Project, Task, Mix, Team } from '@/types/types';

function toDate(value: Timestamp | Date): Date {
  return 'toDate' in value ? value.toDate() : value;
}

export const projectConverter: FirestoreDataConverter<Project> = {
  toFirestore(project: Project) {
    const { id: _id, ...data } = project as Project & { id?: string };
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Project {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      slug: data.slug,
      teamId: data.teamId,
      name: data.name,
      overview: data.overview ?? '',
      status: data.status ?? 'planning',
      ownerId: data.ownerId,
      memberIds: data.memberIds ?? [],
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};

export const taskConverter: FirestoreDataConverter<Task> = {
  toFirestore(task: Task) {
    const { id: _id, ...data } = task as Task & { id?: string };
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Task {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      displayId: data.displayId ?? 0,
      projectRef: data.projectRef,
      teamId: data.teamId,
      title: data.title,
      description: data.description ?? '',
      status: data.status ?? 'order',
      priority: data.priority ?? 'medium',
      assigneeId: data.assigneeId,
      dueDate: data.dueDate ? toDate(data.dueDate) : undefined,
      linkedTaskIds: data.linkedTaskIds ?? [],
      position: data.position ?? 0,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};

export const teamConverter: FirestoreDataConverter<Team> = {
  toFirestore(team: Team) {
    const { id: _id, ...data } = team as Team & { id?: string };
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Team {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      type: data.type ?? 'personal',
      ownerId: data.ownerId,
      memberIds: data.memberIds ?? [],
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};

export const mixConverter: FirestoreDataConverter<Mix> = {
  toFirestore(mix: Mix) {
    const { id: _id, ...data } = mix as Mix & { id?: string };
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Mix {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      projectRef: data.projectRef,
      authorId: data.authorId,
      author: data.author,
      title: data.title,
      status: data.status ?? 'open',
      isPublic: data.isPublic ?? false,
      lastActivityAt: toDate(data.lastActivityAt),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};
