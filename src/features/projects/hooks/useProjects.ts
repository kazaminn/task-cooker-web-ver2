import { useCallback } from 'react';
import {
  subscribeProjects,
  subscribeProject,
  createProject,
  updateProject,
  deleteProject,
} from '@/api/projects';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import type { Project, ProjectFormInput } from '@/types/types';

export function useProjects() {
  const { user } = useAuth();
  const userId = user?.uid ?? '';

  const { data, isLoading, error } = useFirestoreSubscription<Project>(
    ['projects', userId],
    (cb) => {
      if (!userId)
        return () => {
          /* noop */
        };
      return subscribeProjects(userId, cb);
    }
  );

  return { projects: data, isLoading, error };
}

export function useProject(projectId: string | undefined) {
  const { data, isLoading, error } = useFirestoreSubscription<Project>(
    ['project', projectId],
    (cb) => {
      if (!projectId)
        return () => {
          /* noop */
        };
      return subscribeProject(projectId, (project) => {
        cb(project ? [project] : []);
      });
    }
  );

  return { project: data?.[0] ?? null, isLoading, error };
}

export function useProjectMutations() {
  const { user } = useAuth();

  const create = useCallback(
    async (data: ProjectFormInput & { teamId: string }) => {
      if (!user) throw new Error('Not authenticated');
      return createProject({
        ...data,
        ownerId: user.uid,
        memberIds: [user.uid],
      });
    },
    [user]
  );

  const update = useCallback(
    async (projectId: string, data: Partial<ProjectFormInput>) => {
      return updateProject(projectId, data);
    },
    []
  );

  const remove = useCallback(async (projectId: string) => {
    return deleteProject(projectId);
  }, []);

  return { create, update, remove };
}
