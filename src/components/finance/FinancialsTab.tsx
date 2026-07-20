import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { formatCurrency } from '../../lib/format';
import { budgetHealth, scheduleMeter } from '../../lib/finance';
import type { HealthStatus } from '../../lib/finance';
import type { Renovation } from '../../types';
import AddEntryForm from './AddEntryForm';
import LoanCard from './LoanCard';
import ReceiptsCard from './ReceiptsCard';
import TransactionHistory from './TransactionHistory';
import FinanceChat from './FinanceChat';

const HERO_TONE: Record<HealthStatus, string> = {
  emerald: 'bg-emerald-soft border-emerald',
  amber: 'bg-amber-soft border-amber',
  red: 'bg-red-soft border-red',
};
const HERO_TEXT: Record<HealthStatus, string> = {
  emerald: 'text-emerald-text',
  amber: 'text-amber-text',
  red: 'text-red-text',
};

export default function FinancialsTab({
  renovation,
}: {
  renovation: Renovation;
}) {
  const user = useAuthStore((s) => s.currentUser());
  const hasFinances = useAuthStore((s) => s.hasResponsibility('finances'));
  const editable = !!user && user.role !== 'viewer' && hasFinances;

  const [addOpen, setAddOpen] = useState(false);

  const health = budgetHealth(renovation);
  const sched = scheduleMeter(renovation);

  return (
    <div className="mx-auto max-w-[900px] px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-text">Financial Summary</h3>
        {editable && (
          <button
            className="text-[13px] font-semibold text-accent"
            onClick={() => setAddOpen(true)}
          >
            + Add Entry
          </button>
        )}
      </div>

      {/* Hero: budget health */}
      <div
        className={`mb-4 flex items-start justify-between rounded border p-4 ${HERO_TONE[health.status]}`}
      >
        <div className="flex gap-2.5">
          <div className={HERO_TEXT[health.status]}>
            {health.status === 'red' ? '⚠' : health.status === 'amber' ? '◐' : '✓'}
          </div>
          <div>
            <div className={`text-[14px] font-bold ${HERO_TEXT[health.status]}`}>
              {health.label}
            </div>
            <div className={`mt-1 text-[12px] ${HERO_TEXT[health.status]}`}>
              True cost {formatCurrency(health.trueCost)} of{' '}
              {formatCurrency(renovation.totalBudget)} budget{' '}
              <strong>
                ({health.variance < 0 ? '+' : '−'}
                {formatCurrency(Math.abs(health.variance))} variance)
              </strong>
              <span className="block text-[10px] opacity-80">
                Cash spent + accrued loan interest
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[32px] font-extrabold tabular-nums tracking-[-0.02em] text-text">
            {health.usedPct}%
          </div>
          <div className="text-[12px] text-text-3">budget used</div>
        </div>
      </div>

      {/* Schedule meter */}
      <div className="mb-4 rounded border border-border bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
            ⏱ Schedule{' '}
            <span
              className={`normal-case ${sched.behind ? 'text-red-text' : 'text-emerald-text'}`}
            >
              ({sched.behind ? 'behind schedule' : 'on track'})
            </span>
          </span>
          <span className="text-[11px] text-text-3">
            {sched.daysElapsed} of {sched.daysTotal} days ·{' '}
            {sched.daysLeft >= 0
              ? `${sched.daysLeft}d to deadline`
              : `${Math.abs(sched.daysLeft)}d past deadline`}
          </span>
        </div>
        <div className="mb-2">
          <div className="mb-1 flex justify-between text-[11px] text-text-3">
            <span>Work Completed</span>
            <span className="font-bold">{sched.workPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-3">
            <span
              className="block h-full bg-accent"
              style={{ width: `${sched.workPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-text-3">
            <span>Time Elapsed</span>
            <span className="font-bold">{sched.timePct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-3">
            <span
              className={`block h-full ${sched.behind ? 'bg-red' : 'bg-emerald'}`}
              style={{ width: `${sched.timePct}%` }}
            />
          </div>
        </div>
        {sched.behind && (
          <div className="mt-2 text-[11px] text-red-text">
            Time is more than 10% ahead of work completed — the project is at risk
            of running late.
          </div>
        )}
      </div>

      <LoanCard renovation={renovation} editable={editable} />
      <FinanceChat renovation={renovation} />
      <ReceiptsCard renovation={renovation} editable={editable} />
      <TransactionHistory renovation={renovation} editable={editable} />

      {addOpen && (
        <AddEntryForm
          renovation={renovation}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
