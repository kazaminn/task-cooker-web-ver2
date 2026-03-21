import { format } from 'date-fns';
import type { Activity } from '@/types/types';

interface KitchenLogsSectionProps {
  activities: Activity[];
}

export function KitchenLogsSection({ activities }: KitchenLogsSectionProps) {
  return (
    <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-body">Kitchen Logs</h2>
      <p className="mt-1 text-sm text-muted">
        直近のアクティビティを時系列で確認
      </p>
      <div className="mt-4 space-y-3">
        {activities.slice(0, 10).map((activity) => (
          <div
            key={activity.id}
            className="rounded-2xl border border-main bg-base/70 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-body">
                {activity.userName}
              </span>
              <span className="text-xs text-muted">
                {format(activity.createdAt, 'M/d HH:mm')}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{activity.text}</p>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-muted">アクティビティはまだありません</p>
        )}
      </div>
    </section>
  );
}
