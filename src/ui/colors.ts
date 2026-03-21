export const STATUS_COLORS = {
  order:
    'bg-status-order-light dark:bg-status-order-dark text-status-order-text-light dark:text-status-order-text-dark',
  prep: 'bg-status-prep-light dark:bg-status-prep-dark text-status-prep-text-light dark:text-status-prep-text-dark',
  cook: 'bg-status-cook-light dark:bg-status-cook-dark text-status-cook-text-light dark:text-status-cook-text-dark',
  serve:
    'bg-status-serve-light dark:bg-status-serve-dark text-status-serve-text-light dark:text-status-serve-text-dark',
} as const;

export type TaskStatus = keyof typeof STATUS_COLORS;
