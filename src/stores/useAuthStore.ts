import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Responsibility, Role, User } from '../types';
import { seedUsers } from '../data/mockData';

interface AuthState {
  users: User[];
  currentUserId: string | null;
  /** When set, an admin is impersonating currentUserId; holds the admin's id. */
  impersonatorId: string | null;

  // --- Session ---
  /** Attempts a username/password login; returns true on success. */
  login: (username: string, password: string) => boolean;
  logout: () => void;
  currentUser: () => User | null;
  hasRole: (...roles: Role[]) => boolean;
  /** Admin bypasses all responsibility checks; others need the responsibility. */
  hasResponsibility: (responsibility: Responsibility) => boolean;

  // --- Impersonation (admin support tool) ---
  impersonate: (userId: string) => void;
  stopImpersonating: () => void;

  // --- User CRUD (admin) ---
  addUser: (user: User) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  removeUser: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUserId: null,
      impersonatorId: null,

      login: (username, password) => {
        const match = get().users.find(
          (u) => u.username === username && u.password === password,
        );
        if (!match) return false;
        set({ currentUserId: match.id, impersonatorId: null });
        return true;
      },

      logout: () => set({ currentUserId: null, impersonatorId: null }),

      impersonate: (userId) => {
        const { currentUserId, impersonatorId, users } = get();
        const admin = users.find((u) => u.id === currentUserId);
        if (!admin || admin.role !== 'admin') return;
        if (!users.some((u) => u.id === userId)) return;
        // Preserve the original admin id (don't overwrite if already impersonating).
        set({
          currentUserId: userId,
          impersonatorId: impersonatorId ?? currentUserId,
        });
      },

      stopImpersonating: () => {
        const { impersonatorId } = get();
        if (!impersonatorId) return;
        set({ currentUserId: impersonatorId, impersonatorId: null });
      },

      currentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId) ?? null;
      },

      hasRole: (...roles) => {
        const user = get().currentUser();
        return user ? roles.includes(user.role) : false;
      },

      hasResponsibility: (responsibility) => {
        const user = get().currentUser();
        if (!user) return false;
        if (user.role === 'admin') return true;
        return (user.responsibilities ?? []).includes(responsibility);
      },

      addUser: (user) => set((state) => ({ users: [...state.users, user] })),

      updateUser: (id, patch) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),

      removeUser: (id) =>
        set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
    }),
    { name: 'rehab-crm-auth', version: 1 },
  ),
);
