import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let initializationAttempted = false;

export function getSupabase(): SupabaseClient | null {
  if (!initializationAttempted) {
    initializationAttempted = true;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or Key is missing. Cloud-Only storage cannot operate.');
      return null;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}
