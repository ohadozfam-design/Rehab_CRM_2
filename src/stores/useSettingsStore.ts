import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  morningSnapshotEnabled: true,
  morningSnapshotTime: '08:00',
};

interface SettingsState {
  /** Per-user preferences, keyed by user id. */
  byUserId: Record<string, UserSettings>;
  getForUser: (userId: string) => UserSettings;
  update: (userId: string, patch: Partial<UserSettings>) => void;
  markSnapshotShown: (userId: string, isoDate: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      byUserId: {},

      getForUser: (userId) => get().byUserId[userId] ?? DEFAULT_SETTINGS,

      update: (userId, patch) =>
        set((state) => ({
          byUserId: {
            ...state.byUserId,
            [userId]: {
              ...DEFAULT_SETTINGS,
              ...state.byUserId[userId],
              ...patch,
            },
          },
        })),

      markSnapshotShown: (userId, isoDate) =>
        get().update(userId, { lastSnapshotShownDate: isoDate }),
    }),
    { name: 'rehab-crm-settings', version: 1 },
  ),
);
