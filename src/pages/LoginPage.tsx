import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, Lock, LogIn, User } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

interface DemoAccount {
  username: string;
  password: string;
  role: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { username: 'admin', password: 'admin', role: 'Admin (all projects)' },
  { username: 'manager', password: 'manager', role: 'Manager (Pursell + Clay)' },
  { username: 'doolin', password: 'doolin', role: 'Contractor (Pursell only)' },
  { username: 'eran', password: 'eran', role: 'Contractor (Clay only)' },
  { username: 'viewer', password: 'viewer', role: 'Viewer (read-only)' },
];

const fieldLabel =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.05em] text-text-3';
const fieldInput =
  'w-full rounded-lg border border-border-strong bg-surface py-2.5 pl-9 pr-3 text-[13px] text-text outline-none focus:border-accent';

export default function LoginPage() {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Already signed in — bounce to the dashboard.
  if (currentUserId) return <Navigate to="/" replace />;

  const attempt = (u: string, p: string) => {
    if (login(u, p)) {
      navigate('/', { replace: true });
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div
      className="flex min-h-full items-center justify-center p-10"
      style={{
        background: 'linear-gradient(135deg, var(--accent-soft), var(--surface-2))',
      }}
    >
      <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-8 shadow-lg">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-[14px] bg-text text-bg">
          <Building2 size={26} strokeWidth={2.25} />
        </div>
        <h2 className="text-center text-[24px] font-bold tracking-tight text-text">
          REMO
        </h2>
        <p className="mb-6 text-center text-[13px] text-text-3">
          Renovation Management · Sign in to continue
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            attempt(username, password);
          }}
        >
          <div className="mb-3.5">
            <label className={fieldLabel} htmlFor="username">
              Username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4">
                <User size={16} />
              </span>
              <input
                id="username"
                type="text"
                className={fieldInput}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="mb-3.5">
            <label className={fieldLabel} htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4">
                <Lock size={16} />
              </span>
              <input
                id="password"
                type="password"
                className={fieldInput}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <p className="mb-3 text-[12px] font-medium text-red-text">{error}</p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-2"
          >
            <LogIn size={16} /> Sign In
          </button>
        </form>

        <div className="mt-4 rounded-xl bg-surface-2 p-3.5">
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.05em] text-text-4">
            Demo accounts — click to sign in
          </h4>
          <div className="flex flex-col">
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.username}
                type="button"
                onClick={() => attempt(acct.username, acct.password)}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] hover:bg-surface"
              >
                <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[11px] text-text-2">
                  {acct.username} / {acct.password}
                </code>
                <span className="text-text-3">{acct.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
