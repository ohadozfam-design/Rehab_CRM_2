import { useState } from 'react';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { formatCurrency } from '../../lib/format';
import { PHASE_META } from '../../lib/constants';
import {
  aggregatePhase,
  daysLeft,
  hasAnyMaterial,
  itemTotal,
  phaseItems,
} from '../../lib/sow';
import type { PhaseId, Renovation, SOWItem } from '../../types';
import SowRow from './SowRow';

const TONE: Record<
  'purple' | 'blue' | 'emerald',
  { numBg: string; name: string; border: string; tint: string; bar: string }
> = {
  purple: {
    numBg: 'bg-purple',
    name: 'text-purple-text',
    border: 'border-purple',
    tint: 'bg-purple-soft/40',
    bar: 'bg-purple',
  },
  blue: {
    numBg: 'bg-accent',
    name: 'text-accent',
    border: 'border-accent',
    tint: 'bg-accent-soft/40',
    bar: 'bg-accent',
  },
  emerald: {
    numBg: 'bg-emerald',
    name: 'text-emerald-text',
    border: 'border-emerald',
    tint: 'bg-emerald-soft/40',
    bar: 'bg-emerald',
  },
};

const COLS_WITH_MATERIAL = '32px 1fr 90px 90px 70px 40px';
const COLS_NO_MATERIAL = '32px 1fr 90px 70px 40px';

function deadlineChip(deadline: string | null, complete: boolean) {
  const days = daysLeft(deadline);
  if (!deadline || days == null)
    return { cls: 'bg-surface text-text-3', text: '📆 No deadline' };
  const short = new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  if (complete)
    return { cls: 'bg-emerald-soft text-emerald-text', text: `📆 ${short} · done` };
  if (days < 0)
    return { cls: 'bg-red-soft text-red-text', text: `📆 ${short} · ${Math.abs(days)}d late` };
  if (days <= 7)
    return { cls: 'bg-amber-soft text-amber-text', text: `📆 ${short} · ${days}d left` };
  return { cls: 'bg-surface text-text-3', text: `📆 ${short} · ${days}d left` };
}

