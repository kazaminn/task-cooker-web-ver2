import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  subscribeProjects,
  subscribeProject,
  createProject,
  updateProject,
  deleteProject,
} from '@/api/projects';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/hooks/queryKeys';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import type { Project, ProjectFormInput } from '@/types/types';

export function useProjectsQuery() {
  const { user } = useAuth();
  const userId = user?.uid ?? '';
  const subscribeToProjects = useCallback(
    (cb: (data: Project[]) => void, onError?: (error: Error) => void) => {
      if (!userId)
        return () => {
          /* noop */
        };
      return subscribeProjects(userId, cb, onError);
    },
    [userId]
  );

  const { data, isLoading, error } = useFirestoreSubscription<Project>(
    queryKeys.projects.list(userId),
    subscribeToProjects,
    { enabled: Boolean(userId) }
  );

  return { projects: data, isLoading, error };
}

export function useProjectQuery(projectId: string | undefined) {
  const subscribeToProject = useCallback(
    (cb: (data: Project[]) => void, onError?: (error: Error) => void) => {
      if (!projectId)
        return () => {
          /* noop */
        };
      return subscribeProject(
        projectId,
        (project) => {
          cb(project ? [project] : []);
        },
        onError
      );
    },
    [projectId]
  );

  const { data, isLoading, error } = useFirestoreSubscription<Project>(
    queryKeys.projects.detail(projectId),
    subscribeToProject,
    { enabled: Boolean(projectId) }
  );

  return { project: data?.[0] ?? null, isLoading, error };
}

/** @deprecated Use useProjectsQuery */
export const useProjects = useProjectsQuery;
/** @deprecated Use useProjectQuery */
export const useProject = useProjectQuery;

export function useProjectMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormInput & { teamId: string }) => {
      if (!user) throw new Error('Not authenticated');
      return createProject({
        ...data,
        ownerId: user.uid,
        memberIds: [user.uid],
      });
    },
    onSuccess: async () => {
      if (!user) return;
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(user.uid),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      projectId,
      data,
    }: {
      projectId: string;
      data: Partial<ProjectFormInput>;
    }) => {
      return updateProject(projectId, data);
    },
    onSuccess: async (_, { projectId }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (projectId: string) => deleteProject(projectId),
    onSuccess: async (_, projectId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.removeQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: (projectId: string, data: Partial<ProjectFormInput>) =>
      updateMutation.mutateAsync({ projectId, data }),
    remove: removeMutation.mutateAsync,
    createMutation,
    updateMutation,
    removeMutation,
  };
}
