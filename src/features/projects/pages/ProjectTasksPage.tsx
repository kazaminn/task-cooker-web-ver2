import { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { CreateTaskDialog } from '@/features/tasks/components/CreateTaskDialog';
import { FilterBar } from '@/features/tasks/components/FilterBar';
import { KanbanBoard } from '@/features/tasks/components/KanbanBoard';
import { TaskListView } from '@/features/tasks/components/TaskListView';
import { ViewToggle } from '@/features/tasks/components/ViewToggle';
import { useTasksQuery } from '@/features/tasks/hooks/useTasks';
import { useUIStore } from '@/stores/uiStore';
import type { Project } from '@/types/types';
import { Button } from '@/ui/components/Button';

export function ProjectTasksPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const resolvedProjectId = project.id ?? projectId;
  const projectPath = project.slug || resolvedProjectId;
  const { tasks, isLoading } = useTasksQuery(resolvedProjectId);
  const selectedView = useUIStore((s) => s.selectedView);
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
        <ViewToggle />
      </div>

      {/* sm: カンバン非表示、リストにフォールバック */}
      {selectedView === 'kanban' ? (
        <>
          <div className="hidden sm:block">
            <KanbanBoard
              tasks={tasks ?? []}
              projectId={resolvedProjectId!}
              teamId={project.teamId}
            />
          </div>
          <div className="sm:hidden">
            <TaskListView tasks={tasks ?? []} projectId={resolvedProjectId!} />
          </div>
        </>
      ) : (
        <TaskListView tasks={tasks ?? []} projectId={resolvedProjectId!} />
      )}

      <CreateTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(taskId) => {
          void navigate(`/projects/${projectPath}/tasks/${taskId}`);
        }}
        projectId={resolvedProjectId!}
        teamId={project.teamId}
      />
    </div>
  );
}
