// Pure helpers for the Scope of Work module: item math, variance, tri-state
// cycling, and per-phase aggregates.

import type { CompletionPct, PhaseId, Renovation, SOWItem } from '../types';

export function itemTotal(it: SOWItem): number {
  return it.laborCost + it.materialCost;
}

/** Baseline total from the original (first-saved) costs, for variance. */
export function itemBaselineTotal(it: SOWItem): number {
  return (
    (it.originalLaborCost ?? it.laborCost) +
    (it.originalMaterialCost ?? it.materialCost)
  );
}

/** Current − baseline. Positive = over the original estimate. */
export function itemVariance(it: SOWItem): number {
  return itemTotal(it) - itemBaselineTotal(it);
}

export function completionOf(it: SOWItem): CompletionPct {
  if (it.completionPct != null) return it.completionPct;
  return it.completed ? 100 : 0;
}

/** Tri-state cycle: 0 → 50 → 100 → 0. */
export function nextCompletion(current: CompletionPct): CompletionPct {
  return current === 0 ? 50 : current === 50 ? 100 : 0;
}

/** The patch to apply when advancing an item's tri-state checkbox. */
export function completionPatch(next: CompletionPct): Partial<SOWItem> {
  return {
    completionPct: next,
    completed: next === 100,
    approvedAt: next === 100 ? new Date().toISOString() : undefined,
  };
}

export interface PhaseAggregate {
  budget: number;
  spent: number; // earned value: Σ total × pct
  progress: number; // avg completion %
  itemCount: number;
  complete: boolean;
}

/** Items that count toward stats (optional items are excluded). */
function counted(items: SOWItem[]): SOWItem[] {
  return items.filter((it) => !it.optional);
}

export function phaseItems(r: Renovation, phase: PhaseId): SOWItem[] {
  return r.sowItems.filter((it) => it.phase === phase);
}

export function aggregatePhase(items: SOWItem[]): PhaseAggregate {
  const stat = counted(items);
  const budget = stat.reduce((acc, it) => acc + itemTotal(it), 0);
  const spent = stat.reduce(
    (acc, it) => acc + (itemTotal(it) * completionOf(it)) / 100,
    0,
  );
  const progress =
    stat.length === 0
      ? 0
      : Math.round(
          stat.reduce((acc, it) => acc + completionOf(it), 0) / stat.length,
        );
  return {
    budget,
    spent,
    progress,
    itemCount: stat.length,
    complete: stat.length > 0 && progress === 100,
  };
}

/** True when at least one non-optional item in the set has a material cost. */
export function hasAnyMaterial(items: SOWItem[]): boolean {
  return counted(items).some((it) => it.materialCost > 0);
}

export interface SowSummary {
  total: number;
  completed: number;
  half: number;
  estTotal: number;
  originalTotal: number;
  variance: number;
}

export function summarize(r: Renovation): SowSummary {
  const items = counted(r.sowItems);
  const estTotal = items.reduce((acc, it) => acc + itemTotal(it), 0);
  const originalTotal = items.reduce((acc, it) => acc + itemBaselineTotal(it), 0);
  return {
    total: items.length,
    completed: items.filter((it) => completionOf(it) === 100).length,
    half: items.filter((it) => completionOf(it) === 50).length,
    estTotal,
    originalTotal,
    variance: estTotal - originalTotal,
  };
}

/** Days until an ISO date; negative when past. Null when no date. */
export function daysLeft(deadline: string | null, now = new Date()): number | null {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - now.getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}
