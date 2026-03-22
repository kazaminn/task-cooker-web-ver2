import { format } from 'date-fns';
import type { Activity } from '@/types/types';

interface KitchenLogsSectionProps {
  activities: Activity[];
}

export function KitchenLogsSection({ activities }: KitchenLogsSectionProps) {
  return (
    <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-body">Activity Log</h2>
      <p className="mt-1 text-sm text-muted">直近の動きだけを短く確認</p>
      <ul className="mt-4 divide-y divide-main/80">
        {activities.slice(0, 5).map((activity) => (
          <li key={activity.id} className="flex items-center gap-3 py-2.5">
            <span className="shrink-0 text-xs text-muted">
              {format(activity.createdAt, 'M/d HH:mm')}
            </span>
            <p className="min-w-0 truncate text-sm text-body">
              {activity.text}
            </p>
          </li>
        ))}
        {activities.length === 0 && (
          <li className="py-2.5 text-sm text-muted">
            アクティビティはまだありません
          </li>
        )}
      </ul>
    </section>
  );
}
