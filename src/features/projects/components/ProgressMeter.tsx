import React from 'react';
import { ProgressBar } from '@/ui/components/ProgressBar';

interface ProgressMeterProps {
  total: number;
  served: number;
}

export function ProgressMeter({ total, served }: ProgressMeterProps) {
  const percentage = total > 0 ? Math.round((served / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <ProgressBar
        label="進捗"
        value={percentage}
        aria-label={`${served}/${total} タスク完了 (${percentage}%)`}
      />
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {served}/{total} タスク ({percentage}%)
      </p>
    </div>
  );
}
