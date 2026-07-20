import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FinancialEntry,
  MediaItem,
  ProjectUpdate,
  Receipt,
  Renovation,
  SOWItem,
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
  addSowItem: (renovationId: string, item: SOWItem) => void;
  updateSowItem: (
    renovationId: string,
    itemId: string,
    patch: Partial<SOWItem>,
  ) => void;
  removeSowItem: (renovationId: string, itemId: string) => void;
  addFinancialEntry: (renovationId: string, entry: FinancialEntry) => void;
  updateFinancialEntry: (
    renovationId: string,
    entryId: string,
    patch: Partial<FinancialEntry>,
  ) => void;
  addItemMedia: (
    renovationId: string,
    itemId: string,
    media: MediaItem,
  ) => void;
  addReceipt: (renovationId: string, receipt: Receipt) => void;
  updateReceipt: (
    renovationId: string,
    receiptId: string,
    patch: Partial<Receipt>,
  ) => void;
  removeReceipt: (renovationId: string, receiptId: string) => void;
  addUpdate: (renovationId: string, update: ProjectUpdate) => void;
}

/** Immutably maps over one renovation by id, bumping updatedAt. */
function mapRenovation(
  renovations: Renovation[],
  id: string,
  fn: (r: Renovation) => Renovation,
): Renovation[] {
  const stamp = new Date().toISOString();
  return renovations.map((r) =>
    r.id === id ? { ...fn(r), updatedAt: stamp } : r,
  );
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
        const assigned = user.assignedProjectIds ?? [];
        return all.filter((r) => assigned.includes(r.id));
      },

      addSowItem: (renovationId, item) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            sowItems: [...r.sowItems, item],
          })),
        })),

      updateSowItem: (renovationId, itemId, patch) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            sowItems: r.sowItems.map((it) =>
              it.id === itemId ? { ...it, ...patch } : it,
            ),
          })),
        })),

      removeSowItem: (renovationId, itemId) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            sowItems: r.sowItems.filter((it) => it.id !== itemId),
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

      addItemMedia: (renovationId, itemId, media) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            sowItems: r.sowItems.map((it) =>
              it.id === itemId
                ? { ...it, media: [...(it.media ?? []), media] }
                : it,
            ),
          })),
        })),

      addReceipt: (renovationId, receipt) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            receipts: [...(r.receipts ?? []), receipt],
          })),
        })),

      updateReceipt: (renovationId, receiptId, patch) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            receipts: (r.receipts ?? []).map((rc) =>
              rc.id === receiptId ? { ...rc, ...patch } : rc,
            ),
          })),
        })),

      removeReceipt: (renovationId, receiptId) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            receipts: (r.receipts ?? []).filter((rc) => rc.id !== receiptId),
          })),
        })),

      addUpdate: (renovationId, update) =>
        set((state) => ({
          renovations: mapRenovation(state.renovations, renovationId, (r) => ({
            ...r,
            updates: [update, ...(r.updates ?? [])],
          })),
        })),
    }),
    { name: 'rehab-crm-storage', version: 1 },
  ),
);
