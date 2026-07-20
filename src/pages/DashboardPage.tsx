import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useRenovationStore } from '../stores/useRenovationStore';
import { formatCurrency } from '../lib/format';
import { computeKpis } from '../lib/metrics';
import type { Renovation, RenovationStatus } from '../types';
import CriticalAlerts from '../components/dashboard/CriticalAlerts';
import RenovationCard from '../components/dashboard/RenovationCard';

type ViewMode = 'columns' | 'grid';

const KPI_CARD_BG: Record<string, string> = {
  blue: 'bg-accent-soft',
  emerald: 'bg-emerald-soft',
  purple: 'bg-purple-soft',
  green: 'bg-emerald-soft',
};

function KpiCard({
  tone,
  label,
  value,
  sub,
}: {
  tone: keyof typeof KPI_CARD_BG;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={`rounded border border-border p-3.5 ${KPI_CARD_BG[tone]}`}>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-text-3">
        {label}
      </div>
      <div className="text-[22px] font-bold tabular-nums tracking-[-0.02em] text-text">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-text-3">{sub}</div>
    </div>
  );
}

const COLUMNS: { status: RenovationStatus; pill: string; cls: string; border: string }[] =
  [
    {
      status: 'active',
      pill: '⏸ Active',
      cls: 'bg-amber-soft text-amber-text',
      border: 'border-t-amber',
    },
    {
      status: 'in-progress',
      pill: '🔨 In Progress',
      cls: 'bg-accent-soft text-accent',
      border: 'border-t-accent',
    },
    {
      status: 'completed',
      pill: '🏆 Completed',
      cls: 'bg-emerald-soft text-emerald-text',
      border: 'border-t-emerald',
    },
  ];

const toggleBtn =
  'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-text-3';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser());
  const visible = useRenovationStore((s) => s.visibleFor(user));

  const [query, setQuery] = useState('');
  const [view, setView] = useState<ViewMode>('columns');

  const openProject = (pid: string) => navigate(`/renovation/${pid}`);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((r) =>
      [r.name, r.address, r.city, r.state]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [visible, query]);

  const kpis = computeKpis(visible);

  const byStatus = (status: RenovationStatus): Renovation[] =>
    filtered.filter((r) => r.status === status);

  return (
    <div>
      <CriticalAlerts projects={visible} onOpenProject={openProject} />

      <div className="mx-auto max-w-[1200px] px-6 py-5">
        {/* KPI bar */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            tone="blue"
            label="📁 Active Projects"
            value={String(kpis.activeCount)}
            sub={`${kpis.inProgressCount} in progress`}
          />
          <KpiCard
            tone="emerald"
            label="💵 Total Spent"
            value={formatCurrency(kpis.totalSpent)}
            sub={`of ${formatCurrency(kpis.totalBudget)} budget`}
          />
          <KpiCard
            tone="purple"
            label="📈 Avg. Completion"
            value={`${kpis.avgCompletion}%`}
            sub="active projects"
          />
          <KpiCard
            tone="green"
            label="✓ Completed"
            value={String(kpis.completedCount)}
            sub="finished projects"
          />
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex items-center gap-2.5">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-4">
              ⌕
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, address, or city..."
              className="w-full rounded-lg border border-border-strong bg-surface py-2 pl-8 pr-3 text-[13px] text-text outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-0.5 rounded-lg bg-surface-2 p-0.5">
            <button
              className={`${toggleBtn} ${view === 'columns' ? 'bg-surface text-text shadow-sm' : ''}`}
              onClick={() => setView('columns')}
            >
              ⋮⋮⋮ Columns
            </button>
            <button
              className={`${toggleBtn} ${view === 'grid' ? 'bg-surface text-text shadow-sm' : ''}`}
              onClick={() => setView('grid')}
            >
              ▦ Grid
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-10 text-center text-sm text-text-3">
            {visible.length === 0
              ? 'No projects are assigned to your account yet.'
              : 'No projects match your search.'}
          </div>
        ) : view === 'columns' ? (
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const items = byStatus(col.status);
              return (
                <div
                  key={col.status}
                  className={`min-h-[320px] rounded border-t-[3px] bg-surface-2 p-3 ${col.border}`}
                >
                  <header className="mb-2.5 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${col.cls}`}
                    >
                      {col.pill}
                    </span>
                    <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-surface px-1.5 text-[11px] font-bold text-text-3">
                      {items.length}
                    </span>
                  </header>
                  <div className="flex flex-col gap-2.5">
                    {items.map((r) => (
                      <RenovationCard
                        key={r.id}
                        renovation={r}
                        onOpen={openProject}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <RenovationCard key={r.id} renovation={r} onOpen={openProject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
