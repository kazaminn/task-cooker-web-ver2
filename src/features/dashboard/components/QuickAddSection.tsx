import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';
import { useDashboardQuickAdd } from '../hooks/useDashboardQuickAdd';

interface QuickAddSectionProps {
  projectId: string | undefined;
  projectName?: string | undefined;
  teamId: string | undefined;
  disabled?: boolean;
}

export function QuickAddSection({
  projectId,
  projectName,
  teamId,
  disabled = false,
}: QuickAddSectionProps) {
  const { isPending, quickAddText, setQuickAddText, submitQuickAdd } =
    useDashboardQuickAdd(projectId, teamId);

  return (
    <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-body">Quick Add</h2>
          <p className="text-sm text-muted">
            {projectName
              ? `追加先: ${projectName}`
              : '追加先のプロジェクトが未選択です'}
          </p>
        </div>
      </div>
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void submitQuickAdd();
        }}
      >
        <TextField
          aria-label="クイック追加"
          placeholder="追加するタスク名"
          value={quickAddText}
          onChange={setQuickAddText}
          isDisabled={disabled || isPending}
          className="flex-1"
        />
        <Button
          variant="primary"
          type="submit"
          className="sm:min-w-32"
          isDisabled={disabled || isPending}
        >
          注文を追加
        </Button>
      </form>
    </section>
  );
}
