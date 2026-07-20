// Derived project metrics. All dashboard/finance numbers compute from raw state
// so they stay correct as SOW items and financial entries change.

import type { Renovation, SOWItem } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Non-optional SOW items — the ones that count toward stats. */
export function countedItems(r: Renovation): SOWItem[] {
  return r.sowItems.filter((it) => !it.optional);
}

/** Completion % = average of each counted item's completionPct (0/50/100). */
export function projectProgress(r: Renovation): number {
  const items = countedItems(r);
  if (items.length === 0) return r.status === 'completed' ? 100 : 0;
  const sum = items.reduce((acc, it) => acc + (it.completionPct ?? 0), 0);
  return Math.round(sum / items.length);
}

/** Total cash spent = sum of every financial entry. */
export function projectSpent(r: Renovation): number {
  return r.financialEntries.reduce((acc, e) => acc + e.amount, 0);
}

/** Sum of labor + material estimates across counted items. */
export function sowEstimateTotal(r: Renovation): number {
  return countedItems(r).reduce(
    (acc, it) => acc + it.laborCost + it.materialCost,
    0,
  );
}

export function budgetUsedPct(r: Renovation): number {
  if (r.totalBudget <= 0) return 0;
  return Math.round((projectSpent(r) / r.totalBudget) * 100);
}

/** Whole days until the deadline; negative when past. */
export function daysToDeadline(r: Renovation, now = new Date()): number {
  const deadline = new Date(r.deadline).getTime();
  return Math.ceil((deadline - now.getTime()) / DAY_MS);
}

export function isOverBudget(r: Renovation): boolean {
  return projectSpent(r) > r.totalBudget;
}

export function isPastDeadline(r: Renovation, now = new Date()): boolean {
  return r.status !== 'completed' && daysToDeadline(r, now) < 0;
}

export interface DashboardKpis {
  activeCount: number;
  inProgressCount: number;
  completedCount: number;
  totalSpent: number;
  totalBudget: number;
  avgCompletion: number;
}

/** Aggregate KPIs across a set of (already role-filtered) projects. */
export function computeKpis(projects: Renovation[]): DashboardKpis {
  const active = projects.filter((p) => p.status !== 'completed');
  const inProgress = projects.filter((p) => p.status === 'in-progress');
  const completed = projects.filter((p) => p.status === 'completed');

  const avgCompletion =
    active.length === 0
      ? 0
      : Math.round(
          active.reduce((acc, p) => acc + projectProgress(p), 0) / active.length,
        );

  return {
    activeCount: active.length,
    inProgressCount: inProgress.length,
    completedCount: completed.length,
    totalSpent: projects.reduce((acc, p) => acc + projectSpent(p), 0),
    totalBudget: projects.reduce((acc, p) => acc + p.totalBudget, 0),
    avgCompletion,
  };
}
