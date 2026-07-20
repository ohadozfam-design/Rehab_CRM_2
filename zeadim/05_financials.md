# Step 5 — Project Financials, Loans, Scans & Lien Waiver Enforcement

**Status:** ✅ Complete — awaiting user approval to begin Step 6.
**Date:** 2026-07-20

## Goal
Build the full financial breakdown: health hero, schedule meter, loan configurator
with interest accrual, receipts + AI scan, and lien-waiver compliance (spec §07).

## Finance engine — `src/lib/finance.ts`
- **Three loan models** (`monthlyPayment`):
  - Interest-only (hard-money default): `principal × APR/100 / 12`.
  - Amortized P&I: standard amortization PMT formula.
  - Manual: user-entered payment.
- **`totalInterest`**: interest-only = `monthly × term` (principal balloons);
  amortized/manual = `monthly × term − principal`.
- **`accruedInterest`**: tracked **daily** — `principal × (APR/365) × elapsedDays`,
  capped at total interest — and injected into **`trueProjectCost` = cash spent +
  accrued interest**.
- **`budgetHealth`**: emerald / amber (≥90%) / red (over) from true cost vs budget.
- **`scheduleMeter`**: work % vs time-elapsed %, flags **behind** when time leads
  work by >10%.
- **`lienRequired` / `waiverState`**: the enforcement rule — a `labor`/`material`
  entry over **$600** requires a signed waiver (`needed` → `on-file` when a URL
  is attached).

## Financials tab — `src/components/finance/`
- **`FinancialsTab`**: orchestrator with the **hero panel** (big % + On/Near/Over
  budget, colored) and the **schedule meter** (Work Completed vs Time Elapsed bars,
  behind-schedule callout).
- **`LoanCard`**: type pill + Principal / Rate·Term / Monthly Payment / Total
  Interest / **Accrued Interest (to date)** and the interest-only balloon note;
  inline editing of all three models (editable users).
- **`ReceiptsCard`**: upload receipts and a **simulated "✨ AI Scan"** that populates
  store, total, and line items with an AI summary; running count/total header.
- **`TransactionHistory`**: chronological ledger; every entry shows a
  **⚠ WAIVER NEEDED** (red) or **✓ WAIVER ON FILE** (green) badge per the $600 rule,
  with an "Attach signed waiver" action that flips it.
- **`AddEntryForm`**: modal that logs a transaction and **auto-sets
  `lienWaiverRequired`** via the rule (with a live over-$600 warning).
- **`FinanceChat`**: rule-based assistant answering budget / schedule / loan /
  variance / what's-next questions from live state.

## Wiring & store
- Financials tab mounted in `RenovationDetailPage` (gated by the `finances`
  responsibility; **viewers are read-only**, contractors don't see the tab).
- Store: added `addReceipt` / `updateReceipt` / `removeReceipt`; loan edits flow
  through `updateRenovation`, waiver/entry edits through `updateFinancialEntry`.

## Definition of Done — verification
- ✅ `npm run build` (tsc -b && vite build) — **zero** TypeScript/compile errors.
- ✅ Loan interest computations correct across all three models; accrued interest
  feeds true project cost. Expense thresholds (>$600 labor/material) trigger lien
  compliance, and attaching a waiver clears it. Seed demonstrates both states
  (Clay St has a $4,267.50 deposit still needing a waiver).
- ✅ Dev server boots (HTTP 200).
- ⚠️ In-browser visual QA not run (Claude Chrome extension not connected here);
  verified via the passing typed build + dev-server smoke test.
- ✅ Progress documented here; committed and pushed.

## Next: Step 6 — Photos Gallery, Slack-style Communication & Notification Engine
