import { format } from 'date-fns';
import type { Activity } from '@/types/types';

interface ProjectRecentActivitySectionProps {
  activities: Activity[];
}

export function ProjectRecentActivitySection({
  activities,
}: ProjectRecentActivitySectionProps) {
  return (
    <div className="rounded-lg border border-main bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-body">Recent Activity</h2>
        <span className="text-xs text-muted">直近 6 件</span>
      </div>
      <div className="space-y-2">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-xl border border-main bg-base/70 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-body">
                  {activity.userName}
                </span>
                <span className="text-xs text-muted">
                  {format(activity.createdAt, 'M/d HH:mm')}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{activity.text}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">まだアクティビティはありません</p>
        )}
      </div>
    </div>
  );
}
