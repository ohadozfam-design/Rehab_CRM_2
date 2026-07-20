import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification } from '../types';
import { seedNotifications } from '../data/mockData';

interface NotificationState {
  notifications: AppNotification[];
  add: (notification: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: (userId: string | null) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  /** Notifications targeted at a user (plus system-wide ones with null target). */
  forUser: (userId: string | null) => AppNotification[];
  unreadCount: (userId: string | null) => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: seedNotifications,

      add: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      markAllRead: (userId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.targetUserId === userId || n.targetUserId === null
              ? { ...n, read: true }
              : n,
          ),
        })),

      remove: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      forUser: (userId) =>
        get().notifications.filter(
          (n) => n.targetUserId === userId || n.targetUserId === null,
        ),

      unreadCount: (userId) =>
        get()
          .forUser(userId)
          .filter((n) => !n.read).length,
    }),
    { name: 'rehab-crm-notifications' },
  ),
);
