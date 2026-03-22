import { useUIStore } from '@/stores/uiStore';
import { ToggleButton } from '@/ui/components/ToggleButton';
import { ToggleButtonGroup } from '@/ui/components/ToggleButtonGroup';

export function ViewToggle() {
  const selectedView = useUIStore((s) => s.selectedView);
  const setSelectedView = useUIStore((s) => s.setSelectedView);

  return (
    <ToggleButtonGroup
      aria-label="ビュー切替"
      selectionMode="single"
      selectedKeys={new Set([selectedView])}
      onSelectionChange={(keys) => {
        const key = Array.from(keys)[0] as 'list' | 'kanban' | undefined;
        if (key) setSelectedView(key);
      }}
    >
      <ToggleButton id="list">List</ToggleButton>
      <ToggleButton id="kanban">Kanban</ToggleButton>
    </ToggleButtonGroup>
  );
}
