import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

/** Redirects to /login when there is no authenticated user. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const currentUserId = useAuthStore((s) => s.currentUserId);
  if (!currentUserId) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
