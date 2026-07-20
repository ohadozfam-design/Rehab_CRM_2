import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FinancialEntry,
  Photo,
  Renovation,
  SowItem,
  Update,
  User,
} from '../types';
import { seedRenovations } from '../data/mockData';

interface RenovationState {
  renovations: Renovation[];

  // --- Aggregate CRUD ---
  addRenovation: (renovation: Renovation) => void;
  updateRenovation: (id: string, patch: Partial<Renovation>) => void;
  removeRenovation: (id: string) => void;
  getById: (id: string) => Renovation | undefined;

  // --- Role gating: projects a user is allowed to see ---
  visibleFor: (user: User | null) => Renovation[];

  // --- Nested mutators (used by SOW, financials, media, feed modules) ---
  updateSowItem: (
    renovationId: string,
    itemId: string,
    patch: Partial<SowItem>,
  ) => void;
  addFinancialEntry: (renovationId: string, entry: FinancialEntry) => void;
  updateFinancialEntry: (
    renovationId: string,
    entryId: string,
    patch: Partial<FinancialEntry>,
  ) => void;
  addPhoto: (renovationId: string, photo: Photo) => void;
  removePhoto: (renovationId: string, photoId: string) => void;
  addUpdate: (renovationId: string, update: Update) => void;
}

/** Immutably maps over one renovation by id. */
function mapRenovation(
  renovations: Renovation[],
  id: string,
  fn: (r: Renovation) => Renovation,
): Renovation[] {
  return renovations.map((r) => (r.id === id ? fn(r) : r));
}

export const useRenovationStore = create<RenovationState>()(
  persist(
    (set, get) => ({
      renovations: seedRenovations,

      addRenovation: (renovation) =>
        set((state) => ({ renovations: [...state.renovations, renovation] })),

      updateRenovation: (id, patch) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, id, (r) => ({
            ...r,
            ...patch,
          })),
        })),

      removeRenovation: (id) =>
        set((state) => ({
          renovations: state.renovations.filter((r) => r.id !== id),
        })),

      getById: (id) => get().renovations.find((r) => r.id === id),

      visibleFor: (user) => {
        const all = get().renovations;
        if (!user) return [];
        // Admin and viewer see everything; managers/contractors see only assigned.
        if (user.role === 'admin' || user.role === 'viewer') return all;
        return all.filter((r) => user.assignedRenovationIds.includes(r.id));
      },

      updateSowItem: (renovationId, itemId, patch) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            sowItems: r.sowItems.map((it) =>
              it.id === itemId ? { ...it, ...patch } : it,
            ),
          })),
        })),

      addFinancialEntry: (renovationId, entry) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            financialEntries: [...r.financialEntries, entry],
          })),
        })),

      updateFinancialEntry: (renovationId, entryId, patch) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            financialEntries: r.financialEntries.map((e) =>
              e.id === entryId ? { ...e, ...patch } : e,
            ),
          })),
        })),

      addPhoto: (renovationId, photo) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            photos: [...r.photos, photo],
          })),
        })),

      removePhoto: (renovationId, photoId) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            photos: r.photos.filter((p) => p.id !== photoId),
          })),
        })),

      addUpdate: (renovationId, update) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            updates: [update, ...r.updates],
          })),
        })),
    }),
    { name: 'rehab-crm-storage' },
  ),
);
