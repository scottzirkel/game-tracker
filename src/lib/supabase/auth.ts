import type { User } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from './serverClient';

const parseEnvList = (value: string | undefined) =>
  value?.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean) ?? [];

const allowedEmails = parseEnvList(process.env.OVERWATCH_ALLOWED_EMAILS);

export function extractAccessToken(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const normalized = headerValue.trim();
  if (!normalized.toLowerCase().startsWith('bearer ')) return null;
  return normalized.slice(7).trim() || null;
}

export async function getUserFromAccessToken(accessToken: string | null): Promise<User | null> {
  if (!accessToken) return null;
  const admin = getSupabaseAdminClient();
  if (!admin) {
    console.warn('Supabase admin client unavailable while verifying token');
    return null;
  }

  const { data, error } = await admin.auth.getUser(accessToken);
  if (error) {
    console.warn('Supabase access token verification failed', error);
    return null;
  }

  return data.user ?? null;
}

export function isUserAllowed(user: User | null): boolean {
  if (!user) return false;
  if (allowedEmails.length === 0) return true;
  const email = user.email?.toLowerCase();
  return email != null && allowedEmails.includes(email);
}
