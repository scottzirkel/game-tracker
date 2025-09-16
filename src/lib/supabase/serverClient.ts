import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_GAME_STATE_ID, SUPABASE_GAME_STATE_TABLE } from './config';

let cachedAdminClient: SupabaseClient | null = null;

const resolveUrl = () =>
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cachedAdminClient) return cachedAdminClient;
  const url = resolveUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  cachedAdminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAdminClient;
}

export { SUPABASE_GAME_STATE_ID, SUPABASE_GAME_STATE_TABLE };
