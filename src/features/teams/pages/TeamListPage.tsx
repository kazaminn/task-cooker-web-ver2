import { useState } from 'react';
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
        <h1 className="text-2xl font-bold text-body">チーム一覧</h1>
        <Button variant="primary" onPress={() => setDialogOpen(true)}>
          + 新規チーム
        </Button>
      </div>

      {!teams?.length ? (
        <div className="rounded-xl border border-dashed border-main p-12 text-center">
          <p className="text-muted">チームはまだありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-lg border border-main bg-surface transition hover:border-primary"
            >
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between p-4 text-left"
                onClick={() => void navigate(`/teams/${team.id}/members`)}
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
                  <span className="font-medium text-body">{team.name}</span>
                </div>
                <span className="text-sm text-muted">
                  メンバー: {team.memberIds.length}人
                </span>
              </button>
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
