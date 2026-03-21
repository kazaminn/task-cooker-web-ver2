import { useState } from 'react';
import { useTaskMutations } from '@/features/tasks/hooks/useTasks';

export function useDashboardQuickAdd(
  projectId: string | undefined,
  teamId: string | undefined
) {
  const [quickAddText, setQuickAddText] = useState('');
  const { create, createMutation } = useTaskMutations(
    projectId ?? '',
    teamId ?? ''
  );

  const submitQuickAdd = async () => {
    const title = quickAddText.trim();
    if (!title || !projectId || !teamId) {
      return;
    }

    await create({
      title,
      status: 'order',
      priority: 'medium',
    });
    setQuickAddText('');
  };

  return {
    quickAddText,
    setQuickAddText,
    submitQuickAdd,
    isPending: createMutation.isPending,
  };
}
