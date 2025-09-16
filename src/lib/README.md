# Data Update Checklist (Warhammer 40,000 10th)

This app tracks WH40k 10th Edition with all errata/codexes current as of Sep 2025. Use this checklist when new dataslates, errata, or codex updates drop.

## Checklist
- Verify sources: official GW dataslate/errata PDFs and codex updates. Note exact names and rules changed.
- Update data in `src/lib/`:
  - `factions.ts`: add/remove factions and ensure the `Faction` type matches.
  - `detachments.ts`: add new detachments or rename as published.
  - `secondaries.ts`: keep secondary names/categories current (Fixed/Tactical).
  - `units/*`: extend or add files following the existing pattern (e.g., `units/custodes.ts`). Use Games Workshop names verbatim.
  - `iconMap.ts`: map any new factions/units to appropriate icons.
- Validate state/types:
  - `scoreStore.ts`: ensure types and computed fields still align with updated factions/secondaries and scoring.
- API contract:
  - If the API shape changes, update `openapi.yaml` and the handlers under `src/app/api/*` to match.
- Local verification:
  - Run `npm run dev` and sanity check pages: `/battle`, `/mechanicus`, `/overwatch`, `/scoreboard`, `/test`.
- Confirm scoring totals update correctly. When Supabase credentials are provided (`NEXT_PUBLIC_SUPABASE_URL` etc.) the scoreboard uses realtime database updates; otherwise it falls back to SSE (`/api/stream`) and safe polling.
 - Live updates rely on `useScoreState` (see `src/lib/hooks/useScoreState.ts`). It performs:
   - Initial fetch from Supabase (if configured) or `/api/state`
   - Realtime subscription to the `game_states` table (Supabase) and automatic reconciliation of JSON payloads
   - SSE subscription with exponential backoff and polling fallback when Supabase is not available
   - Exposes `mode` (`idle|supabase|sse|polling|error`) and `state`

Supabase integration requires:

```
Tables: game_states (id text primary key, state jsonb, updated_at timestamptz default now())
RLS: enable and allow insert/update/select for anon role where id = 'default' (or your chosen ID)
Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (server only), optional *_GAME_STATE_ID/TABLE overrides, OVERWATCH_ALLOWED_EMAILS (comma separated allow-list for /api/state writes)
```

Overwatch (the operator console) now requires a Supabase Auth session. Only users matching `OVERWATCH_ALLOWED_EMAILS` (or any authenticated user if the env var is omitted) can POST score updates. The public scoreboard remains readable without authentication via `/api/state` (GET) and `/api/stream`.

Usage example:

```tsx
import { useScoreState } from '@/lib/hooks/useScoreState';

function Scoreboard() {
  const { state, mode } = useScoreState({ enableSSE: true, pollingIntervalMs: 5000 });
  // render using `state`, show badge using `mode`
}
```
- Commit:
  - Use clear messages, e.g., `chore(data): sync Sep 2025 dataslate`.

## Notes
- Use exact GW naming for stability across files. Avoid ad-hoc renames that break lookups.
- Keep enum-like strings consistent between data files and UI.
- Run `npm run lint` and `npm run build` before opening a PR.
