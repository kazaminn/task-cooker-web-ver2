import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/ui/components/Button';
import { CreateProjectDialog } from '../components/CreateProjectDialog';
import { ProjectCard } from '../components/ProjectCard';
import { useProjectsQuery } from '../hooks/useProjects';

export function ProjectListPage() {
  const { projects, isLoading } = useProjectsQuery();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-body">プロジェクト一覧</h1>
        <Button variant="primary" onPress={() => setDialogOpen(true)}>
          + 新規プロジェクト
        </Button>
      </div>

      {!projects?.length ? (
        <div className="rounded-xl border border-dashed border-main p-12 text-center">
          <p className="mb-4 text-muted">最初のプロジェクトを作成しましょう</p>
          <Button variant="primary" onPress={() => setDialogOpen(true)}>
            + 新規プロジェクト
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => void navigate(`/projects/${project.id}`)}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
