import { useState } from 'react';
import {
  getLocalTimeZone,
  parseDate,
  type CalendarDate,
} from '@internationalized/date';
import { format } from 'date-fns';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { TASK_STATUS_META, PRIORITY_META } from '@/types/constants';
import type { Project } from '@/types/types';
import { Button } from '@/ui/components/Button';
import { DatePicker } from '@/ui/components/DatePicker';
import { Select, SelectItem } from '@/ui/components/Select';
import { TextArea } from '@/ui/components/TextArea';
import { TextField } from '@/ui/components/TextField';
import { CommentThread } from '../components/CommentThread';
import { useCommentsQuery, useCommentMutations } from '../hooks/useComments';
import { useTaskMutations, useTaskQuery } from '../hooks/useTasks';

export function TaskDetailPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();
  const { task, isLoading } = useTaskQuery(projectId, taskId);
  const { update, remove } = useTaskMutations(projectId!, project.teamId);
  const { comments } = useCommentsQuery(projectId, taskId);
  const { create: createComment } = useCommentMutations(projectId!, taskId!);
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [isEditingDescription, setEditingDescription] = useState(false);
  const [descDraft, setDescDraft] = useState('');

  if (isLoading) {
    return <p className="text-muted">読み込み中...</p>;
  }

  if (!task) {
    return <p className="text-muted">タスクが見つかりません</p>;
  }

  const handleTitleSave = async () => {
    await update(taskId!, { title: titleDraft });
    setEditingTitle(false);
  };

  const handleDescSave = async () => {
    await update(taskId!, { description: descDraft });
    setEditingDescription(false);
  };

  const handleDelete = async () => {
    await remove(taskId!);
    void navigate(`/projects/${projectId}/tasks`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <TextField
                aria-label="タイトル"
                value={titleDraft}
                onChange={setTitleDraft}
                /* eslint-disable-next-line jsx-a11y/no-autofocus */
                autoFocus
              />
              <Button variant="primary" onPress={() => void handleTitleSave()}>
                保存
              </Button>
              <Button
                variant="secondary"
                onPress={() => setEditingTitle(false)}
              >
                キャンセル
              </Button>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                className="cursor-pointer text-left"
                onClick={() => {
                  setTitleDraft(task.title);
                  setEditingTitle(true);
                }}
              >
                <span className="mr-2 text-sm text-muted">
                  #{task.displayId}
                </span>
                <span className="text-xl font-bold text-body">
                  {task.title}
                </span>
              </button>
              <Button
                variant="outline"
                onPress={() => {
                  setTitleDraft(task.title);
                  setEditingTitle(true);
                }}
              >
                編集
              </Button>
            </div>
          )}
        </div>
        {showDeleteConfirm ? (
          <div className="flex gap-2">
            <Button variant="destructive" onPress={() => void handleDelete()}>
              削除
            </Button>
            <Button
              variant="secondary"
              onPress={() => setShowDeleteConfirm(false)}
            >
              キャンセル
            </Button>
          </div>
        ) : (
          <Button
            variant="destructive"
            onPress={() => setShowDeleteConfirm(true)}
          >
            削除
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Select
          label="ステータス"
          selectedKey={task.status}
          onSelectionChange={(key) =>
            void update(taskId!, {
              status: key as 'order' | 'prep' | 'cook' | 'serve',
            })
          }
        >
          {Object.entries(TASK_STATUS_META).map(([key, meta]) => (
            <SelectItem key={key} id={key}>
              {meta.ja}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="優先順位"
          selectedKey={task.priority}
          onSelectionChange={(key) =>
            void update(taskId!, {
              priority: key as 'urgent' | 'high' | 'medium' | 'low',
            })
          }
        >
          {Object.entries(PRIORITY_META).map(([key, meta]) => (
            <SelectItem key={key} id={key}>
              {meta.ja}
            </SelectItem>
          ))}
        </Select>
        <DatePicker
          label="期限"
          value={
            task.dueDate ? parseDate(format(task.dueDate, 'yyyy-MM-dd')) : null
          }
          onChange={(value) =>
            void update(taskId!, {
              dueDate: value
                ? (value as CalendarDate).toDate(getLocalTimeZone())
                : undefined,
            })
          }
        />
        <Select
          label="担当者"
          selectedKey={task.assigneeId ?? 'unassigned'}
          onSelectionChange={(key) =>
            void update(taskId!, {
              assigneeId: key === 'unassigned' ? undefined : (key as string),
            })
          }
        >
          <SelectItem id="unassigned">未割り当て</SelectItem>
          {project.memberIds.map((memberId) => (
            <SelectItem key={memberId} id={memberId}>
              {memberId}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="rounded-lg border border-main bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-body">説明</h2>
          {!isEditingDescription && (
            <Button
              variant="outline"
              onPress={() => {
                setDescDraft(task.description ?? '');
                setEditingDescription(true);
              }}
            >
              編集
            </Button>
          )}
        </div>
        {isEditingDescription ? (
          <div className="space-y-2">
            <TextArea
              aria-label="説明"
              value={descDraft}
              onChange={setDescDraft}
            />
            <div className="flex gap-2">
              <Button variant="primary" onPress={() => void handleDescSave()}>
                保存
              </Button>
              <Button
                variant="secondary"
                onPress={() => setEditingDescription(false)}
              >
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap text-muted">
            {task.description ?? 'まだ説明がありません'}
          </p>
        )}
      </div>

      <CommentThread
        comments={comments ?? []}
        onSubmit={(body) => void createComment(body)}
      />
    </div>
  );
}
