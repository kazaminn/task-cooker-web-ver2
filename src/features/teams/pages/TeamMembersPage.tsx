import { useState } from 'react';
import { useParams } from 'react-router';
import { Button } from '@/ui/components/Button';
import { Dialog } from '@/ui/components/Dialog';
import { Modal } from '@/ui/components/Modal';
import { TextField } from '@/ui/components/TextField';
import { useTeam, useTeamMutations } from '../hooks/useTeams';

function InviteMemberDialog({
  isOpen,
  onClose,
  teamId,
}: {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}) {
  const { invite } = useTeamMutations();
  const [userId, setUserId] = useState('');

  const handleSubmit = async () => {
    if (!userId.trim()) return;
    await invite(teamId, userId.trim());
    setUserId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog aria-label="メンバー招待">
        <h2 className="mb-4 text-lg font-semibold text-body">メンバー招待</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="space-y-4"
        >
          <TextField
            label="ユーザーID"
            value={userId}
            onChange={setUserId}
            isRequired
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onPress={onClose}>
              キャンセル
            </Button>
            <Button variant="primary" type="submit">
              招待
            </Button>
          </div>
        </form>
      </Dialog>
    </Modal>
  );
}

export function TeamMembersPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { team, isLoading } = useTeam(teamId);
  const { kick } = useTeamMutations();
  const [isInviteOpen, setInviteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted">読み込み中...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6">
        <p className="text-muted">チームが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-body">
          {team.name} — メンバー管理
        </h1>
        <Button variant="primary" onPress={() => setInviteOpen(true)}>
          + メンバー招待
        </Button>
      </div>

      <div className="space-y-3">
        {team.memberIds.map((memberId) => (
          <div
            key={memberId}
            className="flex items-center justify-between rounded-lg border border-main bg-surface p-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-hover text-sm font-medium text-body">
                {memberId.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <span className="text-sm font-medium text-body">
                  {memberId}
                </span>
                {memberId === team.ownerId && (
                  <span className="text-primary ml-2 text-xs">owner</span>
                )}
              </div>
            </div>
            {memberId !== team.ownerId && (
              <Button
                variant="destructive"
                onPress={() => void kick(teamId!, memberId)}
              >
                除外
              </Button>
            )}
          </div>
        ))}
      </div>

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setInviteOpen(false)}
        teamId={teamId!}
      />
    </div>
  );
}
