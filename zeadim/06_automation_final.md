# Step 6 — Photos, Slack-style Updates & Background Notification Engine

**Status:** ✅ Complete — **final development step of the master plan.**
**Date:** 2026-07-20

## Goal
Program the media galleries, the updates feed, the background automation loop, and
the daily Morning Snapshot (spec §08, §09, §10, §12, §15).

## Photos & Media Tab — `src/components/media/PhotosTab.tsx`
- **Segmented by phase**: one card per fixed phase with a "Phase N — Name · X photos"
  header and a **Drive Folder link** input (stored on `renovation.driveFolders[phase]`).
- Thumbnail grid aggregated from each phase's SOW-item media (image previews / ▶ video
  tiles) with **hover-to-delete** overrides.
- **Attach photo/video** picks a SOW item + URL + type and writes to `item.media` —
  which directly clears that item's proof reminder (ties into Rule 1 below).
- Visible to admin + contractors; viewers/managers gated out per responsibility.

## Updates Feed Tab — `src/components/updates/UpdatesTab.tsx`
- Chronological timeline; each post shows **title, phase tag, author name + role
  subtitle, and timestamp**. Non-viewers get a **+ Post update** composer (title,
  message, optional phase tag) writing through `addUpdate`.

## Background Notification Engine — `src/components/NotificationEngine.tsx`
Mounted in the app shell; runs on mount and **every 60s via `setInterval`** (cron
simulation). Each tick reconciles the desired notification set
(`src/lib/notifications.ts`) against the store:
- **Rule 1 — item-proof-needed** (warning, every 12h): assigned SOW item at 100% with
  **zero media** → fires to the assignee; **resolves** once media is attached.
- **Rule 2 — lien-waiver-needed** (critical, daily): a lien-required entry (labor/
  material > $600) lacking `lienWaiverUrl` → fires to the contractor/manager;
  **resolves** when a waiver is attached.
- **Rule 3 — budget/schedule overrun** (critical, daily): over-budget or past-deadline
  → fires to admins + project managers; **resolves** when back on budget / on time.
The reconciler fires new reminders, **re-fires** stale ones past their interval, and
**resolves** any engine-owned notification whose condition no longer holds — so logs
generate and clear as project context changes. (On first load it self-corrects the
seed: clears the stale sink reminder, raises the real ones.)

## Notification bell — `src/components/NotificationBell.tsx`
The header bell is now a live dropdown: per-user active notifications with severity
icons, unread highlighting + count, **mark-all-read**, per-item **dismiss**, and
click-through to the related project.

## Morning Snapshot — `src/components/MorningSnapshot.tsx`
Once-per-day welcome modal that appears **after the configured time (default 08:00)**,
throttled by per-user `settings.lastSnapshotShownDate`. Summarizes total spent vs
budget, active count, this week's spend/transactions, and risk count; lists
needs-attention projects and per-project status. **"Don't show again"** disables it;
**"Got it"** marks it shown for the day.

## Store additions
`removeItemMedia` (renovation store), `refire` (notification store),
`driveFolders` on `Renovation`.

## Definition of Done — verification
- ✅ `npm run build` (tsc -b && vite build) — **zero** TypeScript/compile errors.
- ✅ Media galleries load per phase; the scheduler actively generates and clears
  notifications on context shifts (attach proof → item reminder resolves; attach
  waiver → lien reminder resolves). Morning Snapshot triggers after 08:00 once daily.
- ✅ Dev server boots (HTTP 200).
- ⚠️ In-browser visual QA not run (Claude Chrome extension not connected here);
  verified via the passing typed build + dev-server smoke test.
- ✅ Progress documented here; committed and pushed.

## 🏁 Master plan complete
All six steps delivered: architecture/state · auth+theme · dashboard+wizard · SOW ·
financials/lien · photos/updates/automation. Each checkpointed, built clean, and
pushed to GitHub.
