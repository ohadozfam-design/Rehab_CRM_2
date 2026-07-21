import { useState } from 'react';
import {
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Package,
  Pencil,
  TrendingUp,
  User,
  Wallet,
  Wrench,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { formatCurrency } from '../../lib/format';
import {
  budgetUsedPct,
  countedItems,
  daysToDeadline,
  projectProgress,
  projectSpent,
} from '../../lib/metrics';
import { completionOf } from '../../lib/sow';
import type { RenovationStatus, Renovation } from '../../types';

const STATUS_PILL: Record<RenovationStatus, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-amber-soft text-amber-text' },
  'in-progress': { label: 'In Progress', cls: 'bg-accent-soft text-accent' },
  completed: { label: 'Completed', cls: 'bg-emerald-soft text-emerald-text' },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatCard({
  tone,
  Icon,
  label,
  value,
  sub,
}: {
  tone: string;
  Icon: typeof Wallet;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={`rounded-lg border border-border p-4 ${tone}`}>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-text-3">
        <Icon size={14} /> {label}
      </div>
      <div className="text-[24px] font-bold tabular-nums tracking-[-0.02em] text-text">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-text-3">{sub}</div>
    </div>
  );
}

function ProgressBar({
  pct,
  tone,
}: {
  pct: number;
  tone: string;
}) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-surface-3">
      <span
        className={`block h-full rounded-full ${tone}`}
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
      />
    </div>
  );
}

