import { NextRequest } from 'next/server';
import { createDefaultScoreState, scoreStore, type ScoreState } from '@/lib/scoreStore';
import {
  SUPABASE_GAME_STATE_ID,
  SUPABASE_GAME_STATE_TABLE,
  getSupabaseAdminClient,
} from '@/lib/supabase/serverClient';
import {
  extractAccessToken,
  getUserFromAccessToken,
  isUserAllowed,
} from '@/lib/supabase/auth';

export const runtime = 'nodejs';

export async function GET() {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return Response.json(scoreStore.getState());
  }

  const { data, error } = await admin
    .from(SUPABASE_GAME_STATE_TABLE)
    .select('state')
    .eq('id', SUPABASE_GAME_STATE_ID)
    .maybeSingle();

  if (error) {
    console.warn('Supabase state fetch failed', error);
    return Response.json(scoreStore.getState());
  }

  if (!data) {
    const fallback = scoreStore.getState();
    const { error: upsertError } = await admin
      .from(SUPABASE_GAME_STATE_TABLE)
      .upsert({
        id: SUPABASE_GAME_STATE_ID,
        state: fallback,
        updated_at: new Date().toISOString(),
      });
    if (upsertError) {
      console.warn('Supabase state seed failed', upsertError);
    }
    return Response.json(fallback);
  }

  const state = data.state as ScoreState | null;
  if (state) {
    scoreStore.setState(state);
    return Response.json(scoreStore.getState());
  }

  const fallback = createDefaultScoreState();
  scoreStore.setState(fallback);
  const { error: seedError } = await admin
    .from(SUPABASE_GAME_STATE_TABLE)
    .upsert({
      id: SUPABASE_GAME_STATE_ID,
      state: fallback,
      updated_at: new Date().toISOString(),
    });
  if (seedError) {
    console.warn('Supabase fallback seed failed', seedError);
  }

  return Response.json(fallback);
}

export async function POST(req: NextRequest) {
  const accessToken = extractAccessToken(req.headers.get('authorization')) ??
    extractAccessToken(req.headers.get('Authorization'));
  const user = await getUserFromAccessToken(accessToken);

  const isDev = process.env.NODE_ENV !== 'production';
  const host = req.headers.get('host') ?? '';
  const isLocalHost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const bypassRequested = req.headers.get('x-local-bypass') === '1';
  const localBypass = !user && isDev && isLocalHost && bypassRequested;

  if (!user && !localBypass) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (user && !isUserAllowed(user)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const body = (await req.json()) as Partial<ScoreState>;
    const updated = scoreStore.setState(body);
    const admin = getSupabaseAdminClient();
    if (admin) {
      const payload = {
        id: SUPABASE_GAME_STATE_ID,
        state: updated,
        updated_at: new Date().toISOString(),
      };
      const { error } = await admin
        .from(SUPABASE_GAME_STATE_TABLE)
        .upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase state write failed', error);
      }
    }
    return Response.json(updated);
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }
}
