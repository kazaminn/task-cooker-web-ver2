import { useOutletContext, useParams } from 'react-router';
import type { Project } from '@/types/types';
import { ProjectMetaGrid } from '../components/ProjectMetaGrid';
import { ProjectOverviewEditor } from '../components/ProjectOverviewEditor';
import { ProjectProgressSection } from '../components/ProjectProgressSection';
import { ProjectRecentActivitySection } from '../components/ProjectRecentActivitySection';
import { useProjectOverview } from '../hooks/useProjectOverview';
import { useProjectMutations } from '../hooks/useProjects';

export function ProjectOverviewPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { projectId } = useParams<{ projectId: string }>();
  const { activities, total, served, statusCounts } =
    useProjectOverview(projectId);
  const { update } = useProjectMutations();

  return (
    <div className="space-y-6">
      <ProjectMetaGrid project={project} />
      <ProjectProgressSection
        total={total}
        served={served}
        statusCounts={statusCounts}
      />
      <ProjectOverviewEditor
        overview={project.overview}
        onSave={async (overview) => {
          if (!projectId) return;
          await update(projectId, { overview });
        }}
      />
      <ProjectRecentActivitySection activities={activities} />
    </div>
  );
}
