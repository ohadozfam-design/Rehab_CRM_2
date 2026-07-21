import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useTelemetryStore } from '../stores/useTelemetryStore';

const TICK_MS = 15_000;

/**
 * Records session activity for the current user: counts a session on login and
 * accumulates active time while the tab is visible. Feeds the admin telemetry.
 * Renders nothing.
 */
export default function ActivityTracker() {
  const userId = useAuthStore((s) => s.currentUserId);

  useEffect(() => {
    if (!userId) return;
    const telemetry = useTelemetryStore.getState();
    telemetry.startSession(userId);

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        useTelemetryStore.getState().addActiveMs(userId, TICK_MS);
      }
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [userId]);

  return null;
}
