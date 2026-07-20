// Pure builder for the notification engine: given current projects + users,
// computes the set of notifications that SHOULD currently be active. The engine
// diffs this against stored notifications to fire new ones and resolve stale ones.

import type {
  NotificationKind,
  NotificationSeverity,
  Renovation,
  User,
} from '../types';
import { formatCurrency } from './format';
import {
  daysToDeadline,
  isOverBudget,
  isPastDeadline,
  projectProgress,
  projectSpent,
} from './metrics';
import { completionOf } from './sow';
import { lienRequired } from './finance';

export interface DesiredNotification {
  key: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  userId: string;
  renovationId?: string;
  relatedItemId?: string;
  title: string;
  message: string;
  /** Re-fire cadence in hours. */
  intervalHours: number;
}

export function notifKey(n: {
  kind: string;
  renovationId?: string;
  relatedItemId?: string;
  userId: string;
}): string {
  return `${n.kind}|${n.renovationId ?? ''}|${n.relatedItemId ?? ''}|${n.userId}`;
}

function overrunRecipients(r: Renovation, users: User[]): string[] {
  const ids = new Set<string>();
  for (const u of users) {
    if (u.role === 'admin') ids.add(u.id);
    if (u.role === 'manager' && (u.assignedProjectIds ?? []).includes(r.id))
      ids.add(u.id);
  }
  if (r.manager?.userId) ids.add(r.manager.userId);
  return [...ids];
}

function lienTarget(r: Renovation, users: User[], explicit?: string): string | null {
  if (explicit) return explicit;
  const contractor = users.find(
    (u) => u.role === 'contractor' && (u.assignedProjectIds ?? []).includes(r.id),
  );
  return contractor?.id ?? r.contractor?.userId ?? r.manager?.userId ?? null;
}

export function buildDesired(
  renovations: Renovation[],
  users: User[],
): DesiredNotification[] {
  const out: DesiredNotification[] = [];
  const add = (d: Omit<DesiredNotification, 'key'>) =>
    out.push({ ...d, key: notifKey(d) });

  for (const r of renovations) {
    // Rule 1 — assigned SOW item completed but with zero media proof.
    for (const item of r.sowItems) {
      if (
        item.assignedUserId &&
        completionOf(item) === 100 &&
        (item.media?.length ?? 0) === 0
      ) {
        add({
          kind: 'item-proof-needed',
          severity: 'warning',
          userId: item.assignedUserId,
          renovationId: r.id,
          relatedItemId: item.id,
          title: 'Upload completion photos',
          message: `"${item.description}" needs proof photos. Upload an image or video to confirm.`,
          intervalHours: 12,
        });
      }
    }

    // Rule 2 — lien-waiver-required entry with no uploaded waiver.
    for (const e of r.financialEntries) {
      if (lienRequired(e) && !e.lienWaiverUrl) {
        const target = lienTarget(r, users, e.contractorUserId);
        if (target) {
          add({
            kind: 'lien-waiver-needed',
            severity: 'critical',
            userId: target,
            renovationId: r.id,
            relatedItemId: e.id,
            title: 'Lien Waiver required',
            message: `Expense "${e.description}" of ${formatCurrency(e.amount)} requires a signed Lien Waiver.`,
            intervalHours: 24,
          });
        }
      }
    }

    // Rule 3 — budget / schedule overruns → admins + managers.
    const recipients = overrunRecipients(r, users);
    if (isOverBudget(r)) {
      const over = projectSpent(r) - r.totalBudget;
      for (const uid of recipients) {
        add({
          kind: 'budget-overrun',
          severity: 'critical',
          userId: uid,
          renovationId: r.id,
          title: `Over budget: ${r.name}`,
          message: `Spent ${formatCurrency(projectSpent(r))} of ${formatCurrency(r.totalBudget)} budget. ${formatCurrency(over)} over.`,
          intervalHours: 24,
        });
      }
    }
    if (isPastDeadline(r)) {
      for (const uid of recipients) {
        add({
          kind: 'schedule-overrun',
          severity: 'critical',
          userId: uid,
          renovationId: r.id,
          title: `Past deadline: ${r.name}`,
          message: `Project is ${Math.abs(daysToDeadline(r))} days past its deadline. Completion: ${projectProgress(r)}%.`,
          intervalHours: 24,
        });
      }
    }
  }

  return out;
}

/** Kinds the engine owns (so it never resolves manually-created notifications). */
export const ENGINE_KINDS: NotificationKind[] = [
  'item-proof-needed',
  'lien-waiver-needed',
  'budget-overrun',
  'schedule-overrun',
];

export function hoursSince(iso: string | undefined, now = new Date()): number {
  if (!iso) return Infinity;
  return (now.getTime() - new Date(iso).getTime()) / (1000 * 60 * 60);
}
