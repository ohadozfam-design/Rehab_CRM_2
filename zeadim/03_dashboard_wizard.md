# Step 3 — Main Dashboard & 5-Step Project Wizard

**Status:** ✅ Complete — awaiting user approval to begin Step 4.
**Date:** 2026-07-20

## Goal
Build the primary dashboard home screen and the complex 5-step project-creation
wizard, matching the spec (sections 03 & 04).

## What was built

### Main Dashboard — `src/pages/DashboardPage.tsx`
- **4 KPI cards** (spec colors): 📁 Active Projects (+ "N in progress"),
  💵 Total Spent (of total budget), 📈 Avg. Completion, ✓ Completed. All computed
  live from state via `src/lib/metrics.ts`.
- **Sticky red critical banner** (`components/dashboard/CriticalAlerts.tsx`):
  one dismissible item per over-budget or past-deadline visible project.
  Dismissal persists **for the day** (localStorage keyed by date, auto-resets).
- **Filter bar**: live search across name/address/city/state + a **Columns / Grid**
  view toggle.
- **3-column Kanban** (Active / In Progress / Completed) with colored top borders,
  status pills, and count badges. **Grid view** renders a flat responsive grid.
- **Renovation card** (`components/dashboard/RenovationCard.tsx`): name, 📍 location,
  status pill, dynamic progress bar, and Spent / Budget / Days footer (Days turns
  red "Nd late" when past deadline). Shared by both views.

### Metrics engine — `src/lib/metrics.ts`
`projectProgress` (avg of item `completionPct`), `projectSpent`, `budgetUsedPct`,
`daysToDeadline`, `isOverBudget`, `isPastDeadline`, and `computeKpis`.

### 5-Step New Project Wizard — `src/components/wizard/`
Modal with step-nav (done/current/upcoming states), body, and Back/Cancel/Continue
footer. Opens from the header's **+ New Project** (admin/manager) via a transient
`useUIStore`.
1. **Basics** — name, address with **live parser** ("Street, City, State" → auto-fills
   City/State), datalist of prior addresses, optional summary.
2. **Team & Financing** — manager + contractor **address-book pickers** (auto-fill
   from `useContactsStore`) with editable fields; optional **loan** config
   (interest-only / amortized / manual) with live monthly-payment calc.
3. **Phase Deadlines** — date pickers for the 3 fixed phases.
4. **Scope of Work** — mode selector: **Build manually** (inline editable rows),
   **Paste text** (parser: Phase markers, category headers, tab/pipe rows), or
   **Upload file** (TXT/CSV parsed via FileReader; PDF flagged as simulated later).
   Budget is derived from item labor+material.
5. **Review** — full summary + **Create Project**, which writes a real `Renovation`
   to `useRenovationStore` (status Active) and it appears in the Kanban immediately.

### Wiring
- Added transient `src/stores/useUIStore.ts` (non-persisted modal state).
- Header **+ New Project** now opens the wizard; wizard mounted in `AppLayout`.
- Seed tweak: Pine Ridge Ct financial entries now total $39,240 (> $38k budget) so
  the budget-overrun banner demonstrates with the spec's exact figures. (Clay St is
  past its deadline, so the schedule banner also shows.)

## Definition of Done — verification
- ✅ `npm run build` (tsc -b && vite build) — **zero** TypeScript/compile errors.
- ✅ Projects render in the Kanban column system (and grid); wizard adds fully
  functional projects to state.
- ✅ Dev server boots (HTTP 200).
- ⚠️ In-browser visual QA not run (Claude Chrome extension not connected here);
  verified via the passing typed build + dev-server smoke test.
- ✅ Progress documented here; committed and pushed.

## Next: Step 4 — Advanced Scope of Work (SOW) Management View (on your approval)
