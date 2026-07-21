import { useNavigate } from 'react-router-dom';
import { Eye, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

/** Shown while an admin is impersonating another user. */
export default function ImpersonationBanner() {
  const navigate = useNavigate();
  const impersonatorId = useAuthStore((s) => s.impersonatorId);
  const users = useAuthStore((s) => s.users);
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const stopImpersonating = useAuthStore((s) => s.stopImpersonating);

  if (!impersonatorId) return null;
  const target = users.find((u) => u.id === currentUserId);

  return (
    <div className="flex items-center justify-center gap-3 bg-purple px-4 py-2 text-[12px] font-medium text-white">
      <Eye size={15} />
      <span>
        Support session — viewing as <strong>{target?.name ?? 'user'}</strong>
      </span>
      <button
        className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 font-semibold hover:bg-white/25"
        onClick={() => {
          stopImpersonating();
          navigate('/', { replace: true });
        }}
      >
        <LogOut size={13} />
        Return to admin
      </button>
    </div>
  );
}
