import { scoreStore } from '@/lib/scoreStore';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const send = (data: any) => writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

  // Initial snapshot
  send(scoreStore.getState());

  // Subscribe to updates
  const unsubscribe = scoreStore.subscribe((state) => send(state));

  // Keep-alive
  const ping = setInterval(() => {
    writer.write(encoder.encode(`: ping\n\n`));
  }, 15000);

  // Clean up on client disconnect
  const onAbort = () => {
    clearInterval(ping);
    unsubscribe();
    writer.close();
  };
  request.signal.addEventListener('abort', onAbort);

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
