import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Columns3,
  FolderKanban,
  Hammer,
  LayoutGrid,
  Pause,
  Search,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useRenovationStore } from '../stores/useRenovationStore';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { formatCurrency } from '../lib/format';
import { computeKpis } from '../lib/metrics';
import type { Renovation, RenovationStatus } from '../types';
import CriticalAlerts from '../components/dashboard/CriticalAlerts';
import RenovationCard from '../components/dashboard/RenovationCard';

type ViewMode = 'columns' | 'grid';
type IconType = typeof Wallet;

const KPI_CARD_BG: Record<string, string> = {
  blue: 'bg-accent-soft',
  emerald: 'bg-emerald-soft',
  purple: 'bg-purple-soft',
  green: 'bg-emerald-soft',
};

function KpiCard({
  tone,
  Icon,
  label,
  value,
  sub,
}: {
  tone: keyof typeof KPI_CARD_BG;
  Icon: IconType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={`rounded-lg border border-border p-4 ${KPI_CARD_BG[tone]}`}>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">
        <Icon size={14} /> {label}
      </div>
      <div className="text-[26px] font-bold tabular-nums tracking-[-0.02em] text-text">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-text-3">{sub}</div>
    </div>
  );
}

const COLUMNS: {
  status: RenovationStatus;
  label: string;
  Icon: IconType;
  cls: string;
  border: string;
}[] = [
  {
    status: 'active',
    label: 'Active',
    Icon: Pause,
    cls: 'bg-amber-soft text-amber-text',
    border: 'border-t-amber',
  },
  {
    status: 'in-progress',
    label: 'In Progress',
    Icon: Hammer,
    cls: 'bg-accent-soft text-accent',
    border: 'border-t-accent',
  },
  {
    status: 'completed',
    label: 'Completed',
    Icon: Trophy,
    cls: 'bg-emerald-soft text-emerald-text',
    border: 'border-t-emerald',
  },
];

const toggleBtn =
  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-text-3 transition-colors';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser());
  const visible = useRenovationStore((s) => s.visibleFor(user));
  const track = useTelemetryStore((s) => s.track);

  const [query, setQuery] = useState('');
  const [view, setView] = useState<ViewMode>('columns');

  useEffect(() => {
    if (user) track(user.id, 'dashboard');
  }, [user, track]);

  const openProject = (pid: string) => navigate(`/renovation/${pid}`);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((r) =>
      [r.name, r.address, r.city, r.state].join(' ').toLowerCase().includes(q),
    );
  }, [visible, query]);

  const kpis = computeKpis(visible);

  const byStatus = (status: RenovationStatus): Renovation[] =>
    filtered.filter((r) => r.status === status);

  return (
    <div>
      <CriticalAlerts projects={visible} onOpenProject={openProject} />

      <div className="mx-auto max-w-[1440px] px-8 py-6">
        {/* KPI bar */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            tone="blue"
            Icon={FolderKanban}
            label="Active Projects"
            value={String(kpis.activeCount)}
            sub={`${kpis.inProgressCount} in progress`}
          />
          <KpiCard
            tone="emerald"
            Icon={Wallet}
            label="Total Spent"
            value={formatCurrency(kpis.totalSpent)}
            sub={`of ${formatCurrency(kpis.totalBudget)} budget`}
          />
          <KpiCard
            tone="purple"
            Icon={TrendingUp}
            label="Avg. Completion"
            value={`${kpis.avgCompletion}%`}
            sub="active projects"
          />
          <KpiCard
            tone="green"
            Icon={CheckCircle2}
            label="Completed"
            value={String(kpis.completedCount)}
            sub="finished projects"
          />
        </div>

        {/* Filter bar */}
        <div className="mb-5 flex items-center gap-3">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-4">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, address, or city..."
              className="w-full rounded-lg border border-border-strong bg-surface py-2.5 pl-9 pr-3 text-[13px] text-text outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-0.5 rounded-lg bg-surface-2 p-0.5">
            <button
              className={`${toggleBtn} ${view === 'columns' ? 'bg-surface text-text shadow-sm' : ''}`}
              onClick={() => setView('columns')}
            >
              <Columns3 size={14} /> Columns
            </button>
            <button
              className={`${toggleBtn} ${view === 'grid' ? 'bg-surface text-text shadow-sm' : ''}`}
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={14} /> Grid
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-12 text-center text-sm text-text-3">
            {visible.length === 0
              ? 'No projects are assigned to your account yet.'
              : 'No projects match your search.'}
          </div>
        ) : view === 'columns' ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {COLUMNS.map((col) => {
              const items = byStatus(col.status);
              return (
                <div
                  key={col.status}
                  className={`min-h-[360px] rounded-lg border-t-[3px] bg-surface-2 p-4 ${col.border}`}
                >
                  <header className="mb-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${col.cls}`}
                    >
                      <col.Icon size={13} /> {col.label}
                    </span>
                    <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-surface px-1.5 text-[11px] font-bold text-text-3">
                      {items.length}
                    </span>
                  </header>
                  <div className="flex flex-col gap-3">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((r) => (
              <RenovationCard key={r.id} renovation={r} onOpen={openProject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
