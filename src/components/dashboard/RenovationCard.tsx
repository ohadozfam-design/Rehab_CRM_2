import type { Renovation, RenovationStatus } from '../../types';
import { formatCurrency } from '../../lib/format';
import {
  daysToDeadline,
  projectProgress,
  projectSpent,
} from '../../lib/metrics';

const STATUS_PILL: Record<RenovationStatus, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-amber-soft text-amber-text' },
  'in-progress': { label: 'In Progress', cls: 'bg-accent-soft text-accent' },
  completed: { label: 'Completed', cls: 'bg-emerald-soft text-emerald-text' },
};

/** A single renovation card, used in both Kanban columns and the flat grid. */
export default function RenovationCard({
  renovation,
  onOpen,
}: {
  renovation: Renovation;
  onOpen?: (id: string) => void;
}) {
  const pill = STATUS_PILL[renovation.status];
  const progress = projectProgress(renovation);
  const spent = projectSpent(renovation);
  const days = daysToDeadline(renovation);
  const late = days < 0;

  const barTone =
    progress >= 100
      ? 'bg-emerald'
      : renovation.status === 'active'
        ? 'bg-amber'
        : 'bg-accent';

  return (
    <button
      type="button"
      onClick={() => onOpen?.(renovation.id)}
      className="w-full rounded border border-border bg-surface p-3 text-left transition-colors hover:border-accent hover:shadow-sm"
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <h4 className="text-[13px] font-bold leading-tight text-text">
            {renovation.name}
          </h4>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-text-3">
            📍 {renovation.city}, {renovation.state}
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pill.cls}`}
        >
          {pill.label}
        </span>
      </div>

      <div className="mb-2.5">
        <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-[0.05em] text-text-3">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
          <span
            className={`block h-full rounded-full ${barTone}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 border-t border-border pt-2 tabular-nums">
        <div className="text-center">
          <div className="mb-0.5 text-[10px] uppercase tracking-[0.04em] text-text-4">
            Spent
          </div>
          <div className="text-[12px] font-semibold text-text-2">
            {formatCurrency(spent)}
          </div>
        </div>
        <div className="text-center">
          <div className="mb-0.5 text-[10px] uppercase tracking-[0.04em] text-text-4">
            Budget
          </div>
          <div className="text-[12px] font-semibold text-text-2">
            {formatCurrency(renovation.totalBudget)}
          </div>
        </div>
        <div className="text-center">
          <div className="mb-0.5 text-[10px] uppercase tracking-[0.04em] text-text-4">
            Days
          </div>
          <div
            className={`text-[12px] font-semibold ${late ? 'text-red' : 'text-text-2'}`}
          >
            {late ? `${Math.abs(days)}d late` : `${days}d`}
          </div>
        </div>
      </div>
    </button>
  );
}
