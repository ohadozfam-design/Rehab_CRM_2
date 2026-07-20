# Step 4 — Advanced Scope of Work (SOW) Management View

**Status:** ✅ Complete — awaiting user approval to begin Step 5.
**Date:** 2026-07-20

## Goal
Build the core 3-phase interactive SOW checker and builder (spec §06).

## Scaffolding built to reach the SOW view
The SOW view is a tab inside project detail, which didn't exist yet, so:
- **`/renovation/:id` route** + **`src/pages/RenovationDetailPage.tsx`**: reno-header
  (back, title, 📍 location, admin-only 🗑 delete-with-confirm) and the 5-tab bar
  (Overview · SOW · Financials · Photos · Updates). **Tabs are role-gated** via
  `hasResponsibility()` + `TAB_RESPONSIBILITY`; the non-permitted ones don't render,
  and `AccessDenied` covers direct access. Overview/Financials/Photos/Updates are
  ComingSoon placeholders (Steps 5–6).
- Dashboard cards **and** the critical-alert "Open project →" now navigate to the
  detail page (previously inert).

## SOW view (`src/components/sow/`)
### `SowTab.tsx`
- Header summary line: "{completed} of {total} items completed, {half} at 50% ·
  Est. total: {est} (± variance vs original {orig})".
- **Grouped by Category ↔ Flat list** toggle. Renders the 3 fixed phases.
- Provides the shared category datalist for the inline editors.

### `SowPhase.tsx` — per-phase container
- Header: colored phase number, name, "Stage N of 3", description, **deadline chip**
  with computed countdown (variants: default / `tight` ≤7d amber / `late` red /
  `done` emerald), **aggregate progress bar + %**, and **spent / budget** figures.
  Collapsible.
- **Dynamic material-column hiding**: if no counted item in the phase has a material
  cost, the Material column is removed and the grid template shrinks
  (`32px 1fr 90px 90px 70px 40px` → `32px 1fr 90px 70px 40px`) so Item stretches.
  Header, category rows, item rows, and the subtotal row all share one template.
- Optional category sub-grouping (🗂 header rows with labor/material subtotals) and a
  per-phase Subtotal row. Editable users get **+ Add item to {phase}**.

### `SowRow.tsx` — item row + expandable editor
- **Tri-state checkbox**: 0 (empty) → 50 (amber ▨, row tinted amber, "50% DONE"
  badge) → 100 (emerald ✓, row tinted emerald, title strikethrough, stamps
  `approvedAt`) → 0. Recalculates instantly.
- **Variance badge** on the title: current vs baseline (`original*Cost`) — red
  `▲ +$X` for overruns, emerald `▼ −$X` for savings. Baseline is captured on first
  cost edit if not already stored.
- Meta tags: quantity+unit, category, 👤 assignee, Optional. Labor amber, Material
  blue (— when zero), Total bold.
- **Expandable detail panel**: inline editor for description, short note, category
  (datalist), quantity+unit, vendor, labor/material, **assign worker**, Optional,
  notes — plus a **comments** thread (post as current user) and remove-item.
- All edit affordances gate on the `sow` responsibility (read-only otherwise).

## Store
Added `addSowItem` / `removeSowItem`; item edits/comments flow through
`updateSowItem`. New math in `src/lib/sow.ts` (item totals, variance, tri-state
cycle, phase aggregates, summary, deadline countdown).

## Definition of Done — verification
- ✅ `npm run build` (tsc -b && vite build) — **zero** TypeScript/compile errors.
- ✅ Tri-state tracking updates calculations instantly; table layout adjusts per
  phase (material column appears for Phase 1, hides for a materials-free phase).
- ✅ Dev server boots (HTTP 200).
- ⚠️ In-browser visual QA not run (Claude Chrome extension not connected here);
  verified via the passing typed build + dev-server smoke test.
- ✅ Progress documented here; committed and pushed.

## Next: Step 5 — Project Financials, Loans, Scans & Lien Waiver Enforcement
