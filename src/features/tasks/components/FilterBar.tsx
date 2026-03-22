import { useId } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { PRIORITY_META, TASK_STATUS_META } from '@/types/constants';
import type { TaskPriority, TaskStatus } from '@/types/types';
import { SearchField } from '@/ui/components/SearchField';
import { Select, SelectItem } from '@/ui/components/Select';

const statusOptions: { id: TaskStatus; label: string }[] = [
  { id: 'order', label: TASK_STATUS_META.order.ja },
  { id: 'prep', label: TASK_STATUS_META.prep.ja },
  { id: 'cook', label: TASK_STATUS_META.cook.ja },
  { id: 'serve', label: TASK_STATUS_META.serve.ja },
];

const priorityOptions: { id: TaskPriority; label: string }[] = [
  { id: 'urgent', label: PRIORITY_META.urgent.ja },
  { id: 'high', label: PRIORITY_META.high.ja },
  { id: 'medium', label: PRIORITY_META.medium.ja },
  { id: 'low', label: PRIORITY_META.low.ja },
];

export function FilterBar() {
  const filters = useUIStore((s) => s.filters);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setFilters = useUIStore((s) => s.setFilters);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const statusId = useId();
  const priorityId = useId();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        id={statusId}
        aria-label="ステータスフィルタ"
        placeholder="ステータス"
        selectedKey={filters.status?.[0] ?? 'all'}
        onSelectionChange={(key) => {
          if (key == null) {
            return;
          }
          const value = String(key);
          setFilters({
            status: value === 'all' ? undefined : [value as TaskStatus],
          });
        }}
      >
        <SelectItem id="all">すべて</SelectItem>
        {statusOptions.map((option) => (
          <SelectItem key={option.id} id={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
      <Select
        id={priorityId}
        aria-label="優先順位フィルタ"
        placeholder="優先順位"
        selectedKey={filters.priority?.[0] ?? 'all'}
        onSelectionChange={(key) => {
          if (key == null) {
            return;
          }
          const value = String(key);
          setFilters({
            priority: value === 'all' ? undefined : [value as TaskPriority],
          });
        }}
      >
        <SelectItem id="all">すべて</SelectItem>
        {priorityOptions.map((option) => (
          <SelectItem key={option.id} id={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
      <SearchField
        aria-label="タイトル検索"
        className="min-w-[220px] flex-1"
        placeholder="タイトル検索..."
        value={searchQuery}
        onChange={setSearchQuery}
      />
    </div>
  );
}
