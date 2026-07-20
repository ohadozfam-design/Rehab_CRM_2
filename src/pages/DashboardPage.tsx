import { useAuthStore } from '../stores/useAuthStore';
import { useRenovationStore } from '../stores/useRenovationStore';
import { formatCurrency } from '../lib/format';
import type { RenovationStatus } from '../types';

const STATUS_META: Record<
  RenovationStatus,
  { label: string; pill: string }
> = {
  active: {
    label: 'Active',
    pill: 'bg-amber-soft text-amber-text',
  },
  'in-progress': {
    label: 'In Progress',
    pill: 'bg-accent-soft text-accent',
  },
  completed: {
    label: 'Completed',
    pill: 'bg-emerald-soft text-emerald-text',
  },
};

/**
 * Step 2 dashboard: shows the shell working and role-gated project visibility.
 * The full KPI bar + Kanban board + filters arrive in Step 3.
 */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.currentUser());
  const visible = useRenovationStore((s) => s.visibleFor(user));

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-text">Projects</h2>
        <span className="text-[12px] text-text-3">
          {visible.length} visible to {user?.name}
        </span>
      </div>
      <p className="mb-5 text-[13px] text-text-3">
        Showing renovations you have access to based on your role. The full KPI
        bar, search, and Kanban board come online in Step&nbsp;3.
      </p>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-text-3">
          No projects are assigned to your account yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => {
            const meta = STATUS_META[r.status];
            return (
              <div
                key={r.id}
                className="rounded-lg border border-border bg-surface p-3.5"
              >
                <div className="mb-2.5 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[13px] font-bold leading-tight text-text">
                      {r.name}
                    </h3>
                    <div className="mt-0.5 text-[11px] text-text-3">
                      📍 {r.city}, {r.state}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.pill}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2 text-[12px]">
                  <span className="text-text-4">Budget</span>
                  <span className="font-semibold tabular-nums text-text-2">
                    {formatCurrency(r.totalBudget)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
