import { useCallback } from 'react';
import {
  subscribeTeams,
  subscribeTeam,
  createTeam,
  deleteTeam,
  addMember,
  removeMember,
} from '@/api/teams';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import type { Team, TeamType } from '@/types/types';

export function useTeams() {
  const { user } = useAuth();
  const userId = user?.uid ?? '';

  const { data, isLoading, error } = useFirestoreSubscription<Team>(
    ['teams', userId],
    (cb) => {
      if (!userId)
        return () => {
          /* noop */
        };
      return subscribeTeams(userId, cb);
    }
  );

  return { teams: data, isLoading, error };
}

export function useTeam(teamId: string | undefined) {
  const { data, isLoading, error } = useFirestoreSubscription<Team>(
    ['team', teamId],
    (cb) => {
      if (!teamId)
        return () => {
          /* noop */
        };
      return subscribeTeam(teamId, (team) => {
        cb(team ? [team] : []);
      });
    }
  );

  return { team: data?.[0] ?? null, isLoading, error };
}

export function useTeamMutations() {
  const { user } = useAuth();

  const create = useCallback(
    async (name: string, type: TeamType) => {
      if (!user) throw new Error('Not authenticated');
      return createTeam({
        name,
        type,
        ownerId: user.uid,
        memberIds: [user.uid],
      });
    },
    [user]
  );

  const remove = useCallback(async (teamId: string) => {
    return deleteTeam(teamId);
  }, []);

  const invite = useCallback(async (teamId: string, userId: string) => {
    return addMember(teamId, userId);
  }, []);

  const kick = useCallback(async (teamId: string, userId: string) => {
    return removeMember(teamId, userId);
  }, []);

  return { create, remove, invite, kick };
}
