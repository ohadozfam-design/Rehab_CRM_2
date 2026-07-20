import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useRenovationStore } from '../stores/useRenovationStore';
import type { AppNotification, NotificationKind, NotificationSeverity } from '../types';

const KIND_ICON: Record<NotificationKind, string> = {
  'item-proof-needed': '📸',
  'lien-waiver-needed': '📄',
  'budget-overrun': '⚠',
  'schedule-overrun': '⚠',
  assigned: '👤',
  general: '🔔',
};

const SEV: Record<NotificationSeverity, { circle: string; title: string }> = {
  critical: { circle: 'bg-red-soft text-red-text', title: 'text-red-text' },
  warning: { circle: 'bg-amber-soft text-amber-text', title: 'text-amber-text' },
  info: { circle: 'bg-accent-soft text-accent', title: 'text-text' },
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser());
  const notifications = useNotificationStore((s) =>
    user ? s.forUser(user.id) : ([] as AppNotification[]),
  );
  const unread = useNotificationStore((s) => (user ? s.unreadCount(user.id) : 0));
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const dismiss = useNotificationStore((s) => s.dismiss);
  const getById = useRenovationStore((s) => s.getById);

  const [open, setOpen] = useState(false);
  if (!user) return null;

  const sorted = [...notifications].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  const openNotif = (n: AppNotification) => {
    markRead(n.id);
    if (n.renovationId) {
      setOpen(false);
      navigate(`/renovation/${n.renovationId}`);
    }
  };

  return (
    <div className="relative">
      <button
        className="relative inline-flex items-center justify-center rounded-md p-1.5 text-sm leading-none text-text-3 hover:bg-surface-2 hover:text-text"
        title="Notifications"
        onClick={() => setOpen((o) => !o)}
      >
        🔔
        {unread > 0 && (
          <sup className="text-[10px] font-extrabold text-red">{unread}</sup>
        )}
      </button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-[360px] overflow-hidden rounded-lg border border-border-strong bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-[13px] font-bold text-text">
                Notifications
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-text-3">
                  {sorted.length} active
                </span>
                {sorted.some((n) => !n.readAt) && (
                  <button
                    className="text-[11px] font-semibold text-accent"
                    onClick={() => markAllRead(user.id)}
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {sorted.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-text-3">
                You're all caught up.
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto">
                {sorted.map((n) => {
                  const sev = SEV[n.severity];
                  const projName = n.renovationId
                    ? getById(n.renovationId)?.name
                    : undefined;
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-2.5 border-b border-border px-4 py-3 ${
                        !n.readAt ? 'bg-accent-soft/40' : ''
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] ${sev.circle}`}
                      >
                        {KIND_ICON[n.kind]}
                      </div>
                      <button
                        className="flex-1 text-left"
                        onClick={() => openNotif(n)}
                      >
                        <div className={`text-[12px] font-bold ${sev.title}`}>
                          {n.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-text-3">
                          {n.message}
                        </div>
                        <div className="mt-0.5 text-[10px] text-text-4">
                          {projName ? `${projName} · ` : ''}
                          {new Date(n.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      </button>
                      <button
                        className="shrink-0 self-start text-[11px] text-text-4 hover:text-text"
                        title="Dismiss"
                        onClick={() => dismiss(n.id)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
