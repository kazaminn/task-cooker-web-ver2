import type { TaskStatus, TaskPriority } from './types';

export const TASK_STATUSES = ['order', 'prep', 'cook', 'serve'] as const;

// emoji は仮置き。最終的に icon（Lucide コンポーネント）に差し替え予定
export const TASK_STATUS_META: Record<
  TaskStatus,
  { ja: string; emoji: string }
> = {
  order: { ja: '注文済み', emoji: '📋' },
  prep: { ja: '仕込み中', emoji: '🔪' },
  cook: { ja: '調理中', emoji: '🍳' },
  serve: { ja: '提供済み', emoji: '🍽️' },
};

export const TASK_PRIORITIES = [
  'urgent',
  'high',
  'medium',
  'low',
] as const;

// 優先順位は色なし。UIでは方向アイコン（↑→↓）+ aria-label で表現
export const PRIORITY_META: Record<TaskPriority, { ja: string }> = {
  urgent: { ja: '緊急' },
  high: { ja: '高' },
  medium: { ja: '中' },
  low: { ja: '低' },
};
