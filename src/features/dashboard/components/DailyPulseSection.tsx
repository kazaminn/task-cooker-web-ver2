interface DailyPulseSectionProps {
  isLoading: boolean;
  todayServed: number;
  overdueCount: number;
  stoveCount: number;
  onBrowseProjects: () => void;
}

export function DailyPulseSection({
  isLoading,
  todayServed,
  overdueCount,
  stoveCount,
  onBrowseProjects,
}: DailyPulseSectionProps) {
  return (
    <section className="rounded-[2rem] border border-main bg-[linear-gradient(135deg,var(--color-surface),color-mix(in_oklab,var(--color-primary)_8%,var(--color-base)))] p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
            Daily Pulse
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-body sm:text-4xl">
              今日のキッチン状況
            </h1>
            <p className="max-w-2xl text-sm text-muted sm:text-base">
              serve
              数、期限切れ、進行中タスクをひと目で見て、次に手を付けるべき皿を決めるためのダッシュボードです。
            </p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-xl border border-main bg-base px-4 py-2 text-sm text-body transition hover:border-primary"
          onClick={onBrowseProjects}
        >
          プロジェクト一覧へ
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Today Served"
          value={isLoading ? '—' : todayServed}
          caption="本日完了したタスク"
        />
        <MetricCard
          label="Overdue"
          value={isLoading ? '—' : overdueCount}
          caption="期限切れタスク"
          valueClassName="text-danger"
        />
        <MetricCard
          label="On The Stove"
          value={isLoading ? '—' : stoveCount}
          caption="prep / cook 中"
        />
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  caption,
  valueClassName = 'text-body',
}: {
  label: string;
  value: number | string;
  caption: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-main bg-base/80 p-4">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-bold tabular-nums ${valueClassName}`}>
        {value}
      </p>
      <p className="mt-1 text-sm text-muted">{caption}</p>
    </div>
  );
}
