# Repository Guidelines

## Overview
- **Tech Stack**: Next.js 15, React 19, TypeScript (strict), Tailwind CSS v4, Shadcn UI. API routes run on the Node.js runtime.
- **Domain**: Game tracker for Warhammer 40,000 (10th Edition) with all errata and codexes current as of September 2025.

## Project Structure & Module Organization
- `src/app`: App Router pages and API routes (e.g., `src/app/battle/page.tsx`, `src/app/api/state/route.ts`).
- `src/components`: UI and feature components; Shadcn primitives under `src/components/ui`.
- `src/lib`: Domain logic, utilities, and rules data (e.g., `scoreStore.ts`, `factions.ts`, `secondaries.ts`, `detachments.ts`, `units/*`).
- `src/types`: Shared TypeScript types.
- `public`: Static assets served at `/`.
- `openapi.yaml`: Reference API contract; keep in sync with `src/app/api/*`.

## Build & Development Commands
- `npm run dev`: Start local dev at `http://localhost:3000`.
- `npm run dev:tp`: Dev with Turbopack.
- `npm run dev:poll`: Dev with polling for unstable FS watchers.
- `npm run build`: Production build (Turbopack).
- `npm start`: Serve the production build.
- `npm run lint`: Lint with Next + TS rules.

## Coding Style & Naming Conventions
- **Language**: TypeScript with `strict`; prefer the `@/*` alias (e.g., `import { scoreStore } from '@/lib/scoreStore'`).
- **Components**: PascalCase file names (`RosterManager.tsx`). Shadcn UI files are lowercase but export PascalCase components.
- **Routes**: Follow App Router patterns (`page.tsx`, `layout.tsx`, `route.ts`).
- **Styling**: Tailwind v4; keep classes readable and co-locate styles with components.
- **Linting**: ESLint (`next/core-web-vitals`, `next/typescript`), 2-space indent, avoid unused exports.

## Game Content & Rules
- **Edition/Sources**: WH40k 10th Edition, including official dataslates, errata, and codex releases up to Sep 2025.
- **Data Location**: Update rules and lookups in `src/lib` (`factions.ts`, `secondaries.ts`, `detachments.ts`, `units/*`, `iconMap.ts`).
- **Naming**: Use exact Games Workshop names (e.g., `Adeptus Custodes`, `Bring It Down`). Keep enum-like strings stable across files.
- **Updating**: When rules change, update the relevant `src/lib/*` files and any UI mappings (e.g., `iconMap.ts`). Verify `scoreStore` types still align with new factions/secondaries.
- **Checklist**: See `src/lib/README.md` for a step-by-step data update checklist.

## Agent Modes
- **Default**: Be concise. Prefer small-model behavior for simple asks; avoid tools unless needed.
- **Quick/tl;dr**: One-paragraph answer, no extra context or plans.
- **Deep/Review**: For multi-file edits, refactors, or ambiguity — explain rationale briefly and highlight risks; reserve reasoning for writing/reviewing code.
- **No tools**: Do not run shell or edit files unless explicitly requested.
- **Thresholds**: No code edits → concise reply. Single-file trivial edit → minimal diff + short note. Multi-file/behavioral changes → short plan + targeted diffs.
- **Checks**: Run `npm run lint` and build only when touching code paths that could affect them, or when asked.

## Commit & Pull Request Guidelines
- **Commits**: Imperative, present tense; concise subject (≤72 chars). Example: `feat(battle): add secondary scoring panel`.
- **PRs**: Brief description, before/after screenshots for UI, and steps to validate. Ensure `npm run lint` and `npm run build` pass.
- **Docs**: Update `openapi.yaml` and any affected files when API behavior changes.
