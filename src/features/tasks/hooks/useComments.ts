import { useCallback } from 'react';
import {
  subscribeComments,
  createComment,
  deleteComment,
  type Comment,
} from '@/api/comments';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';

export function useComments(
  projectId: string | undefined,
  taskId: string | undefined
) {
  const { data, isLoading, error } = useFirestoreSubscription<Comment>(
    ['comments', projectId, taskId],
    (cb) => {
      if (!projectId || !taskId)
        return () => {
          /* noop */
        };
      return subscribeComments(projectId, taskId, cb);
    }
  );

  return { comments: data, isLoading, error };
}

export function useCommentMutations(projectId: string, taskId: string) {
  const { user } = useAuth();

  const create = useCallback(
    async (body: string) => {
      if (!user) throw new Error('Not authenticated');
      return createComment(projectId, taskId, {
        taskId,
        authorId: user.uid,
        authorName: user.displayName ?? 'Anonymous',
        authorPhotoURL: user.photoURL ?? undefined,
        authorType: 'user',
        body,
      });
    },
    [projectId, taskId, user]
  );

  const remove = useCallback(
    async (commentId: string) => {
      return deleteComment(projectId, taskId, commentId);
    },
    [projectId, taskId]
  );

  return { create, remove };
}