function SummaryCard({
  renovation,
  editable,
}: {
  renovation: Renovation;
  editable: boolean;
}) {
  const updateRenovation = useRenovationStore((s) => s.updateRenovation);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(renovation.summary);
  const pill = STATUS_PILL[renovation.status];

  return (
    <div className="mb-4 rounded border border-border bg-surface p-[18px]">
      <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
        <span>Project Summary</span>
        {editable && !editing && (
          <button
            className="text-text-3 hover:text-text"
            onClick={() => {
              setDraft(renovation.summary);
              setEditing(true);
            }}
            title="Edit summary"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pill.cls}`}
        >
          {pill.label}
        </span>
        <span className="text-[11px] text-text-4">
          Started {fmtDate(renovation.startDate)} · Deadline{' '}
          {fmtDate(renovation.deadline)}
        </span>
      </div>

      {editing ? (
        <div>
          <textarea
            className="min-h-[80px] w-full resize-y rounded-lg border border-border-strong bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              className="rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-[12px] font-medium text-text-2"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white"
              onClick={() => {
                updateRenovation(renovation.id, { summary: draft.trim() });
                setEditing(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="m-0 text-[13px] leading-relaxed text-text-2">
          {renovation.summary || 'No summary yet.'}
        </p>
      )}
    </div>
  );
}

function ContactCards({ renovation }: { renovation: Renovation }) {
  const { manager, contractor } = renovation;
  return (
    <div className="mb-4 grid gap-4 md:grid-cols-2">
      <div className="rounded border border-border bg-surface p-[18px]">
        <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
          <User size={13} /> Project Manager
        </div>
        {manager ? (
          <>
            <Field label="Name" value={manager.name} />
            {manager.email && (
              <Field label="Email" value={manager.email} accent />
            )}
            {manager.phone && <Field label="Phone" value={manager.phone} />}
          </>
        ) : (
          <p className="text-[13px] text-text-3">No manager assigned.</p>
        )}
      </div>

      <div className="rounded border border-border bg-surface p-[18px]">
        <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
          <Briefcase size={13} /> Contractor
        </div>
        {contractor ? (
          <>
            <Field label="Company" value={contractor.company} />
            {contractor.name && <Field label="Contact" value={contractor.name} />}
            {contractor.license && (
              <Field label="License" value={contractor.license} />
            )}
            {contractor.insurance && (
              <Field label="Insurance" value={contractor.insurance} />
            )}
            {contractor.email && (
              <Field label="Email" value={contractor.email} accent />
            )}
          </>
        ) : (
          <p className="text-[13px] text-text-3">No contractor assigned.</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[11px] text-text-4">{label}</div>
      <div
        className={`text-[13px] ${accent ? 'text-accent' : 'font-medium text-text'}`}
      >
        {value}
      </div>
    </div>
  );
}

function PaymentSchedule({
  renovation,
  editable,
}: {
  renovation: Renovation;
  editable: boolean;
}) {
  const updateRenovation = useRenovationStore((s) => s.updateRenovation);
  const milestones = renovation.paymentMilestones ?? [];

  const total = milestones.reduce((a, m) => a + m.amount, 0);
  const paidTotal = milestones
    .filter((m) => m.paid)
    .reduce((a, m) => a + m.amount, 0);
  const pct = total > 0 ? Math.round((paidTotal / total) * 100) : 0;

  const togglePaid = (id: string) =>
    updateRenovation(renovation.id, {
      paymentMilestones: milestones.map((m) =>
        m.id === id
          ? {
              ...m,
              paid: !m.paid,
              paidAt: !m.paid ? new Date().toISOString() : undefined,
            }
          : m,
      ),
    });

  if (milestones.length === 0) {
    return (
      <div className="mb-4 rounded border border-border bg-surface p-[18px]">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
          Payment Schedule
        </div>
        <p className="text-[13px] text-text-3">
          No payment milestones defined for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded border border-border bg-surface p-[18px]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
          Payment Schedule
        </span>
        <span className="text-[12px] text-text-3">
          {formatCurrency(paidTotal)} of {formatCurrency(total)} paid ({pct}%)
        </span>
      </div>
      <div className="mb-3">
        <ProgressBar pct={pct} tone="bg-emerald" />
      </div>
      <div className="flex flex-col gap-2">
        {milestones.map((m, i) => (
          <div
            key={m.id}
            className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 p-2.5"
          >
            <button
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] ${
                m.paid
                  ? 'border-emerald bg-emerald text-white'
                  : 'border-border-strong bg-surface text-text-4'
              } ${editable ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => editable && togglePaid(m.id)}
              title={editable ? 'Toggle paid' : undefined}
            >
              {m.paid ? <Check size={13} /> : <Clock size={13} />}
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-text-4">
                    #{i + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-text">
                    {m.label}
                  </span>
                  <span className="rounded border border-border px-1.5 py-px text-[10px] text-text-3">
                    {m.pct}%
                  </span>
                </div>
                <div className="text-[13px] font-bold tabular-nums text-text">
                  {formatCurrency(m.amount)}
                </div>
              </div>
              {m.description && (
                <div className="mt-0.5 text-[11px] text-text-3">
                  {m.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewTab({
  renovation,
}: {
  renovation: Renovation;
}) {
  const user = useAuthStore((s) => s.currentUser());
  const hasFinances = useAuthStore((s) => s.hasResponsibility('finances'));
  const canEdit = !!user && user.role !== 'viewer';
  const canEditPayments = canEdit && hasFinances;

  const counted = countedItems(renovation);
  const completed = counted.filter((it) => completionOf(it) === 100).length;
  const spent = projectSpent(renovation);
  const progress = projectProgress(renovation);
  const remaining = renovation.totalBudget - spent;
  const days = daysToDeadline(renovation);
  const usedPct = budgetUsedPct(renovation);
  const laborEst = counted.reduce((a, it) => a + it.laborCost, 0);
  const materialEst = counted.reduce((a, it) => a + it.materialCost, 0);

  return (
    <div className="mx-auto max-w-[1100px] px-8 py-6">
      <SummaryCard renovation={renovation} editable={canEdit} />

      {/* Mini-dashboard */}
      <div className="mb-4 rounded border border-border bg-surface p-[18px]">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
          Project Dashboard
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            tone="bg-emerald-soft"
            Icon={Wallet}
            label="Total Spent"
            value={formatCurrency(spent)}
            sub={`of ${formatCurrency(renovation.totalBudget)}`}
          />
          <StatCard
            tone="bg-accent-soft"
            Icon={CheckCircle2}
            label="Completion"
            value={`${progress}%`}
            sub={`${completed} of ${counted.length} items`}
          />
          <StatCard
            tone="bg-purple-soft"
            Icon={TrendingUp}
            label="Remaining Budget"
            value={formatCurrency(remaining)}
            sub={remaining >= 0 ? 'available' : 'over budget'}
          />
          <StatCard
            tone=""
            Icon={CalendarDays}
            label="Days to Deadline"
            value={days >= 0 ? `${days}d` : `${Math.abs(days)}d late`}
            sub={fmtDate(renovation.deadline)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 flex justify-between text-[11px] text-text-3">
              <span>Overall Progress</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <ProgressBar pct={progress} tone="bg-accent" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[11px] text-text-3">
              <span>Budget Used</span>
              <span className="font-bold">{usedPct}%</span>
            </div>
            <ProgressBar
              pct={usedPct}
              tone={usedPct > 100 ? 'bg-red' : 'bg-emerald'}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-soft text-amber-text">
              <Wrench size={15} />
            </div>
            <div>
              <div className="text-[11px] text-text-3">Labor estimate</div>
              <div className="text-[14px] font-bold tabular-nums text-text">
                {formatCurrency(laborEst)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Package size={15} />
            </div>
            <div>
              <div className="text-[11px] text-text-3">Material estimate</div>
              <div className="text-[14px] font-bold tabular-nums text-text">
                {formatCurrency(materialEst)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactCards renovation={renovation} />

      <PaymentSchedule renovation={renovation} editable={canEditPayments} />
    </div>
  );
}
