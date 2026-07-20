import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, User } from '../types';
import { seedUsers } from '../data/mockData';

interface AuthState {
  users: User[];
  currentUserId: string | null;
  /** Attempts a username/password login; returns true on success. */
  login: (username: string, password: string) => boolean;
  logout: () => void;
  currentUser: () => User | null;
  hasRole: (...roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUserId: null,

      login: (username, password) => {
        const match = get().users.find(
          (u) => u.username === username && u.password === password,
        );
        if (!match) return false;
        set({ currentUserId: match.id });
        return true;
      },

      logout: () => set({ currentUserId: null }),

      currentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId) ?? null;
      },

      hasRole: (...roles) => {
        const user = get().currentUser();
        return user ? roles.includes(user.role) : false;
      },
    }),
    { name: 'rehab-crm-auth' },
  ),
);
