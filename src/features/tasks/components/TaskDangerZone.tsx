import { useState } from 'react';
import { Button } from '@/ui/components/Button';

interface TaskDangerZoneProps {
  onDelete: () => Promise<void>;
}

export function TaskDangerZone({ onDelete }: TaskDangerZoneProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (showDeleteConfirm) {
    return (
      <div className="flex gap-2">
        <Button variant="destructive" onPress={() => void onDelete()}>
          削除
        </Button>
        <Button variant="secondary" onPress={() => setShowDeleteConfirm(false)}>
          キャンセル
        </Button>
      </div>
    );
  }

  return (
    <Button variant="destructive" onPress={() => setShowDeleteConfirm(true)}>
      削除
    </Button>
  );
}
