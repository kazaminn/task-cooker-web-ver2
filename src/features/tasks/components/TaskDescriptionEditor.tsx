import { useState } from 'react';
import { Button } from '@/ui/components/Button';
import { TextArea } from '@/ui/components/TextArea';

interface TaskDescriptionEditorProps {
  description: string | undefined;
  onSave: (description: string | undefined) => Promise<void>;
}

export function TaskDescriptionEditor({
  description,
  onSave,
}: TaskDescriptionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(description ?? '');

  const beginEdit = () => {
    setDraft(description ?? '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    await onSave(draft || undefined);
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-main bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-body">説明</h2>
        {!isEditing && (
          <Button variant="outline" onPress={beginEdit}>
            編集
          </Button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <TextArea aria-label="説明" value={draft} onChange={setDraft} />
          <div className="flex gap-2">
            <Button variant="primary" onPress={() => void handleSave()}>
              保存
            </Button>
            <Button variant="secondary" onPress={() => setIsEditing(false)}>
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap text-muted">
          {description ?? 'まだ説明がありません'}
        </p>
      )}
    </div>
  );
}
