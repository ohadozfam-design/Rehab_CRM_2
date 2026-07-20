import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useUIStore } from '../stores/useUIStore';
import { ROLE_LABELS } from '../lib/constants';
import type { ThemeMode } from '../types';

const iconBtn =
  'p-1.5 rounded-md text-text-3 hover:bg-surface-2 hover:text-text text-sm leading-none inline-flex items-center justify-center transition-colors';

const THEME_LABEL: Record<ThemeMode, string> = {
  auto: '🌅 Auto',
  light: '☀ Light',
  dark: '🌙 Dark',
};

/** Top navigation bar for the authenticated app shell. */
export default function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser());
  const logout = useAuthStore((s) => s.logout);

  const mode = useThemeStore((s) => s.mode);
  const cycleMode = useThemeStore((s) => s.cycleMode);

  const unread = useNotificationStore((s) =>
    user ? s.unreadCount(user.id) : 0,
  );
  const openNewProject = useUIStore((s) => s.openNewProject);

  if (!user) return null;
  const isAdmin = user.role === 'admin';
  const canCreate = user.role === 'admin' || user.role === 'manager';

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
      <button
        className="flex items-center gap-2.5"
        onClick={() => navigate('/')}
        title="Dashboard"
      >
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-white">
          🏗
        </div>
        <div className="text-left">
          <h1 className="text-[15px] font-bold leading-tight text-text">
            Rehab CRM
          </h1>
          <p className="text-[11px] text-text-3">Renovation Management</p>
        </div>
      </button>

      <div className="flex items-center gap-1.5">
        <button
          className={iconBtn}
          title="Toggle theme (auto / light / dark)"
          onClick={cycleMode}
        >
          {THEME_LABEL[mode]}
        </button>

        <button className={`${iconBtn} relative`} title="Notifications">
          🔔
          {unread > 0 && (
            <sup className="text-[10px] font-extrabold text-red">{unread}</sup>
          )}
        </button>

        <button className={iconBtn} title="Settings">
          ⚙
        </button>

        {isAdmin && (
          <button className={iconBtn} title="Users">
            👥
          </button>
        )}

        <div className="px-2 text-right">
          <div className="text-[11px] font-bold text-text">{user.name}</div>
          <div className="text-[9px] uppercase tracking-[0.05em] text-text-4">
            {ROLE_LABELS[user.role]}
          </div>
        </div>

        {canCreate && (
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white"
            title="New Project"
            onClick={openNewProject}
          >
            + New Project
          </button>
        )}

        <button
          className={iconBtn}
          title="Sign out"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          ⎋
        </button>
      </div>
    </header>
  );
}
