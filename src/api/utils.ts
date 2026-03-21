import {
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore';
import type { Activity, User } from '@/types/types';

function toDate(value: Timestamp | Date): Date {
  return 'toDate' in value ? value.toDate() : value;
}

export interface Comment {
  readonly id?: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  authorType: 'user' | 'claude' | 'codex';
  body: string;
  createdAt: Date;
}

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user: User) {
    const { id: _id, ...data } = user as User & { id?: string };
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): User {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      displayName: data.displayName ?? '',
      email: data.email ?? '',
      photoURL: data.photoURL,
      bio: data.bio,
      preferences: data.preferences ?? {
        theme: 'system',
        fontSize: 'medium',
        highContrast: false,
      },
      lastActiveProjectId: data.lastActiveProjectId,
      lastActiveTeamId: data.lastActiveTeamId,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};

export const activityConverter: FirestoreDataConverter<Activity> = {
  toFirestore(activity: Activity) {
    const { id: _id, ...data } = activity as Activity & { id?: string };
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Activity {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      teamId: data.teamId,
      projectId: data.projectId,
      type: data.type,
      userId: data.userId,
      userName: data.userName,
      text: data.text ?? '',
      createdAt: toDate(data.createdAt),
    };
  },
};

export const commentConverter: FirestoreDataConverter<Comment> = {
  toFirestore(comment: Comment) {
    const { id: _id, ...data } = comment as Comment & { id?: string };
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Comment {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      taskId: data.taskId ?? '',
      authorId: data.authorId,
      authorName: data.authorName,
      authorPhotoURL: data.authorPhotoURL,
      authorType: data.authorType ?? 'user',
      body: data.body ?? '',
      createdAt: toDate(data.createdAt),
    };
  },
};
