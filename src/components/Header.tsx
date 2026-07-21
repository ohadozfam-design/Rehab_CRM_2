import { useNavigate } from 'react-router-dom';
import {
  Building2,
  LogOut,
  Moon,
  Plus,
  Settings,
  Smartphone,
  Sun,
  SunMoon,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useUIStore } from '../stores/useUIStore';
import NotificationBell from './NotificationBell';
import { ROLE_LABELS } from '../lib/constants';
import type { ThemeMode } from '../types';

const iconBtn =
  'p-2 rounded-md text-text-3 hover:bg-surface-2 hover:text-text inline-flex items-center justify-center transition-colors';

const THEME_META: Record<ThemeMode, { Icon: typeof Sun; label: string }> = {
  auto: { Icon: SunMoon, label: 'Auto' },
  light: { Icon: Sun, label: 'Light' },
  dark: { Icon: Moon, label: 'Dark' },
};

/** Top navigation bar for the authenticated app shell. */
export default function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser());
  const logout = useAuthStore((s) => s.logout);

  const mode = useThemeStore((s) => s.mode);
  const cycleMode = useThemeStore((s) => s.cycleMode);

  const openNewProject = useUIStore((s) => s.openNewProject);
  const openSettings = useUIStore((s) => s.openSettings);
  const openAdmin = useUIStore((s) => s.openAdmin);
  const toggleFieldView = useUIStore((s) => s.toggleFieldView);

  if (!user) return null;
  const isAdmin = user.role === 'admin';
  const isContractor = user.role === 'contractor';
  const canCreate = user.role === 'admin' || user.role === 'manager';
  const theme = THEME_META[mode];

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
      <button
        className="flex items-center gap-3"
        onClick={() => navigate('/')}
        title="Dashboard"
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-text text-bg">
          <Building2 size={18} strokeWidth={2.25} />
        </div>
        <div className="text-left">
          <h1 className="text-[16px] font-bold leading-tight tracking-tight text-text">
            REMO
          </h1>
          <p className="text-[11px] tracking-wide text-text-3">
            Renovation Management
          </p>
        </div>
      </button>

      <div className="flex items-center gap-1">
        <button
          className={`${iconBtn} gap-1.5 px-2.5 text-[12px] font-medium`}
          title="Toggle theme (auto / light / dark)"
          onClick={cycleMode}
        >
          <theme.Icon size={16} />
          <span className="hidden sm:inline">{theme.label}</span>
        </button>

        <NotificationBell />

        {isContractor && (
          <button
            className={iconBtn}
            title="Field view (mobile)"
            onClick={toggleFieldView}
          >
            <Smartphone size={18} />
          </button>
        )}

        <button className={iconBtn} title="Settings" onClick={openSettings}>
          <Settings size={18} />
        </button>

        {isAdmin && (
          <button
            className={iconBtn}
            title="Admin command center"
            onClick={openAdmin}
          >
            <Users size={18} />
          </button>
        )}

        <div className="mx-2 hidden text-right sm:block">
          <div className="text-[12px] font-semibold text-text">{user.name}</div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-text-4">
            {ROLE_LABELS[user.role]}
          </div>
        </div>

        {canCreate && (
          <button
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent-2"
            title="New Project"
            onClick={openNewProject}
          >
            <Plus size={16} />
            <span className="hidden md:inline">New Project</span>
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
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
