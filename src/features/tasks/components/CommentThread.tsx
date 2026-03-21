import { useState } from 'react';
import { format } from 'date-fns';
import type { Comment } from '@/api/comments';
import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';

const AUTHOR_TYPE_STYLES: Record<string, string> = {
  user: 'bg-surface',
  claude: 'bg-purple-50 dark:bg-purple-900/20',
  codex: 'bg-green-50 dark:bg-green-900/20',
};

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div
      className={`rounded-lg p-3 ${AUTHOR_TYPE_STYLES[comment.authorType] ?? AUTHOR_TYPE_STYLES.user}`}
    >
      <div className="mb-1 flex items-center gap-2">
        {comment.authorPhotoURL ? (
          <img
            src={comment.authorPhotoURL}
            alt=""
            className="h-5 w-5 rounded-full"
          />
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-hover text-[10px] font-medium text-body">
            {comment.authorName[0]}
          </span>
        )}
        <span className="text-xs font-medium text-body">
          {comment.authorName}
        </span>
        <span className="text-xs text-muted">
          {format(comment.createdAt, 'M/d HH:mm')}
        </span>
      </div>
      <p className="text-sm whitespace-pre-wrap text-body">{comment.body}</p>
    </div>
  );
}

function CommentInput({ onSubmit }: { onSubmit: (body: string) => void }) {
  const [body, setBody] = useState('');

  const handleSubmit = () => {
    if (!body.trim()) return;
    onSubmit(body.trim());
    setBody('');
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <TextField
          aria-label="コメント"
          placeholder="コメントを入力..."
          value={body}
          onChange={setBody}
        />
      </div>
      <Button variant="primary" onPress={handleSubmit}>
        送信
      </Button>
    </div>
  );
}

interface CommentThreadProps {
  comments: Comment[];
  onSubmit: (body: string) => void;
}

export function CommentThread({ comments, onSubmit }: CommentThreadProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-body">コメント</h2>
      {!comments.length ? (
        <p className="text-sm text-muted">まだコメントはありません</p>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
      <CommentInput onSubmit={onSubmit} />
    </div>
  );
}
