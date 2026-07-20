import { useEffect } from 'react';
import {
  useAuthStore,
  useContactsStore,
  useNotificationStore,
  useRenovationStore,
  useSettingsStore,
  useThemeStore,
} from './stores';

/**
 * Step 1 diagnostic screen.
 *
 * This is intentionally NOT the final UI — Steps 2+ build login, the shell,
 * dashboard, SOW, financials and media on top of the state architecture below.
 * Its only job here is to prove every persisted store hydrates with seed data
 * and that the theme engine drives the document's data-theme attribute.
 */
export default function App() {
  const renovations = useRenovationStore((s) => s.renovations);
  const users = useAuthStore((s) => s.users);
  const notifications = useNotificationStore((s) => s.notifications);
  const contacts = useContactsStore((s) => s.contacts);
  const morningSnapshotTime = useSettingsStore((s) => s.morningSnapshotTime);
  const themeMode = useThemeStore((s) => s.mode);
  const resolvedTheme = useThemeStore((s) => s.resolved)();

  // Reflect the resolved theme on the <html> element for the CSS token layer.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const stores = [
    { key: 'rehab-crm-auth', label: 'Auth', count: `${users.length} users` },
    {
      key: 'rehab-crm-storage',
      label: 'Renovations',
      count: `${renovations.length} projects`,
    },
    {
      key: 'rehab-crm-notifications',
      label: 'Notifications',
      count: `${notifications.length} items`,
    },
    {
      key: 'rehab-crm-contacts',
      label: 'Contacts',
      count: `${contacts.length} contacts`,
    },
    {
      key: 'rehab-crm-settings',
      label: 'Settings',
      count: `snapshot @ ${morningSnapshotTime}`,
    },
    { key: 'rehab-crm-theme', label: 'Theme', count: themeMode },
  ];

  return (
    <div className="min-h-full px-6 py-12 text-fg-2">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-gold-700">
          Rehab CRM · Step 1
        </p>
        <h1 className="mt-2 font-display text-4xl text-gold-600">
          State Architecture Online
        </h1>
        <p className="mt-3 max-w-xl text-fg-3">
          All six persisted Zustand stores hydrated from LocalStorage with seed
          data. This diagnostic is replaced by the login and app shell in Step 2.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {stores.map((store) => (
            <div
              key={store.key}
              className="rounded-md border border-border-soft bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-fg-1">{store.label}</span>
                <span className="text-success" aria-hidden>
                  ●
                </span>
              </div>
              <div className="mt-1 font-mono text-xs text-fg-3">{store.key}</div>
              <div className="mt-2 text-sm text-fg-2">{store.count}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-md border border-border-soft bg-surface p-5">
          <h2 className="font-display text-2xl text-fg-1">Seeded projects</h2>
          <ul className="mt-3 space-y-2">
            {renovations.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between border-b border-border-soft pb-2 last:border-0 last:pb-0"
              >
                <span className="text-fg-1">{r.name}</span>
                <span className="font-mono text-xs uppercase tracking-wider text-gold-700">
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
