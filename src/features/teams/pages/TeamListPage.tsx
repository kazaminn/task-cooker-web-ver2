import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/ui/components/Button';
import { CreateTeamDialog } from '../components/CreateTeamDialog';
import { useTeams } from '../hooks/useTeams';

export function TeamListPage() {
  const { teams, isLoading } = useTeams();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          チーム一覧
        </h1>
        <Button variant="primary" onPress={() => setDialogOpen(true)}>
          + 新規チーム
        </Button>
      </div>

      {!teams?.length ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">
            チームはまだありません
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <div
              key={team.id}
              role="button"
              tabIndex={0}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition hover:border-orange-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-600"
              onClick={() => void navigate(`/teams/${team.id}/members`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  void navigate(`/teams/${team.id}/members`);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    team.type === 'personal'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  }`}
                >
                  {team.type === 'personal' ? 'Personal' : 'Team'}
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {team.name}
                </span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                メンバー: {team.memberIds.length}人
              </span>
            </div>
          ))}
        </div>
      )}

      <CreateTeamDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
