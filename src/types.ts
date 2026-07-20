// ============================================================================
// Rehab CRM — Core Data Model
// Single source of truth for every entity persisted across the 6 Zustand stores.
// Designed forward-compatible with all modules (auth, SOW, financials, loans,
// receipts, media, updates, notifications) so the schema never has to be rebuilt.
// ============================================================================

// ---- Roles & Auth -----------------------------------------------------------

export type Role = 'admin' | 'manager' | 'contractor' | 'viewer';

export interface User {
  id: string;
  username: string;
  /** Demo-only plaintext credential. Never do this in a real backend. */
  password: string;
  name: string;
  role: Role;
  /** Renovation ids this user is scoped to. Admin/viewer ignore this (see role gating). */
  assignedRenovationIds: string[];
}

// ---- Phases -----------------------------------------------------------------

/** Fixed 3-phase model used throughout the SOW and scheduling. */
export type PhaseId = 1 | 2 | 3;

export const PHASE_NAMES: Record<PhaseId, string> = {
  1: 'Within Walls',
  2: 'Surface Work',
  3: 'Finishes',
};

export interface Phase {
  id: PhaseId;
  name: string;
  /** ISO date string for the phase deadline (set in the project wizard). */
  deadline: string | null;
}

// ---- Scope of Work ----------------------------------------------------------

/** Tri-state completion: 0 = Not Started, 1 = In Progress (50%), 2 = Completed. */
export type SowStatus = 0 | 1 | 2;

export interface SowComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  text: string;
  createdAt: string;
}

export interface SowItem {
  id: string;
  phase: PhaseId;
  description: string;
  note: string;
  laborCost: number;
  materialCost: number;
  /** Original baseline costs, used to render variance badges against current inputs. */
  baselineLaborCost: number;
  baselineMaterialCost: number;
  status: SowStatus;
  /** User id of the assigned worker/contractor, if any. */
  assignedWorkerId: string | null;
  /** Photo ids attached as completion proof (drives the item-proof-needed rule). */
  proofPhotoIds: string[];
  comments: SowComment[];
  /** Timestamp captured when the item is marked Completed. */
  approvedAt: string | null;
}

// ---- Financials -------------------------------------------------------------

export type FinancialCategory = 'labor' | 'material' | 'loan' | 'permit' | 'other';

export interface FinancialEntry {
  id: string;
  date: string;
  description: string;
  category: FinancialCategory;
  amount: number;
  vendor: string;
  /** Auto-set true when a labor/material entry exceeds $600 (lien waiver enforcement). */
  lienWaiverRequired: boolean;
  /** URL of the uploaded, signed lien waiver. Null until compliance is satisfied. */
  lienWaiverUrl: string | null;
}

// ---- Loans ------------------------------------------------------------------

export type LoanType = 'interest-only' | 'amortized' | 'manual';

export interface Loan {
  id: string;
  name: string;
  principal: number;
  /** Annual percentage rate as a decimal, e.g. 0.12 for 12%. */
  apr: number;
  type: LoanType;
  startDate: string;
  termMonths: number;
  /** Used only when type === 'manual'. */
  manualMonthlyPayment: number | null;
}

// ---- Receipts ---------------------------------------------------------------

export interface ReceiptLineItem {
  description: string;
  amount: number;
}

export interface Receipt {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  /** Populated by the simulated "AI Scan" action. */
  vendor: string | null;
  total: number | null;
  lineItems: ReceiptLineItem[];
  scanned: boolean;
}

// ---- Media / Photos ---------------------------------------------------------

export interface Photo {
  id: string;
  phase: PhaseId;
  url: string;
  thumbnailUrl: string;
  caption: string;
  uploadedAt: string;
  uploadedById: string;
}

// ---- Updates feed -----------------------------------------------------------

export interface Update {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  phaseTag: PhaseId | null;
  message: string;
  createdAt: string;
}

// ---- Renovation (aggregate root) --------------------------------------------

export type RenovationStatus = 'active' | 'in-progress' | 'completed';

export interface Renovation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  status: RenovationStatus;
  /** Overall project budget target. */
  budget: number;
  /** Ids of assigned manager(s) and contractor(s). */
  managerIds: string[];
  contractorIds: string[];
  phases: Phase[];
  sowItems: SowItem[];
  financialEntries: FinancialEntry[];
  loans: Loan[];
  receipts: Receipt[];
  photos: Photo[];
  /** Shared Google Drive folder links per phase. */
  driveFolders: Record<PhaseId, string>;
  updates: Update[];
  createdAt: string;
}

// ---- Notifications ----------------------------------------------------------

export type NotificationType =
  | 'item-proof-needed'
  | 'lien-waiver-needed'
  | 'budget-overrun'
  | 'deadline-risk'
  | 'general';

export type NotificationSeverity = 'info' | 'warning' | 'critical';

export interface AppNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  renovationId: string | null;
  /** Target user id; null means system-wide/dashboard-level. */
  targetUserId: string | null;
  message: string;
  createdAt: string;
  read: boolean;
}

// ---- Contacts (address book) ------------------------------------------------

export interface Contact {
  id: string;
  name: string;
  role: Role;
  company: string;
  phone: string;
  email: string;
}

// ---- Settings & Theme -------------------------------------------------------

export interface Settings {
  /** Time-of-day (HH:mm) after which the morning snapshot may show. */
  morningSnapshotTime: string;
  /** ISO date (YYYY-MM-DD) the snapshot was last shown, to throttle to once/day. */
  lastSnapshotShownDate: string | null;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
