import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useRenovationStore } from '../stores/useRenovationStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { formatCurrency } from '../lib/format';
import {
  daysToDeadline,
  isOverBudget,
  isPastDeadline,
  projectProgress,
  projectSpent,
} from '../lib/metrics';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function Stat({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg bg-surface-2 p-2.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.03em] text-text-3">
        {icon} {label}
      </div>
      <div className="text-[16px] font-bold tabular-nums text-text">{value}</div>
      <div className="text-[10px] text-text-3">{sub}</div>
    </div>
  );
}

/**
 * Morning Snapshot: a once-per-day welcome modal that appears after 08:00 (per
 * the user's configured time) summarizing holdings, spend, weekly progress, and
 * risk items. Throttled via per-user settings.
 */
export default function MorningSnapshot() {
  const user = useAuthStore((s) => s.currentUser());
  const projects = useRenovationStore((s) => s.visibleFor(user));
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    const settings = useSettingsStore.getState().getForUser(user.id);
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const [h, m] = settings.morningSnapshotTime.split(':').map(Number);
    const afterConfigured =
      now.getHours() > h || (now.getHours() === h && now.getMinutes() >= (m || 0));
    if (
      settings.morningSnapshotEnabled &&
      afterConfigured &&
      settings.lastSnapshotShownDate !== today
    ) {
      setShow(true);
    }
  }, [user?.id]);

  if (!user || !show) return null;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const active = projects.filter((p) => p.status !== 'completed');
  const totalSpent = projects.reduce((a, p) => a + projectSpent(p), 0);
  const totalBudget = projects.reduce((a, p) => a + p.totalBudget, 0);

  const weekAgo = today.getTime() - WEEK_MS;
  const weekEntries = projects.flatMap((p) =>
    p.financialEntries.filter((e) => new Date(e.date).getTime() >= weekAgo),
  );
  const weekSpend = weekEntries.reduce((a, e) => a + e.amount, 0);

  const riskProjects = projects.filter(
    (p) => isOverBudget(p) || isPastDeadline(p),
  );

  const dismiss = () => {
    useSettingsStore.getState().markSnapshotShown(user.id, todayStr);
    setShow(false);
  };
  const dontShowAgain = () => {
    useSettingsStore
      .getState()
      .update(user.id, {
        morningSnapshotEnabled: false,
        lastSnapshotShownDate: todayStr,
      });
    setShow(false);
  };

  const firstName = user.name.split(' ')[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: 'rgba(15, 23, 42, 0.5)' }}
    >
      <div className="w-full max-w-[560px] overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
        <header
          className="flex items-center justify-between px-5 py-4"
          style={{ background: 'linear-gradient(135deg, #fef3c7, #fed7aa)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg text-white"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}
            >
              ☀
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: '#1f1f1f' }}>
                Good morning, {firstName}
              </h3>
              <div className="text-[11px]" style={{ color: '#57534e' }}>
                {today.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
          <button
            className="rounded-md p-1 text-[13px]"
            style={{ color: '#57534e' }}
            onClick={dismiss}
          >
            ✕
          </button>
        </header>

        <div className="px-5 py-4">
          <p className="mb-3.5 text-[13px] text-text-2">
            Here's where you stand across {active.length} active project
            {active.length === 1 ? '' : 's'} this morning.
          </p>

          <div className="mb-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              icon="💵"
              label="Spent"
              value={formatCurrency(totalSpent)}
              sub={`of ${formatCurrency(totalBudget)}`}
            />
            <Stat
              icon="📁"
              label="Active"
              value={String(active.length)}
              sub="renovations"
            />
            <Stat
              icon="📈"
              label="This Week"
              value={formatCurrency(weekSpend)}
              sub={`${weekEntries.length} transaction${weekEntries.length === 1 ? '' : 's'}`}
            />
            <Stat
              icon="⚠"
              label="Risk"
              value={String(riskProjects.length)}
              sub="needs attention"
            />
          </div>

          {riskProjects.length > 0 && (
            <div
              className="mb-3.5 rounded-lg border p-2.5"
              style={{
                background: 'var(--red-soft)',
                borderColor: 'var(--red)',
              }}
            >
              <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-red-text">
                ⚠ Needs attention
              </div>
              <ul className="list-disc pl-5 text-[11px] text-red-text">
                {riskProjects.map((p) => (
                  <li key={p.id}>
                    {isOverBudget(p) ? '💸' : '⏰'} <strong>{p.name}</strong> is{' '}
                    {isOverBudget(p) ? 'over budget' : 'past deadline'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.05em] text-text-3">
              Project Status
            </div>
            <div className="flex flex-col gap-1.5">
              {active.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2.5 rounded-md bg-surface-2 p-2"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
                    🔨
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-text">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-text-3">
                      {projectProgress(p)}% done · {formatCurrency(projectSpent(p))}{' '}
                      of {formatCurrency(p.totalBudget)} ·{' '}
                      {daysToDeadline(p) >= 0
                        ? `${daysToDeadline(p)}d left`
                        : `${Math.abs(daysToDeadline(p))}d late`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[11px]">
          <button className="text-text-3 hover:text-text" onClick={dontShowAgain}>
            Don't show again
          </button>
          <button
            className="rounded-lg bg-accent px-3.5 py-2 text-[12px] font-semibold text-white"
            onClick={dismiss}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
