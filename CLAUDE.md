# Project Instructions — Rehab CRM

## Project Overview
Real Estate Project Management CRM for tracking rehab/renovation portfolios:
projects, scope-of-work (SOW), financials & loans, receipts, lien-waiver
compliance, media galleries, a Slack-style updates feed, and a background
notification engine. Client-side SPA — no backend; all state persists to
LocalStorage. Built for a non-technical owner: Claude is the sole builder and
makes industry-standard technical decisions automatically.

## Tech Stack
- Framework: React 18 + Vite 5, routing via react-router-dom 6
- Language: TypeScript (strict)
- Styling: Tailwind CSS 3. Colors route through CSS variables (`src/index.css`) that
  flip light/dark; the token values come **verbatim from the UI spec**.
- State: Zustand 4 with the `persist` middleware (LocalStorage)

## Source of Truth for UI
`rehab_crm_spec/rehab-crm-spec.html` is the authoritative pixel/behavior reference —
a slate + blue SaaS system. Match its tokens, layout, and data model exactly.
(The `Design_Principles_rehab_crm/` TMA doc is an unrelated brand and is NOT used.)

## Build Execution Model
Work proceeds strictly step-by-step through `prompts_master:/` (Steps 1–6).
After each step: document progress in `zeadim/0X_*.md`, commit, push, and STOP
for explicit user approval before starting the next step.

## Key Conventions
- One Zustand store per domain; each persists under its own `rehab-crm-*` key.
- All entity shapes live in `src/types.ts` — mirror the spec's field names exactly
  (`totalBudget`, `assignedProjectIds`, `completionPct`, notification `kind`, etc.).
- Store mutations are immutable; nested edits use id-scoped map helpers.
- The 3-phase model is fixed: Phase 1 Within Walls, Phase 2 Surface Work, Phase 3 Finishes.
- Theme is driven by the `data-theme` attribute on `<html>` (see `ThemeController`)
  + CSS token layer. Auto mode = dark 18:00–07:00.
- Role gating: `useRenovationStore.visibleFor(user)` filters projects; tab access
  keys off `useAuthStore.hasResponsibility()` (admin bypasses all checks).

## Important Paths
- Source: `src/`
- Stores: `src/stores/`
- Data model: `src/types.ts`
- Seed data: `src/data/mockData.ts`
- Step logs: `zeadim/`
- Feature prompts: `prompts_master:/` (Steps 1–6)
- Brand system: `Design_Principles_rehab_crm/`

## What to Avoid
- Never build a later step's code before the current step is approved.
- Never commit `.env`, secrets, or `.claude/settings.local.json`.
- Don't add dependencies beyond what a step needs without noting it.

## Run Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Typecheck: `npm run typecheck`
