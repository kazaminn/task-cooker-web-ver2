import type { Activity } from '@/types/types';
import { ContributionGraph } from './ContributionGraph';

interface ContributionSectionProps {
  activities: Activity[];
  onOpenProfile: () => void;
}

export function ContributionSection({
  activities,
  onOpenProfile,
}: ContributionSectionProps) {
  return (
    <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-body">Contribution</h2>
          <p className="text-sm text-muted">最近の積み上がりを週次で俯瞰</p>
        </div>
        <button
          type="button"
          className="text-sm text-muted transition hover:text-body"
          onClick={onOpenProfile}
        >
          プロフィールへ
        </button>
      </div>
      <div className="hidden sm:block">
        <ContributionGraph activities={activities} />
      </div>
      <div className="sm:hidden">
        <ContributionGraph activities={activities} compact />
      </div>
    </section>
  );
}
