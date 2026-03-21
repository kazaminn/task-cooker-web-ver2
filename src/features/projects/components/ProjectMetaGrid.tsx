import { format } from 'date-fns';
import type { Project } from '@/types/types';

interface ProjectMetaGridProps {
  project: Project;
}

export function ProjectMetaGrid({ project }: ProjectMetaGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetaCard label="Owner" value={project.ownerId} />
      <MetaCard label="Members" value={String(project.memberIds.length)} />
      <MetaCard
        label="Created"
        value={format(project.createdAt, 'yyyy/MM/dd')}
      />
      <MetaCard
        label="Updated"
        value={format(project.updatedAt, 'yyyy/MM/dd HH:mm')}
      />
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-main bg-surface p-4">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-body">{value}</p>
    </div>
  );
}
