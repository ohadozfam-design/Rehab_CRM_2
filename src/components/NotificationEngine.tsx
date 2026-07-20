import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useRenovationStore } from '../stores/useRenovationStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import {
  buildDesired,
  ENGINE_KINDS,
  hoursSince,
  notifKey,
} from '../lib/notifications';
import type { AppNotification } from '../types';

const TICK_MS = 60_000; // "cron" cadence: once per minute

/**
 * Background notification engine. On mount and every minute it reconciles the
 * desired notification set (item-proof-needed, lien-waiver-needed, budget/
 * schedule overruns) against the store: firing new reminders, re-firing stale
 * ones past their interval, and resolving ones whose condition no longer holds.
 * Renders nothing.
 */
export default function NotificationEngine() {
  useEffect(() => {
    const reconcile = () => {
      const now = new Date();
      const renovations = useRenovationStore.getState().renovations;
      const users = useAuthStore.getState().users;
      const notifStore = useNotificationStore.getState();

      const desired = buildDesired(renovations, users);
      const desiredKeys = new Set(desired.map((d) => d.key));

      // Latest notification per key (across every state), for interval checks.
      const latestByKey = new Map<string, AppNotification>();
      for (const n of notifStore.notifications) {
        const key = notifKey(n);
        const prev = latestByKey.get(key);
        if (!prev || hoursSince(n.lastFiredAt, now) < hoursSince(prev.lastFiredAt, now)) {
          latestByKey.set(key, n);
        }
      }

      // Fire / re-fire desired notifications.
      for (const d of desired) {
        const existing = latestByKey.get(d.key);
        if (!existing) {
          notifStore.add({
            id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            userId: d.userId,
            kind: d.kind,
            severity: d.severity,
            title: d.title,
            message: d.message,
            renovationId: d.renovationId,
            relatedItemId: d.relatedItemId,
            createdAt: now.toISOString(),
            lastFiredAt: now.toISOString(),
          });
        } else if (existing.resolved || existing.dismissedAt) {
          // Only re-surface a cleared/dismissed reminder once its interval passes.
          if (hoursSince(existing.lastFiredAt, now) >= d.intervalHours) {
            notifStore.add({
              id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              userId: d.userId,
              kind: d.kind,
              severity: d.severity,
              title: d.title,
              message: d.message,
              renovationId: d.renovationId,
              relatedItemId: d.relatedItemId,
              createdAt: now.toISOString(),
              lastFiredAt: now.toISOString(),
            });
          }
        } else if (hoursSince(existing.lastFiredAt, now) >= d.intervalHours) {
          notifStore.refire(existing.id);
        }
      }

      // Resolve active engine-owned notifications no longer desired.
      for (const n of notifStore.notifications) {
        if (
          ENGINE_KINDS.includes(n.kind) &&
          !n.resolved &&
          !n.dismissedAt &&
          !desiredKeys.has(notifKey(n))
        ) {
          notifStore.resolve(n.id);
        }
      }
    };

    reconcile();
    const timer = window.setInterval(reconcile, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
