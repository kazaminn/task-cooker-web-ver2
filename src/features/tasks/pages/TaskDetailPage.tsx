import { useOutletContext, useParams } from 'react-router';
import type { Project } from '@/types/types';
import { CommentThread } from '../components/CommentThread';
import { TaskDangerZone } from '../components/TaskDangerZone';
import { TaskDescriptionEditor } from '../components/TaskDescriptionEditor';
import { TaskMetadataSection } from '../components/TaskMetadataSection';
import { TaskTitleEditor } from '../components/TaskTitleEditor';
import { useCommentsQuery, useCommentMutations } from '../hooks/useComments';
import { useTaskDetailActions } from '../hooks/useTaskDetailActions';
import { useTaskQuery } from '../hooks/useTasks';

export function TaskDetailPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();
  const resolvedProjectId = project.id ?? projectId;
  const { task, isLoading } = useTaskQuery(resolvedProjectId, taskId);
  const { comments } = useCommentsQuery(resolvedProjectId, taskId);
  const { create: createComment } = useCommentMutations(
    resolvedProjectId!,
    taskId!
  );
  const actions = useTaskDetailActions(
    resolvedProjectId!,
    taskId!,
    project.teamId
  );

  if (isLoading) {
    return <p className="text-muted">読み込み中...</p>;
  }

  if (!task) {
    return <p className="text-muted">タスクが見つかりません</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <TaskTitleEditor task={task} onSave={actions.saveTitle} />
        </div>
        <TaskDangerZone onDelete={actions.deleteTaskAndLeave} />
      </div>

      <TaskMetadataSection
        task={task}
        project={project}
        onStatusChange={actions.saveStatus}
        onPriorityChange={actions.savePriority}
        onDueDateChange={actions.saveDueDate}
        onAssigneeChange={actions.saveAssignee}
      />

      <TaskDescriptionEditor
        description={task.description}
        onSave={actions.saveDescription}
      />

      <CommentThread
        comments={comments ?? []}
        onSubmit={(body) => void createComment(body)}
      />
    </div>
  );
}
