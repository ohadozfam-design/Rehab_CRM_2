import { Lock } from 'lucide-react';

/**
 * Shown in place of a view when the current user lacks the responsibility for
 * it. Used by the role-gating system across project-detail tabs.
 */
export default function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="mb-3 flex justify-center text-text-4">
        <Lock size={28} />
      </div>
      <h2 className="mb-1 text-base font-bold text-text">Access Denied</h2>
      <p className="text-sm text-text-3">
        {message ??
          "You don't have permission to view this section. Contact an admin if you think this is a mistake."}
      </p>
    </div>
  );
}
