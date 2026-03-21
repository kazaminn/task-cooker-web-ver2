import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import { CreateTaskDialog } from '@/features/tasks/components/CreateTaskDialog';
import { FilterBar } from '@/features/tasks/components/FilterBar';
import { KanbanBoard } from '@/features/tasks/components/KanbanBoard';
import { TaskListView } from '@/features/tasks/components/TaskListView';
import { ViewToggle } from '@/features/tasks/components/ViewToggle';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useUIStore } from '@/stores/uiStore';
import type { Project } from '@/types/types';
import { Button } from '@/ui/components/Button';
import { SearchField } from '@/ui/components/SearchField';

export function ProjectTasksPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, isLoading } = useTasks(projectId);
  const selectedView = useUIStore((s) => s.selectedView);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const [isDialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return <p className="text-muted">読み込み中...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onPress={() => setDialogOpen(true)}>
          + 新しい注文
        </Button>
        <FilterBar />
        <SearchField
          aria-label="タイトル検索"
          placeholder="タイトル検索..."
          onChange={setSearchQuery}
        />
        <ViewToggle />
      </div>

      {/* sm: カンバン非表示、リストにフォールバック */}
      {selectedView === 'kanban' ? (
        <>
          <div className="hidden sm:block">
            <KanbanBoard
              tasks={tasks ?? []}
              projectId={projectId!}
              teamId={project.teamId}
            />
          </div>
          <div className="sm:hidden">
            <TaskListView tasks={tasks ?? []} projectId={projectId!} />
          </div>
        </>
      ) : (
        <TaskListView tasks={tasks ?? []} projectId={projectId!} />
      )}

      <CreateTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        projectId={projectId!}
        teamId={project.teamId}
      />
    </div>
  );
}
