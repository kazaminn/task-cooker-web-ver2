import { Button } from '@/ui/components/Button';
import { TextField } from '@/ui/components/TextField';
import { useDashboardQuickAdd } from '../hooks/useDashboardQuickAdd';

interface QuickAddSectionProps {
  projectId: string | undefined;
  teamId: string | undefined;
  disabled?: boolean;
}

export function QuickAddSection({
  projectId,
  teamId,
  disabled = false,
}: QuickAddSectionProps) {
  const { isPending, quickAddText, setQuickAddText, submitQuickAdd } =
    useDashboardQuickAdd(projectId, teamId);

  return (
    <section className="rounded-3xl border border-main bg-surface p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-body">Quick Add</h2>
      <p className="mt-1 text-sm text-muted">
        デフォルトプロジェクトへ order を即追加します。
      </p>
      <form
        className="mt-4 space-y-3"
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
        />
        <Button
          variant="primary"
          type="submit"
          className="w-full"
          isDisabled={disabled || isPending}
        >
          注文を追加
        </Button>
      </form>

      <div className="mt-6 border-t border-main pt-5">
        <h3 className="text-sm font-semibold text-body">Next Action</h3>
        <p className="mt-2 text-sm text-muted">
          新しい order を 1 件足すか、進行中タスクの整理に進んでください。
        </p>
      </div>
    </section>
  );
}
