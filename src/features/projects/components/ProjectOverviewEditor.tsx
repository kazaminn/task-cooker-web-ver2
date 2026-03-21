import { useState } from 'react';
import { Button } from '@/ui/components/Button';
import { TextArea } from '@/ui/components/TextArea';

interface ProjectOverviewEditorProps {
  overview: string;
  onSave: (overview: string) => Promise<void>;
}

export function ProjectOverviewEditor({
  overview,
  onSave,
}: ProjectOverviewEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [overviewText, setOverviewText] = useState(overview);

  const beginEdit = () => {
    setOverviewText(overview);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await onSave(overviewText);
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-main bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-body">概要</h2>
        {!isEditing && (
          <Button variant="outline" onPress={beginEdit}>
            編集
          </Button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <TextArea
            aria-label="概要"
            value={overviewText}
            onChange={setOverviewText}
          />
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
          {overview || 'まだ概要がありません'}
        </p>
      )}
    </div>
  );
}
