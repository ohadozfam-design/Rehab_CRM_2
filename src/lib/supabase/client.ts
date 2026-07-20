import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Read from Vite env. Both must be present for Supabase sync to activate;
// otherwise the app runs entirely on LocalStorage (offline-first).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    })
  : null;
