import { useState } from 'react';
import { Button } from '@/ui/components/Button';
import { Dialog } from '@/ui/components/Dialog';
import { Modal } from '@/ui/components/Modal';
import { TextField } from '@/ui/components/TextField';
import { useTeamMutations } from '../hooks/useTeams';

interface CreateTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTeamDialog({ isOpen, onClose }: CreateTeamDialogProps) {
  const { create } = useTeamMutations();
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await create(name.trim());
    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog aria-label="新規チーム作成">
        <h2 className="mb-4 text-lg font-semibold text-body">新規チーム</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="space-y-4"
        >
          <TextField
            label="チーム名"
            value={name}
            onChange={setName}
            isRequired
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onPress={onClose}>
              キャンセル
            </Button>
            <Button variant="primary" type="submit">
              作成
            </Button>
          </div>
        </form>
      </Dialog>
    </Modal>
  );
}
