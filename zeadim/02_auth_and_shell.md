# Step 2 — Authentication, Layout & Theme Engine

**Status:** ✅ Complete — awaiting user approval to begin Step 3.
**Date:** 2026-07-20

## Goal
Build the multi-role Login view, the main App Layout shell, and the time-based
Theme Engine, with role gating on entry.

## ⚠️ Foundational reconciliation to the spec (important)
The `rehab-crm-spec.html` UI reference arrived after Step 1. It is authoritative
and revealed that Step 1 was built against two wrong assumptions:

1. **Design system.** The real product is a **slate + blue SaaS** system, not the
   TMA gold/noir brand (that doc is an unrelated brand — "The Multi Accademy").
   → `src/index.css` + `tailwind.config.js` now carry the spec's **exact** token
   set (light + dark), routed through CSS variables so utilities are theme-aware.
2. **Data model field names.** The spec's entities differ from the Step 1 guess
   (`totalBudget`, `assignedProjectIds`, `responsibilities`, `completionPct`,
   single `loan` object, `contractor`/`manager` sub-objects, notification `kind`,
   per-user `settings.byUserId`, etc.).
   → `src/types.ts`, `src/data/mockData.ts`, and all six stores were realigned to
   match the spec's Data Model section verbatim. Persist keys are unchanged; each
   store now carries `version: 1`.

Seed content was also updated to the spec's real data (Ohad Oz / Charles Doolin /
Eran; 1105 Pursell Ave · Dayton OH, 624 Clay St · Troy OH, 8 Pine Ridge Ct · Memphis TN).

## What was built (Step 2 deliverables)

### Login Page — `src/pages/LoginPage.tsx`
- Centered card on the spec's blue gradient scene; logo, title, username/password
  fields with inline icons, "→ Sign In" button, inline error on bad credentials.
- **Demo account badges** (all 5) that one-click authenticate and route to `/`.
- Redirects to `/` if already signed in.

### App Shell & Layout — `src/components/{AppLayout,Header}.tsx`
- Top nav per spec: brand (logo + "Rehab CRM" / "Renovation Management"), and the
  actions toolbar — theme toggle, notification bell with **live unread badge**,
  settings, users (admin-only), user profile + role badge, "+ New Project"
  (admin/manager), sign out.
- `AppLayout` = header + routed `<Outlet/>`; routing via react-router-dom.

### Theme Engine — `src/components/ThemeController.tsx` + `useThemeStore`
- Supports **Light / Dark / Auto**; header button cycles auto → light → dark.
- **Auto** resolves by time-of-day (**dark 18:00–07:00**, light otherwise) and
  re-evaluates every 60s to flip at the boundary without reload.
- Stamps `data-theme` on `<html>`, matching the CSS token layer.

### Role Gating
- `ProtectedRoute` bounces unauthenticated users to `/login`.
- Dashboard shows only `useRenovationStore.visibleFor(user)` projects on entry
  (admin/viewer see all; manager/contractor see assigned only).
- `AccessDenied` block + `useAuthStore.hasResponsibility()` + `TAB_RESPONSIBILITY`
  map are in place for the responsibility-gated project tabs (used from Step 5).
- The Step-3 Kanban/KPIs replace the current placeholder dashboard body.

## New/changed foundations
- Added `react-router-dom`. New: `src/lib/{constants,format}.ts`,
  `src/components/*`, `src/pages/*`.

## Definition of Done — verification
- ✅ `npm run build` (tsc -b && vite build) — **zero** TypeScript/compile errors.
- ✅ Dev server boots (HTTP 200); login flow, protected routing, theme cycling,
  and role-filtered visibility implemented against the spec.
- ⚠️ Visual QA in-browser was not run: the Claude Chrome extension was not
  connected in this environment. Verified via the passing typed build + dev-server
  smoke test. Happy to do a full visual pass once the extension is connected.
- ✅ Progress documented here; committed and pushed.

## Next: Step 3 — Main Dashboard & 5-Step Project Wizard (on your approval)
