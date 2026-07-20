import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types';
import { seedSettings } from '../data/mockData';

interface SettingsState extends Settings {
  setMorningSnapshotTime: (time: string) => void;
  markSnapshotShown: (isoDate: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...seedSettings,

      setMorningSnapshotTime: (time) => set({ morningSnapshotTime: time }),

      markSnapshotShown: (isoDate) => set({ lastSnapshotShownDate: isoDate }),
    }),
    { name: 'rehab-crm-settings' },
  ),
);
