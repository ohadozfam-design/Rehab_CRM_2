import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserTelemetry {
  featureCounts: Record<string, number>;
  totalActiveMs: number;
  sessions: number;
  lastActiveAt?: string;
}

interface TelemetryState {
  byUser: Record<string, UserTelemetry>;
  /** Increment a feature-usage counter for a user. */
  track: (userId: string, feature: string) => void;
  /** Accumulate active session time. */
  addActiveMs: (userId: string, ms: number) => void;
  /** Mark the start of a new session. */
  startSession: (userId: string) => void;
  get: (userId: string) => UserTelemetry;
}

const EMPTY: UserTelemetry = {
  featureCounts: {},
  totalActiveMs: 0,
  sessions: 0,
};

export const useTelemetryStore = create<TelemetryState>()(
  persist(
    (set, get) => ({
      byUser: {},

      track: (userId, feature) =>
        set((state) => {
          const cur = state.byUser[userId] ?? EMPTY;
          return {
            byUser: {
              ...state.byUser,
              [userId]: {
                ...cur,
                featureCounts: {
                  ...cur.featureCounts,
                  [feature]: (cur.featureCounts[feature] ?? 0) + 1,
                },
                lastActiveAt: new Date().toISOString(),
              },
            },
          };
        }),

      addActiveMs: (userId, ms) =>
        set((state) => {
          const cur = state.byUser[userId] ?? EMPTY;
          return {
            byUser: {
              ...state.byUser,
              [userId]: {
                ...cur,
                totalActiveMs: cur.totalActiveMs + ms,
                lastActiveAt: new Date().toISOString(),
              },
            },
          };
        }),

      startSession: (userId) =>
        set((state) => {
          const cur = state.byUser[userId] ?? EMPTY;
          return {
            byUser: {
              ...state.byUser,
              [userId]: { ...cur, sessions: cur.sessions + 1 },
            },
          };
        }),

      get: (userId) => get().byUser[userId] ?? EMPTY,
    }),
    { name: 'remo-telemetry', version: 1 },
  ),
);
