import { create } from 'zustand';

/**
 * Transient (non-persisted) UI state — modal visibility and ephemeral view
 * flags that shouldn't survive a reload. Separate from the domain stores.
 */
interface UIState {
  newProjectOpen: boolean;
  settingsOpen: boolean;
  adminOpen: boolean;
  /** Simplified contractor field view (mobile-first proof capture). */
  fieldView: boolean;

  openNewProject: () => void;
  closeNewProject: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openAdmin: () => void;
  closeAdmin: () => void;
  setFieldView: (on: boolean) => void;
  toggleFieldView: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  newProjectOpen: false,
  settingsOpen: false,
  adminOpen: false,
  fieldView: false,

  openNewProject: () => set({ newProjectOpen: true }),
  closeNewProject: () => set({ newProjectOpen: false }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openAdmin: () => set({ adminOpen: true }),
  closeAdmin: () => set({ adminOpen: false }),
  setFieldView: (on) => set({ fieldView: on }),
  toggleFieldView: () => set((s) => ({ fieldView: !s.fieldView })),
}));
