import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { Select, SelectItem } from '@/ui/components/Select';

export function FilterBar() {
  const setFilters = useUIStore((s) => s.setFilters);

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="ステータスフィルタ"
        placeholder="ステータス"
        onSelectionChange={(key) => {
          const value = key as string;
          setFilters({
            status:
              value === 'all'
                ? undefined
                : [value as 'order' | 'prep' | 'cook' | 'serve'],
          });
        }}
      >
        <SelectItem id="all">すべて</SelectItem>
        <SelectItem id="order">注文済み</SelectItem>
        <SelectItem id="prep">仕込み中</SelectItem>
        <SelectItem id="cook">調理中</SelectItem>
        <SelectItem id="serve">提供済み</SelectItem>
      </Select>
      <Select
        aria-label="優先順位フィルタ"
        placeholder="優先順位"
        onSelectionChange={(key) => {
          const value = key as string;
          setFilters({
            priority:
              value === 'all'
                ? undefined
                : [value as 'urgent' | 'high' | 'medium' | 'low'],
          });
        }}
      >
        <SelectItem id="all">すべて</SelectItem>
        <SelectItem id="urgent">緊急</SelectItem>
        <SelectItem id="high">高</SelectItem>
        <SelectItem id="medium">中</SelectItem>
        <SelectItem id="low">低</SelectItem>
      </Select>
    </div>
  );
}
