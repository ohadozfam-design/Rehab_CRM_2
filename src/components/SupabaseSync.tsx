import { useEffect } from 'react';
import { initSupabaseSync } from '../lib/supabase/sync';

/**
 * Boots the Supabase sync loop once for the app's lifetime. Renders nothing.
 * No-op when Supabase env vars are absent (the app stays offline-first).
 */
export default function SupabaseSync() {
  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    initSupabaseSync().then((c) => {
      if (cancelled) c();
      else cleanup = c;
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return null;
}
