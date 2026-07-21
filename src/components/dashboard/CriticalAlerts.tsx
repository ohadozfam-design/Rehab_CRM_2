import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Renovation } from '../../types';
import { formatCurrency } from '../../lib/format';
import {
  daysToDeadline,
  isOverBudget,
  isPastDeadline,
  projectProgress,
  projectSpent,
} from '../../lib/metrics';

interface AlertItem {
  key: string;
  projectId: string;
  title: string;
  message: string;
}

const STORE_KEY = 'rehab-crm-dismissed-alerts';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Reads today's dismissed alert keys; resets automatically on a new day. */
function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { date: string; keys: string[] };
    if (parsed.date !== todayStr()) return new Set();
    return new Set(parsed.keys);
  } catch {
    return new Set();
  }
}

function saveDismissed(keys: Set<string>): void {
  localStorage.setItem(
    STORE_KEY,
    JSON.stringify({ date: todayStr(), keys: [...keys] }),
  );
}

function buildAlerts(projects: Renovation[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  for (const p of projects) {
    if (isOverBudget(p)) {
      const over = projectSpent(p) - p.totalBudget;
      alerts.push({
        key: `${p.id}:budget`,
        projectId: p.id,
        title: `Over budget: ${p.name}`,
        message: `Project is over budget by ${formatCurrency(over)}. Spent ${formatCurrency(projectSpent(p))} of ${formatCurrency(p.totalBudget)} budget.`,
      });
    }
    if (isPastDeadline(p)) {
      alerts.push({
        key: `${p.id}:deadline`,
        projectId: p.id,
        title: `Past deadline: ${p.name}`,
        message: `Project is ${Math.abs(daysToDeadline(p))} days past its deadline (${p.deadline}). Completion: ${projectProgress(p)}%.`,
      });
    }
  }
  return alerts;
}

/** Sticky red banner stack for over-budget / past-deadline projects. */
export default function CriticalAlerts({
  projects,
  onOpenProject,
}: {
  projects: Renovation[];
  onOpenProject?: (id: string) => void;
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);

  const alerts = buildAlerts(projects).filter((a) => !dismissed.has(a.key));
  if (alerts.length === 0) return null;

  const dismiss = (key: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(key);
      saveDismissed(next);
      return next;
    });
  };

  return (
    <div className="sticky top-0 z-40">
      {alerts.map((a) => (
        <div
          key={a.key}
          className="flex items-center gap-3 bg-red px-8 py-2.5 text-white"
        >
          <AlertTriangle size={18} className="shrink-0" />
          <div className="flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.05em]">
              {a.title}
            </div>
            <div className="text-[11px] opacity-90">{a.message}</div>
          </div>
          {onOpenProject && (
            <button
              type="button"
              onClick={() => onOpenProject(a.projectId)}
              className="shrink-0 text-[11px] font-semibold underline"
            >
              Open project
            </button>
          )}
          <button
            type="button"
            onClick={() => dismiss(a.key)}
            className="shrink-0 rounded-md p-1 text-white/90 hover:bg-white/10"
            title="Dismiss for today"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
