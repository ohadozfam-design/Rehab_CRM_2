// State + pure helpers for the 5-step New Project wizard.

import type {
  LoanType,
  PhaseId,
  Renovation,
  SOWItem,
  User,
} from '../../types';

export interface DraftItem {
  id: string;
  description: string;
  phase: PhaseId;
  category: string;
  laborCost: number;
  materialCost: number;
}

export type SowMode = 'manual' | 'paste' | 'upload';

export interface WizardDraft {
  // Step 1 — Basics
  name: string;
  address: string;
  city: string;
  state: string;
  summary: string;
  // Step 2 — Team & Financing
  managerName: string;
  managerEmail: string;
  contractorCompany: string;
  contractorName: string;
  contractorEmail: string;
  loanEnabled: boolean;
  loanType: LoanType;
  principal: number;
  interestRate: number;
  termMonths: number;
  manualMonthlyPayment: number;
  // Step 3 — Phase Deadlines
  phase1Deadline: string;
  phase2Deadline: string;
  phase3Deadline: string;
  // Step 4 — Scope of Work
  sowMode: SowMode;
  items: DraftItem[];
  pasteText: string;
  uploadNote: string;
}

export function emptyDraft(): WizardDraft {
  return {
    name: '',
    address: '',
    city: '',
    state: '',
    summary: '',
    managerName: '',
    managerEmail: '',
    contractorCompany: '',
    contractorName: '',
    contractorEmail: '',
    loanEnabled: false,
    loanType: 'interest-only',
    principal: 0,
    interestRate: 0,
    termMonths: 12,
    manualMonthlyPayment: 0,
    phase1Deadline: '',
    phase2Deadline: '',
    phase3Deadline: '',
    sowMode: 'manual',
    items: [],
    pasteText: '',
    uploadNote: '',
  };
}

/** Parses "Street, City, State [ZIP]" into parts. Trailing ZIP is stripped. */
export function parseAddress(input: string): {
  street: string;
  city: string;
  state: string;
} {
  const parts = input.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return { street: input.trim(), city: '', state: '' };
  const street = parts[0];
  const city = parts[1] ?? '';
  // Last chunk may be "OH" or "OH 45402" — take the leading 2-letter token.
  const tail = parts[2] ?? '';
  const stateMatch = tail.match(/[A-Za-z]{2}/);
  return { street, city, state: stateMatch ? stateMatch[0].toUpperCase() : '' };
}

function toNumber(raw: string): number {
  const n = parseFloat(raw.replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Parses pasted/uploaded SOW text into draft items. Understands:
 *  - `Phase 1/2/3` (or `## Phase 2`) markers → sets current phase
 *  - ALL-CAPS or `Kitchen:` lines → sets current category
 *  - tab- or pipe-separated `desc <sep> labor <sep> material` rows
 *  - plain lines → description-only item
 */
export function parseSowText(text: string): DraftItem[] {
  const items: DraftItem[] = [];
  let phase: PhaseId = 1;
  let category = '';
  let seq = 0;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const phaseMatch = line.match(/^#*\s*phase\s*([123])/i);
    if (phaseMatch) {
      phase = Number(phaseMatch[1]) as PhaseId;
      continue;
    }

    const sep = line.includes('\t') ? '\t' : line.includes('|') ? '|' : '';
    if (sep) {
      const cols = line.split(sep).map((c) => c.trim());
      if (cols[0]) {
        items.push({
          id: `di-${Date.now()}-${seq++}`,
          description: cols[0],
          phase,
          category,
          laborCost: toNumber(cols[1] ?? ''),
          materialCost: toNumber(cols[2] ?? ''),
        });
      }
      continue;
    }

    // Category header: ALL CAPS, or ends with a colon.
    const isCaps = line === line.toUpperCase() && /[A-Z]/.test(line);
    if (isCaps || line.endsWith(':')) {
      category = line.replace(/[:]/g, '').replace(/\(.*?\)/g, '').trim();
      continue;
    }

    items.push({
      id: `di-${Date.now()}-${seq++}`,
      description: line,
      phase,
      category,
      laborCost: 0,
      materialCost: 0,
    });
  }

  return items;
}

/** Monthly payment for the configured loan (0 when disabled). */
export function computeMonthlyPayment(draft: WizardDraft): number {
  if (!draft.loanEnabled || draft.principal <= 0) return 0;
  const monthlyRate = draft.interestRate / 100 / 12;
  switch (draft.loanType) {
    case 'interest-only':
      return draft.principal * monthlyRate;
    case 'amortized': {
      if (monthlyRate === 0) return draft.principal / draft.termMonths;
      const factor = Math.pow(1 + monthlyRate, draft.termMonths);
      return (draft.principal * monthlyRate * factor) / (factor - 1);
    }
    case 'manual':
      return draft.manualMonthlyPayment;
    default:
      return 0;
  }
}

export function draftBudget(draft: WizardDraft): number {
  return draft.items.reduce(
    (acc, it) => acc + it.laborCost + it.materialCost,
    0,
  );
}

/** Basics step is the only hard requirement for a valid project. */
export function isBasicsValid(draft: WizardDraft): boolean {
  return draft.name.trim().length > 0 && draft.address.trim().length > 0;
}

/** Assembles a persistable Renovation from the draft. */
export function buildRenovation(
  draft: WizardDraft,
  author: User | null,
): Renovation {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const id = `proj-${Date.now()}`;

  const sowItems: SOWItem[] = draft.items.map((it, i) => ({
    id: `${id}-sow-${i}`,
    description: it.description,
    phase: it.phase,
    category: it.category || undefined,
    laborCost: it.laborCost,
    materialCost: it.materialCost,
    originalLaborCost: it.laborCost,
    originalMaterialCost: it.materialCost,
    completed: false,
    completionPct: 0,
  }));

  const deadline =
    draft.phase3Deadline || draft.phase2Deadline || draft.phase1Deadline || today;

  return {
    id,
    name: draft.name.trim(),
    address: draft.address.trim(),
    city: draft.city.trim(),
    state: draft.state.trim(),
    startDate: today,
    deadline,
    status: 'active',
    totalBudget: draftBudget(draft),
    summary: draft.summary.trim(),
    manager: draft.managerName.trim()
      ? {
          name: draft.managerName.trim(),
          email: draft.managerEmail.trim() || undefined,
          userId: author?.id,
        }
      : undefined,
    contractor: draft.contractorCompany.trim()
      ? {
          company: draft.contractorCompany.trim(),
          name: draft.contractorName.trim() || undefined,
          email: draft.contractorEmail.trim() || undefined,
        }
      : undefined,
    loan: draft.loanEnabled
      ? {
          enabled: true,
          loanType: draft.loanType,
          principal: draft.principal,
          interestRate: draft.interestRate,
          termMonths: draft.termMonths,
          monthlyPayment: computeMonthlyPayment(draft),
          startDate: today,
        }
      : undefined,
    phases: [
      { id: 1, name: 'Within Walls', deadline: draft.phase1Deadline || null },
      { id: 2, name: 'Surface Work', deadline: draft.phase2Deadline || null },
      { id: 3, name: 'Finishes', deadline: draft.phase3Deadline || null },
    ],
    sowItems,
    financialEntries: [],
    receipts: [],
    updates: [],
    createdAt: now,
    updatedAt: now,
  };
}