export default function SowPhase({
  renovation,
  phase,
  grouped,
  editable,
}: {
  renovation: Renovation;
  phase: PhaseId;
  grouped: boolean;
  editable: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const addSowItem = useRenovationStore((s) => s.addSowItem);

  const meta = PHASE_META[phase];
  const tone = TONE[meta.tone];
  const items = phaseItems(renovation, phase);
  const showMaterial = hasAnyMaterial(items);
  const cols = showMaterial ? COLS_WITH_MATERIAL : COLS_NO_MATERIAL;
  const agg = aggregatePhase(items);
  const chip = deadlineChip(
    renovation.phases.find((p) => p.id === phase)?.deadline ?? null,
    agg.complete,
  );

  // Optional category grouping within the phase.
  const groups: { category: string; items: SOWItem[] }[] = [];
  if (grouped) {
    const map = new Map<string, SOWItem[]>();
    for (const it of items) {
      const key = it.category || 'Uncategorized';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    for (const [category, list] of map) groups.push({ category, items: list });
  }

  const addItem = () =>
    addSowItem(renovation.id, {
      id: `${renovation.id}-sow-${Date.now()}`,
      description: '',
      phase,
      laborCost: 0,
      materialCost: 0,
      completed: false,
      completionPct: 0,
    });

  const catSubtotal = (list: SOWItem[]) => ({
    labor: list.reduce((a, it) => a + it.laborCost, 0),
    material: list.reduce((a, it) => a + it.materialCost, 0),
    total: list.reduce((a, it) => a + itemTotal(it), 0),
  });

  return (
    <div className={`mb-3 overflow-hidden rounded border ${tone.border} ${tone.tint}`}>
      {/* Phase header */}
      <header className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white ${tone.numBg}`}
          >
            {phase}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[14px] font-bold ${tone.name}`}>
                {meta.name}
              </span>
              <span className="rounded bg-surface px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.05em] text-text-4">
                Stage {phase} of 3
              </span>
            </div>
            <div className="text-[11px] text-text-3">{meta.description}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`hidden items-center gap-1 rounded-md px-2 py-1 text-[11px] sm:inline-flex ${chip.cls}`}
          >
            {chip.text}
          </span>
          <div className="hidden w-20 sm:block">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
              <span
                className={`block h-full ${tone.bar}`}
                style={{ width: `${agg.progress}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] font-bold text-text">
            {agg.progress}%
          </span>
          <span className="hidden text-[11px] text-text-4 md:inline">
            {formatCurrency(agg.spent)} / {formatCurrency(agg.budget)}
          </span>
          <button
            className="text-text-4"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▸' : '▾'}
          </button>
        </div>
      </header>

      {!collapsed && (
        <div className="mx-3 mb-3 overflow-hidden rounded-lg border border-border bg-surface tabular-nums">
          {/* Column header */}
          <div
            className="grid border-b border-border bg-surface-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.05em] text-text-4"
            style={{ gridTemplateColumns: cols }}
          >
            <div />
            <div>Item</div>
            <div className="text-right">🔧 Labor</div>
            {showMaterial && <div className="text-right">📦 Material</div>}
            <div className="text-right">Total</div>
            <div />
          </div>

          {items.length === 0 ? (
            <div className="px-3 py-4 text-center text-[12px] text-text-4">
              No items in this phase yet.
            </div>
          ) : grouped ? (
            groups.map((g) => {
              const sub = catSubtotal(g.items);
              return (
                <div key={g.category}>
                  <div
                    className="grid bg-surface-2 px-3 py-1.5 text-[11px] font-bold text-text-2"
                    style={{ gridTemplateColumns: cols }}
                  >
                    <div />
                    <div>
                      🗂 {g.category}{' '}
                      <span className="font-normal text-text-4">
                        ({g.items.length})
                      </span>
                    </div>
                    <div className="text-right font-medium text-amber-text">
                      {formatCurrency(sub.labor)}
                    </div>
                    {showMaterial && (
                      <div className="text-right font-medium text-accent">
                        {formatCurrency(sub.material)}
                      </div>
                    )}
                    <div className="text-right text-text-3">
                      {formatCurrency(sub.total)}
                    </div>
                    <div />
                  </div>
                  {g.items.map((it) => (
                    <SowRow
                      key={it.id}
                      renovation={renovation}
                      item={it}
                      cols={cols}
                      showMaterial={showMaterial}
                      editable={editable}
                    />
                  ))}
                </div>
              );
            })
          ) : (
            items.map((it) => (
              <SowRow
                key={it.id}
                renovation={renovation}
                item={it}
                cols={cols}
                showMaterial={showMaterial}
                editable={editable}
              />
            ))
          )}

          {/* Phase subtotal */}
          {items.length > 0 && (
            <div
              className="grid border-t border-border bg-surface-2 px-3 py-2.5 text-[13px] font-bold"
              style={{ gridTemplateColumns: cols }}
            >
              <div />
              <div>Subtotal</div>
              <div className="text-right text-amber-text">
                {formatCurrency(items.reduce((a, it) => a + it.laborCost, 0))}
              </div>
              {showMaterial && (
                <div className="text-right text-accent">
                  {formatCurrency(
                    items.reduce((a, it) => a + it.materialCost, 0),
                  )}
                </div>
              )}
              <div className="text-right text-text">
                {formatCurrency(items.reduce((a, it) => a + itemTotal(it), 0))}
              </div>
              <div />
            </div>
          )}

          {editable && (
            <div className="border-t border-border px-3 py-2">
              <button
                className="text-[12px] font-semibold text-accent"
                onClick={addItem}
              >
                + Add item to {meta.name}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
