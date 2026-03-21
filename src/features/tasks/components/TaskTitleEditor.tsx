import { useState } from 'react';
import type { Task } from '@/types/types';
import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';

interface TaskTitleEditorProps {
  task: Task;
  onSave: (title: string) => Promise<void>;
}

export function TaskTitleEditor({ task, onSave }: TaskTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);

  const beginEdit = () => {
    setTitleDraft(task.title);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await onSave(titleDraft);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <TextField
          aria-label="タイトル"
          value={titleDraft}
          onChange={setTitleDraft}
        />
        <Button variant="primary" onPress={() => void handleSave()}>
          保存
        </Button>
        <Button variant="secondary" onPress={() => setIsEditing(false)}>
          キャンセル
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <button
        type="button"
        className="cursor-pointer text-left"
        onClick={beginEdit}
      >
        <span className="mr-2 text-sm text-muted">#{task.displayId}</span>
        <span className="text-xl font-bold text-body">{task.title}</span>
      </button>
      <Button variant="outline" onPress={beginEdit}>
        編集
      </Button>
    </div>
  );
}
