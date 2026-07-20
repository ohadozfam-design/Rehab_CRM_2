// Finance math: the three loan models, daily interest accrual, true project
// cost, budget health, schedule meter, and the lien-waiver enforcement rule.

import type { FinancialEntry, LoanInfo, Renovation } from '../types';
import { projectProgress, projectSpent } from './metrics';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Monthly payment for a loan per its model. */
export function monthlyPayment(loan: LoanInfo): number {
  if (!loan.enabled || loan.principal <= 0) return 0;
  const r = loan.interestRate / 100 / 12;
  switch (loan.loanType) {
    case 'interest-only':
      // Hard-money rehab default: principal × APR / 12.
      return loan.principal * r;
    case 'amortized': {
      if (r === 0) return loan.principal / loan.termMonths;
      const f = Math.pow(1 + r, loan.termMonths);
      return (loan.principal * r * f) / (f - 1);
    }
    case 'manual':
      return loan.monthlyPayment;
    default:
      return 0;
  }
}

/** Total interest over the full term. */
export function totalInterest(loan: LoanInfo): number {
  if (!loan.enabled || loan.principal <= 0) return 0;
  const monthly = monthlyPayment(loan);
  switch (loan.loanType) {
    case 'interest-only':
      return monthly * loan.termMonths; // principal is a balloon, all interest
    case 'amortized':
    case 'manual':
      return Math.max(0, monthly * loan.termMonths - loan.principal);
    default:
      return 0;
  }
}

/** Interest accrued to date, tracked daily on the principal. Capped at total. */
export function accruedInterest(loan: LoanInfo, now = new Date()): number {
  if (!loan.enabled || loan.principal <= 0 || !loan.startDate) return 0;
  const start = new Date(loan.startDate).getTime();
  const elapsedDays = Math.max(0, Math.floor((now.getTime() - start) / DAY_MS));
  const dailyRate = loan.interestRate / 100 / 365;
  const accrued = loan.principal * dailyRate * elapsedDays;
  return Math.min(accrued, totalInterest(loan));
}

/** Interest-only loans balloon the full principal at term end. */
export function balloonDue(loan: LoanInfo): number {
  return loan.enabled && loan.loanType === 'interest-only' ? loan.principal : 0;
}

/** Cash spent + interest accrued so far. */
export function trueProjectCost(r: Renovation, now = new Date()): number {
  const spent = projectSpent(r);
  const interest = r.loan ? accruedInterest(r.loan, now) : 0;
  return spent + interest;
}

export type HealthStatus = 'emerald' | 'amber' | 'red';

export interface BudgetHealth {
  status: HealthStatus;
  label: string;
  trueCost: number;
  usedPct: number;
  variance: number; // budget − trueCost (negative = over)
}

export function budgetHealth(r: Renovation, now = new Date()): BudgetHealth {
  const trueCost = trueProjectCost(r, now);
  const usedPct =
    r.totalBudget > 0 ? Math.round((trueCost / r.totalBudget) * 100) : 0;
  const variance = r.totalBudget - trueCost;
  let status: HealthStatus = 'emerald';
  let label = 'On budget';
  if (trueCost > r.totalBudget) {
    status = 'red';
    label = 'Over budget';
  } else if (usedPct >= 90) {
    status = 'amber';
    label = 'Near budget';
  }
  return { status, label, trueCost, usedPct, variance };
}

export interface ScheduleMeter {
  workPct: number;
  timePct: number;
  daysTotal: number;
  daysElapsed: number;
  daysLeft: number;
  behind: boolean; // time is >10% ahead of work
  onTrack: boolean;
}

export function scheduleMeter(r: Renovation, now = new Date()): ScheduleMeter {
  const start = new Date(r.startDate).getTime();
  const end = new Date(r.deadline).getTime();
  const daysTotal = Math.max(1, Math.round((end - start) / DAY_MS));
  const daysElapsed = Math.max(
    0,
    Math.min(daysTotal, Math.round((now.getTime() - start) / DAY_MS)),
  );
  const daysLeft = Math.ceil((end - now.getTime()) / DAY_MS);
  const workPct = projectProgress(r);
  const timePct = Math.round((daysElapsed / daysTotal) * 100);
  const behind = r.status !== 'completed' && timePct - workPct > 10;
  return {
    workPct,
    timePct,
    daysTotal,
    daysElapsed,
    daysLeft,
    behind,
    onTrack: !behind,
  };
}

/**
 * Lien-waiver enforcement rule: a labor/material entry over $600 requires a
 * signed waiver. Honors an explicit stored flag too.
 */
export function lienRequired(entry: FinancialEntry): boolean {
  if (entry.lienWaiverRequired) return true;
  return (
    (entry.category === 'labor' || entry.category === 'material') &&
    entry.amount > 600
  );
}

export type WaiverState = 'none' | 'needed' | 'on-file';

export function waiverState(entry: FinancialEntry): WaiverState {
  if (!lienRequired(entry)) return 'none';
  return entry.lienWaiverUrl ? 'on-file' : 'needed';
}
