import { NextRequest } from 'next/server';
import { scoreStore, type ScoreState } from '@/lib/scoreStore';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json(scoreStore.getState());
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ScoreState>;
    const updated = scoreStore.setState(body);
    return Response.json(updated);
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }
}

