import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;
let initializationAttempted = false;

// Mock store
const store = new Map();

export function getSupabase(): any {
  if (!initializationAttempted) {
    initializationAttempted = true;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[AI Studio] Supabase URL or Key is missing. Using in-memory mock.');
      supabaseInstance = {
        from: (table: string) => {
          return {
            select: (columns: string) => ({
              eq: (column: string, value: string) => {
                const result = {
                  data: table === 'profiles' && column === 'player_name' ? (store.get(value) ? [{ profile_data: store.get(value) }] : []) : [],
                  error: null
                };
                return {
                  maybeSingle: async () => {
                    if (table === 'profiles' && column === 'player_name') {
                      const data = store.get(value);
                      return { data: data ? { profile_data: data } : null, error: null };
                    }
                    return { data: null, error: null };
                  },
                  then: (resolve: any) => resolve(result),
                  catch: (reject: any) => Promise.resolve(result)
                };
              }
            }),
            upsert: async (data: any, options: any) => {
              if (table === 'profiles') {
                store.set(data.player_name, data.profile_data);
                return { error: null };
              }
              return { error: null };
            },
            update: (data: any) => ({
              eq: async (column: string, value: string) => {
                if (table === 'profiles') {
                  store.set(value, data.profile_data);
                  return { error: null };
                }
                return { error: null };
              }
            }),
            delete: () => ({
              eq: async (column: string, value: string) => {
                return { error: null };
              }
            })
          };
        }
      };
      return supabaseInstance;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}
