import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification } from '../types';
import { seedNotifications } from '../data/mockData';

/** A notification is "active" if it hasn't been resolved or dismissed. */
function isActive(n: AppNotification): boolean {
  return !n.resolved && !n.dismissedAt;
}

interface NotificationState {
  notifications: AppNotification[];
  add: (notification: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  dismiss: (id: string) => void;
  resolve: (id: string) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  /** Active notifications targeted at a user. */
  forUser: (userId: string) => AppNotification[];
  /** Count of active, unread notifications for a user (drives the bell badge). */
  unreadCount: (userId: string) => number;
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
            n.id === id && !n.readAt
              ? { ...n, readAt: new Date().toISOString() }
              : n,
          ),
        })),

      markAllRead: (userId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId && !n.readAt
              ? { ...n, readAt: new Date().toISOString() }
              : n,
          ),
        })),

      dismiss: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, dismissedAt: new Date().toISOString() } : n,
          ),
        })),

      resolve: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, resolved: true } : n,
          ),
        })),

      remove: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      forUser: (userId) =>
        get().notifications.filter((n) => n.userId === userId && isActive(n)),

      unreadCount: (userId) =>
        get()
          .forUser(userId)
          .filter((n) => !n.readAt).length,
    }),
    { name: 'rehab-crm-notifications', version: 1 },
  ),
);
