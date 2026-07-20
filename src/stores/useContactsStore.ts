import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Contact, Role } from '../types';
import { seedContacts } from '../data/mockData';

interface ContactsState {
  contacts: Contact[];
  add: (contact: Contact) => void;
  update: (id: string, patch: Partial<Contact>) => void;
  remove: (id: string) => void;
  byRole: (role: Role) => Contact[];
}

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      contacts: seedContacts,

      add: (contact) =>
        set((state) => ({ contacts: [...state.contacts, contact] })),

      update: (id, patch) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),

      remove: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),

      byRole: (role) => get().contacts.filter((c) => c.role === role),
    }),
    { name: 'rehab-crm-contacts', version: 1 },
  ),
);
