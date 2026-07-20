import { create } from 'zustand';

/**
 * Transient (non-persisted) UI state — modal visibility and other ephemeral
 * flags that shouldn't survive a reload. Kept separate from the 6 domain stores.
 */
interface UIState {
  newProjectOpen: boolean;
  openNewProject: () => void;
  closeNewProject: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  newProjectOpen: false,
  openNewProject: () => set({ newProjectOpen: true }),
  closeNewProject: () => set({ newProjectOpen: false }),
}));
