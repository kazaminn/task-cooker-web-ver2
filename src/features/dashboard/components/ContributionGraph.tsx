import { format, subDays, startOfDay } from 'date-fns';
import type { Activity } from '@/types/types';
import { Tooltip, TooltipTrigger } from '@/ui/components/Tooltip';

const BROWNING_LEVELS = [
  'bg-amber-100 dark:bg-amber-950',
  'bg-amber-200 dark:bg-amber-900',
  'bg-amber-300 dark:bg-amber-700',
  'bg-amber-400 dark:bg-amber-600',
  'bg-amber-600 dark:bg-amber-500',
];

const EMPTY_CELL = 'bg-surface';

interface ContributionGraphProps {
  activities: Activity[];
  compact?: boolean;
}

export function ContributionGraph({
  activities,
  compact = false,
}: ContributionGraphProps) {
  const days = compact ? 182 : 365;
  const today = startOfDay(new Date());

  const countByDate = new Map<string, number>();
  for (const activity of activities) {
    const key = format(startOfDay(activity.createdAt), 'yyyy-MM-dd');
    countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
  }

  const maxCount = Math.max(1, ...countByDate.values());

  const getLevel = (count: number): number => {
    if (count === 0) return -1;
    const ratio = count / maxCount;
    if (ratio <= 0.2) return 0;
    if (ratio <= 0.4) return 1;
    if (ratio <= 0.6) return 2;
    if (ratio <= 0.8) return 3;
    return 4;
  };

  const cells = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i);
    const key = format(date, 'yyyy-MM-dd');
    const count = countByDate.get(key) ?? 0;
    const level = getLevel(count);
    return { date, count, level, key };
  });

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5">
        {weeks.map((week, wi) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((cell) => (
              <TooltipTrigger key={cell.key} delay={0}>
                {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
                <div
                  className={`h-3 w-3 rounded-sm ${cell.level === -1 ? EMPTY_CELL : BROWNING_LEVELS[cell.level]}`}
                  role="img"
                  aria-label={`${format(cell.date, 'M/d')}: ${cell.count} アクション`}
                />
                <Tooltip>
                  {format(cell.date, 'M/d')} — {cell.count} アクション
                </Tooltip>
              </TooltipTrigger>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
