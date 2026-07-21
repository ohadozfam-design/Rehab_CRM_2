import { Moon, Sun, SunMoon } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useUIStore } from '../stores/useUIStore';
import type { ThemeMode } from '../types';
import Modal from './ui/Modal';

const THEME_OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
  { mode: 'auto', label: 'Auto', Icon: SunMoon },
];

export default function SettingsModal() {
  const open = useUIStore((s) => s.settingsOpen);
  const close = useUIStore((s) => s.closeSettings);
  const user = useAuthStore((s) => s.currentUser());
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const settings = useSettingsStore((s) =>
    user ? s.getForUser(user.id) : null,
  );
  const update = useSettingsStore((s) => s.update);

  if (!open || !user || !settings) return null;

  return (
    <Modal title="Settings" onClose={close} maxWidth={440}>
      <div className="space-y-6">
        <section>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">
            Appearance
          </div>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ mode: m, label, Icon }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-[12px] font-medium transition-colors ${
                  mode === m
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border text-text-3 hover:border-border-strong'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-text-4">
            Auto follows the time of day (dark 18:00–07:00).
          </p>
        </section>

        <section>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">
            Morning Snapshot
          </div>
          <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-[13px] text-text">
            <span>Show a daily summary on first open</span>
            <input
              type="checkbox"
              checked={settings.morningSnapshotEnabled}
              onChange={(e) =>
                update(user.id, { morningSnapshotEnabled: e.target.checked })
              }
            />
          </label>
          {settings.morningSnapshotEnabled && (
            <label className="mt-2 flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-[13px] text-text">
              <span>Show after</span>
              <input
                type="time"
                value={settings.morningSnapshotTime}
                onChange={(e) =>
                  update(user.id, { morningSnapshotTime: e.target.value })
                }
                className="rounded-md border border-border-strong bg-surface px-2 py-1 text-[13px] text-text outline-none focus:border-accent"
              />
            </label>
          )}
        </section>
      </div>
    </Modal>
  );
}
