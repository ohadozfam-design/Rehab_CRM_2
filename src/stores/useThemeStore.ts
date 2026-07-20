import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../types';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Cycles auto → light → dark → auto. */
  cycleMode: () => void;
  /** Resolves 'auto' to a concrete theme: dark from 18:00 to 07:00, else light. */
  resolved: () => 'light' | 'dark';
}

/** Auto mode: dark from 18:00 up to (not including) 07:00. */
export function autoTheme(now = new Date()): 'light' | 'dark' {
  const hour = now.getHours();
  return hour >= 18 || hour < 7 ? 'dark' : 'light';
}

const CYCLE: Record<ThemeMode, ThemeMode> = {
  auto: 'light',
  light: 'dark',
  dark: 'auto',
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'auto',
      setMode: (mode) => set({ mode }),
      cycleMode: () => set({ mode: CYCLE[get().mode] }),
      resolved: () => {
        const { mode } = get();
        return mode === 'auto' ? autoTheme() : mode;
      },
    }),
    { name: 'rehab-crm-theme', version: 1 },
  ),
);
