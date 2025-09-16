# Supabase integration plan

1. Document Supabase requirements (tables, env vars, RLS) so deployment is reproducible.
2. Add Supabase client utilities (shared config + server client) without breaking existing store APIs.
3. Persist `/api/state` reads/writes to Supabase while keeping `scoreStore` as an in-memory cache for SSE.
4. Extend `useScoreState` to consume Supabase realtime when credentials are present and otherwise fall back to SSE/polling.
5. Update UI surfaces (Scoreboard badge, Overwatch controls) to reflect the new flow and remove redundant controls.
6. Verify lint/build locally after env variables are set, because the remote sandbox cannot run ESLint.
