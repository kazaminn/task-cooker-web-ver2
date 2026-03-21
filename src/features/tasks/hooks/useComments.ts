import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  subscribeComments,
  createComment,
  deleteComment,
  type Comment,
} from '@/api/comments';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/hooks/queryKeys';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';

export function useCommentsQuery(
  projectId: string | undefined,
  taskId: string | undefined
) {
  const subscribeToComments = useCallback(
    (cb: (data: Comment[]) => void, onError?: (error: Error) => void) => {
      if (!projectId || !taskId)
        return () => {
          /* noop */
        };
      return subscribeComments(projectId, taskId, cb, onError);
    },
    [projectId, taskId]
  );

  const { data, isLoading, error } = useFirestoreSubscription<Comment>(
    queryKeys.comments.list(projectId, taskId),
    subscribeToComments,
    { enabled: Boolean(projectId && taskId) }
  );

  return { comments: data, isLoading, error };
}

/** @deprecated Use useCommentsQuery */
export const useComments = useCommentsQuery;

export function useCommentMutations(projectId: string, taskId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (body: string) => {
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(projectId, taskId),
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return deleteComment(projectId, taskId, commentId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(projectId, taskId),
      });
    },
  });

  return {
    create: createMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    createMutation,
    removeMutation,
  };
}
