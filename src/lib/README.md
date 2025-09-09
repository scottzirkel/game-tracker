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
  - Confirm scoring totals update correctly and that Server-Sent Events stream at `/api/stream` reflects changes.
- Commit:
  - Use clear messages, e.g., `chore(data): sync Sep 2025 dataslate`.

## Notes
- Use exact GW naming for stability across files. Avoid ad-hoc renames that break lookups.
- Keep enum-like strings consistent between data files and UI.
- Run `npm run lint` and `npm run build` before opening a PR.
