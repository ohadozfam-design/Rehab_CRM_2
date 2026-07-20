# Project Instructions — Rehab CRM

## Project Overview
Real Estate Project Management CRM for tracking rehab/renovation portfolios:
projects, scope-of-work (SOW), financials & loans, receipts, lien-waiver
compliance, media galleries, a Slack-style updates feed, and a background
notification engine. Client-side SPA — no backend; all state persists to
LocalStorage. Built for a non-technical owner: Claude is the sole builder and
makes industry-standard technical decisions automatically.

## Tech Stack
- Framework: React 18 + Vite 5
- Language: TypeScript (strict)
- Styling: Tailwind CSS 3 (TMA brand tokens in `tailwind.config.js` + CSS vars in `src/index.css`)
- State: Zustand 4 with the `persist` middleware (LocalStorage)

## Build Execution Model
Work proceeds strictly step-by-step through `prompts_master:/` (Steps 1–6).
After each step: document progress in `zeadim/0X_*.md`, commit, push, and STOP
for explicit user approval before starting the next step.

## Key Conventions
- One Zustand store per domain; each persists under its own `rehab-crm-*` key.
- All entity shapes live in `src/types.ts` — the single source of truth.
- Store mutations are immutable; nested edits use id-scoped map helpers.
- The 3-phase model is fixed: Phase 1 Within Walls, Phase 2 Surface Work, Phase 3 Finishes.
- Theme is driven by the `data-theme` attribute on `<html>` + CSS token layer.

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
