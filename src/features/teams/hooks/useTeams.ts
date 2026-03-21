import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  subscribeTeams,
  subscribeTeam,
  createTeam,
  deleteTeam,
  addMember,
  removeMember,
} from '@/api/teams';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/hooks/queryKeys';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import type { Team, TeamType } from '@/types/types';

export function useTeamsQuery() {
  const { user } = useAuth();
  const userId = user?.uid ?? '';
  const subscribeToTeams = useCallback(
    (cb: (data: Team[]) => void, onError?: (error: Error) => void) => {
      if (!userId) {
        return () => {
          /* noop */
        };
      }

      return subscribeTeams(userId, cb, onError);
    },
    [userId]
  );

  const { data, isLoading, error } = useFirestoreSubscription<Team>(
    queryKeys.teams.list(userId),
    subscribeToTeams,
    { enabled: Boolean(userId) }
  );

  return { teams: data, isLoading, error };
}

export function useTeamQuery(teamId: string | undefined) {
  const subscribeToTeam = useCallback(
    (cb: (data: Team[]) => void, onError?: (error: Error) => void) => {
      if (!teamId)
        return () => {
          /* noop */
        };
      return subscribeTeam(
        teamId,
        (team) => {
          cb(team ? [team] : []);
        },
        onError
      );
    },
    [teamId]
  );

  const { data, isLoading, error } = useFirestoreSubscription<Team>(
    queryKeys.teams.detail(teamId),
    subscribeToTeam,
    { enabled: Boolean(teamId) }
  );

  return { team: data?.[0] ?? null, isLoading, error };
}

export function useTeamMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: TeamType }) => {
      if (!user) throw new Error('Not authenticated');
      return createTeam({
        name,
        type,
        ownerId: user.uid,
        memberIds: [user.uid],
      });
    },
    onSuccess: async () => {
      if (!user) return;
      await queryClient.invalidateQueries({
        queryKey: queryKeys.teams.list(user.uid),
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (teamId: string) => deleteTeam(teamId),
    onSuccess: async (_, teamId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.removeQueries({
        queryKey: queryKeys.teams.detail(teamId),
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }) => addMember(teamId, userId),
    onSuccess: async (_, { teamId }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.teams.detail(teamId),
      });
    },
  });

  const kickMutation = useMutation({
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }) => removeMember(teamId, userId),
    onSuccess: async (_, { teamId }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.teams.detail(teamId),
      });
    },
  });

  return {
    create: (name: string, type: TeamType) =>
      createMutation.mutateAsync({ name, type }),
    remove: removeMutation.mutateAsync,
    invite: (teamId: string, userId: string) =>
      inviteMutation.mutateAsync({ teamId, userId }),
    kick: (teamId: string, userId: string) =>
      kickMutation.mutateAsync({ teamId, userId }),
    createMutation,
    removeMutation,
    inviteMutation,
    kickMutation,
  };
}

/** @deprecated Use useTeamsQuery */
export const useTeams = useTeamsQuery;
/** @deprecated Use useTeamQuery */
export const useTeam = useTeamQuery;
