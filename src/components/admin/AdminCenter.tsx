import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Clock,
  FolderKanban,
  LogIn,
  Pencil,
  Plus,
  Trash2,
  Users as UsersIcon,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useUIStore } from '../../stores/useUIStore';
import { ROLE_LABELS } from '../../lib/constants';
import { initials } from '../../lib/format';
import type { User } from '../../types';
import Modal from '../ui/Modal';
import UserEditor from './UserEditor';

type AdminTab = 'users' | 'telemetry';

const FEATURE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'create-project': 'Create project',
  'add-expense': 'Add expense',
  'sow-update': 'SOW updates',
  'upload-media': 'Upload media',
  'tab:overview': 'Project overview',
  'tab:sow': 'Scope of work',
  'tab:financials': 'Financials',
  'tab:photos': 'Photos',
  'tab:updates': 'Updates',
};

function labelFeature(key: string): string {
  return FEATURE_LABELS[key] ?? key;
}

function formatDuration(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 1) return '<1m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AdminCenter() {
  const navigate = useNavigate();
  const open = useUIStore((s) => s.adminOpen);
  const close = useUIStore((s) => s.closeAdmin);

  const users = useAuthStore((s) => s.users);
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const removeUser = useAuthStore((s) => s.removeUser);
  const impersonate = useAuthStore((s) => s.impersonate);
  const renovations = useRenovationStore((s) => s.renovations);
  const telemetry = useTelemetryStore((s) => s.byUser);

  const [tab, setTab] = useState<AdminTab>('users');
  const [editing, setEditing] = useState<User | 'new' | null>(null);

  const featureTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const t of Object.values(telemetry)) {
      for (const [k, v] of Object.entries(t.featureCounts)) {
        totals[k] = (totals[k] ?? 0) + v;
      }
    }
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [telemetry]);

  const totalActiveMs = Object.values(telemetry).reduce(
    (a, t) => a + t.totalActiveMs,
    0,
  );
  const totalSessions = Object.values(telemetry).reduce(
    (a, t) => a + t.sessions,
    0,
  );

  if (!open) return null;

  if (editing) {
    return (
      <UserEditor
        user={editing === 'new' ? null : editing}
        renovations={renovations}
        onClose={() => setEditing(null)}
      />
    );
  }

  const renoCountFor = (u: User) =>
    u.role === 'admin' || u.role === 'viewer'
      ? renovations.length
      : (u.assignedProjectIds ?? []).length;

  const doImpersonate = (id: string) => {
    impersonate(id);
    close();
    navigate('/', { replace: true });
  };

  const maxFeature = featureTotals[0]?.[1] ?? 1;

  return (
    <Modal
      title="Admin Command Center"
      onClose={close}
      maxWidth={880}
      footer={
        tab === 'users' ? (
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-accent-2"
            onClick={() => setEditing('new')}
          >
            <Plus size={16} /> New User
          </button>
        ) : undefined
      }
    >
      {/* Tab switch */}
      <div className="mb-4 flex gap-1 border-b border-border">
        {(
          [
            { key: 'users', label: 'Users', Icon: UsersIcon },
            { key: 'telemetry', label: 'Telemetry', Icon: BarChart3 },
          ] as const
        ).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] ${
              tab === key
                ? 'border-accent font-semibold text-accent'
                : 'border-transparent font-medium text-text-3 hover:text-text'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'users' ? (
        <div className="flex flex-col gap-2">
          <div className="mb-1 text-[12px] text-text-3">
            {users.length} users in the system
          </div>
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">
                {initials(u.name)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[13px] font-bold text-text">
                    {u.name}
                  </span>
                  <span className="rounded bg-surface-3 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-text-2">
                    {ROLE_LABELS[u.role]}
                  </span>
                  {u.id === currentUserId && (
                    <span className="rounded bg-accent-soft px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-accent">
                      You
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-text-3">
                  @{u.username}
                  {u.email ? ` · ${u.email}` : ''}
                  {u.contractorCompany ? ` · ${u.contractorCompany}` : ''}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className="rounded border border-border bg-surface px-1.5 py-px text-[9px] text-text-3">
                    {renoCountFor(u)} projects
                  </span>
                  {(u.responsibilities ?? []).map((r) => (
                    <span
                      key={r}
                      className="rounded border border-border bg-surface px-1.5 py-px text-[9px] capitalize text-text-3"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {u.id !== currentUserId && (
                  <button
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-text-2 hover:border-purple hover:text-purple"
                    title="Log in as this user"
                    onClick={() => doImpersonate(u.id)}
                  >
                    <LogIn size={13} /> Log in as
                  </button>
                )}
                <button
                  className="rounded-md p-1.5 text-text-3 hover:bg-surface hover:text-text"
                  title="Edit user"
                  onClick={() => setEditing(u)}
                >
                  <Pencil size={15} />
                </button>
                {u.id !== currentUserId && (
                  <button
                    className="rounded-md p-1.5 text-text-3 hover:bg-red-soft hover:text-red-text"
                    title="Delete user"
                    onClick={() => {
                      if (window.confirm(`Delete user "${u.name}"?`))
                        removeUser(u.id);
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Metric tiles */}
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricTile
              Icon={FolderKanban}
              label="Renovations"
              value={String(renovations.length)}
            />
            <MetricTile
              Icon={UsersIcon}
              label="Team members"
              value={String(users.length)}
            />
            <MetricTile
              Icon={Activity}
              label="Total sessions"
              value={String(totalSessions)}
            />
            <MetricTile
              Icon={Clock}
              label="Active time"
              value={formatDuration(totalActiveMs)}
            />
          </div>

          {/* Per-user activity table */}
          <div className="mb-4 overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[1fr_80px_90px_1fr] gap-2 border-b border-border bg-surface-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-text-4">
              <div>User</div>
              <div className="text-right">Projects</div>
              <div className="text-right">Active</div>
              <div>Top feature</div>
            </div>
            {users.map((u) => {
              const t = telemetry[u.id];
              const top = t
                ? Object.entries(t.featureCounts).sort((a, b) => b[1] - a[1])[0]
                : undefined;
              return (
                <div
                  key={u.id}
                  className="grid grid-cols-[1fr_80px_90px_1fr] gap-2 border-b border-border px-3 py-2 text-[12px] last:border-0"
                >
                  <div className="font-medium text-text">{u.name}</div>
                  <div className="text-right tabular-nums text-text-2">
                    {renoCountFor(u)}
                  </div>
                  <div className="text-right tabular-nums text-text-2">
                    {t ? formatDuration(t.totalActiveMs) : '—'}
                  </div>
                  <div className="text-text-3">
                    {top ? labelFeature(top[0]) : '—'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Most-used features */}
          <div className="rounded-lg border border-border p-4">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-text-3">
              Most-used features
            </div>
            {featureTotals.length === 0 ? (
              <p className="text-[12px] text-text-4">
                No activity recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {featureTotals.map(([key, count]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-32 shrink-0 text-[12px] text-text-2">
                      {labelFeature(key)}
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${(count / maxFeature) * 100}%` }}
                      />
                    </div>
                    <div className="w-8 text-right text-[11px] tabular-nums text-text-3">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function MetricTile({
  Icon,
  label,
  value,
}: {
  Icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-3">
        <Icon size={14} /> {label}
      </div>
      <div className="text-[22px] font-bold tabular-nums text-text">{value}</div>
    </div>
  );
}
