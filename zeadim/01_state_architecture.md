# Step 1 — Architecture & Global State Setup

**Status:** ✅ Complete — awaiting user approval to begin Step 2.
**Date:** 2026-07-20

## Goal
Initialize the React application and build the full Zustand state architecture
with LocalStorage persistence.

## What was built

### Project scaffold
Standard **React 18 + Vite 5 + TypeScript (strict) + Tailwind CSS 3** app at the
repo root, coexisting with the instruction folders.

- `package.json`, `vite.config.ts`, `tsconfig*.json`
- `tailwind.config.js` + `src/index.css` — TMA brand tokens (warm gold accent,
  warm noir darks, soft ivory lights, muted semantic colors, serif display /
  clean sans body). Theme driven by `data-theme` on `<html>` + CSS variables,
  ready for the Step 2 theme engine.
- `index.html`, `src/main.tsx`, `src/App.tsx` (Step 1 diagnostic screen only).

### Data model — `src/types.ts`
Single source of truth for every entity, designed forward-compatible with all 6
steps: `User`/`Role`, `Phase` (fixed 3-phase model), `SowItem` (tri-state
status, baseline costs for variance, proof photos, comments), `FinancialEntry`
(category + lien-waiver fields), `Loan` (interest-only / amortized / manual),
`Receipt` (AI-scan fields), `Photo`, `Update`, `Renovation` (aggregate root),
`AppNotification`, `Contact`, `Settings`, `ThemeMode`.

### The 6 Zustand stores (`src/stores/`, all `persist`ed)
| Store | LocalStorage key | Responsibility |
|-------|------------------|----------------|
| `useAuthStore` | `rehab-crm-auth` | users[], currentUserId, login/logout, role helpers |
| `useRenovationStore` | `rehab-crm-storage` | renovations[] + CRUD + nested mutators + role-gated `visibleFor` |
| `useNotificationStore` | `rehab-crm-notifications` | notifications[] + unread counts |
| `useContactsStore` | `rehab-crm-contacts` | address book for the contact picker |
| `useSettingsStore` | `rehab-crm-settings` | morning-snapshot timing |
| `useThemeStore` | `rehab-crm-theme` | light/dark/auto (auto = dark 18:00–07:00) |

### Seed data — `src/data/mockData.ts`
- **5 demo accounts:** `admin/admin` (admin), `manager/manager` (manager →
  Pursell, Clay), `doolin/doolin` (contractor → Pursell), `eran/eran`
  (contractor → Clay), `viewer/viewer` (viewer).
- **3 projects:** 1105 Pursell Ave (in-progress), 624 Clay St (active),
  Pine Ridge Ct (completed) — each with phases, SOW items across all 3 phases,
  financial entries (some >$600 to exercise lien-waiver enforcement later),
  loans, receipts, photos, updates, and seeded notifications.

## Definition of Done — verification
- ✅ `npm run build` (tsc -b && vite build) completes with **zero** TypeScript /
  compilation errors.
- ✅ All six stores initialize with mock data matching the spec.
- ✅ Seed projects present: Pursell Ave, Clay St, Pine Ridge Ct.
- ✅ Progress documented here; committed and pushed.

## Notes for the owner
- The `rehab_crm_spec/` folder was empty (no `rehab-crm-spec.html` was present),
  so the UI framework was derived from the step prompts + the TMA brand system in
  `Design_Principles_rehab_crm/`. If you have the spec mockup, drop it in and
  Step 2 will match it exactly.
- The prompt files under `prompts_master:/` are named `gemini-code-*.md`; they
  map cleanly to Steps 1–6 by their headers.

## Next: Step 2 — Authentication, Layout & Theme Engine (on your approval)
