import { useNavigate } from 'react-router';
import { useTaskMutations } from './useTasks';

export function useTaskDetailActions(
  projectId: string,
  taskId: string,
  teamId: string
) {
  const navigate = useNavigate();
  const { update, remove } = useTaskMutations(projectId, teamId);

  const saveTitle = async (title: string) => {
    await update(taskId, { title });
  };

  const saveDescription = async (description: string | undefined) => {
    await update(taskId, { description });
  };

  const saveStatus = async (status: 'order' | 'prep' | 'cook' | 'serve') => {
    await update(taskId, { status });
  };

  const savePriority = async (
    priority: 'urgent' | 'high' | 'medium' | 'low'
  ) => {
    await update(taskId, { priority });
  };

  const saveDueDate = async (dueDate: Date | undefined) => {
    await update(taskId, { dueDate });
  };

  const saveAssignee = async (assigneeId: string | undefined) => {
    await update(taskId, { assigneeId });
  };

  const deleteTaskAndLeave = async () => {
    await remove(taskId);
    void navigate(`/projects/${projectId}/tasks`);
  };

  return {
    saveTitle,
    saveDescription,
    saveStatus,
    savePriority,
    saveDueDate,
    saveAssignee,
    deleteTaskAndLeave,
  };
}
