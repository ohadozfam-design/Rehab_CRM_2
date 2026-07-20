import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../types';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Resolves 'auto' to a concrete theme: dark from 18:00 to 07:00, else light. */
  resolved: () => 'light' | 'dark';
}

function autoTheme(now = new Date()): 'light' | 'dark' {
  const hour = now.getHours();
  return hour >= 18 || hour < 7 ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'auto',
      setMode: (mode) => set({ mode }),
      resolved: () => {
        const { mode } = get();
        return mode === 'auto' ? autoTheme() : mode;
      },
    }),
    { name: 'rehab-crm-theme' },
  ),
);
