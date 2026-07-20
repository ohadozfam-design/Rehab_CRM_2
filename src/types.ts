// ============================================================================
// Rehab CRM — Core Data Model
// Aligned verbatim with the entity spec in rehab_crm_spec/rehab-crm-spec.html
// (section 13, Data Model) so every module reads and writes the same shapes.
// ============================================================================

// ---- Roles, Responsibilities & Auth -----------------------------------------

export type Role = 'admin' | 'manager' | 'contractor' | 'viewer';

/** Tab/feature gates. A tab renders only if the user has the matching one. */
export type Responsibility =
  | 'finances'
  | 'sow'
  | 'progress'
  | 'photos'
  | 'documents';

export interface User {
  id: string;
  username: string;
  /** Demo-only plaintext credential. Never do this with a real backend. */
  password: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  responsibilities?: Responsibility[];
  /** Projects this user is scoped to (managers/contractors). */
  assignedProjectIds?: string[];
  contractorCompany?: string;
}

// ---- Phases -----------------------------------------------------------------

/** Fixed 3-phase model used throughout the SOW and scheduling. */
export type PhaseId = 1 | 2 | 3;

export interface Phase {
  id: PhaseId;
  name: string;
  /** ISO date string for the phase deadline. */
  deadline: string | null;
}

// ---- Scope of Work ----------------------------------------------------------

export type Unit = 'EA' | 'SF' | 'LF' | 'UNIT' | 'DAYS' | 'LS';

/** Tri-state completion percentage. */
export type CompletionPct = 0 | 50 | 100;

export interface ItemComment {
  id: string;
  userId: string;
  userName: string;
  role?: Role;
  text: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  uploadedById?: string;
  uploadedAt: string;
}

export interface SOWItem {
  id: string;
  description: string;
  shortNote?: string;
  phase: PhaseId;
  category?: string;
  assignedUserId?: string;
  approvedAt?: string;
  quantity?: number;
  unit?: Unit;
  materialCost: number;
  laborCost: number;
  /** Original values, saved as baseline for variance badges. */
  originalMaterialCost?: number;
  originalLaborCost?: number;
  completed: boolean;
  completionPct?: CompletionPct;
  /** Optional items are shown separately and excluded from stats. */
  optional?: boolean;
  vendor?: string;
  comments?: ItemComment[];
  media?: MediaItem[];
  notes?: string;
}

// ---- Financials -------------------------------------------------------------

export type FinancialCategory = 'labor' | 'material' | 'loan' | 'other';

export interface FinancialEntry {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: FinancialCategory;
  phase?: PhaseId;
  vendor?: string;
  contractorUserId?: string;
  /** Auto-set true when a labor/material entry exceeds $600. */
  lienWaiverRequired?: boolean;
  lienWaiverUrl?: string;
  lienWaiverReceivedAt?: string;
}

// ---- Loan -------------------------------------------------------------------

export type LoanType = 'amortized' | 'interest-only' | 'manual';

export interface LoanInfo {
  enabled: boolean;
  loanType?: LoanType;
  principal: number;
  /** Annual percentage rate as a percent, e.g. 9.5 for 9.5%. */
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  startDate?: string;
}

// ---- Receipts ---------------------------------------------------------------

export interface ReceiptLineItem {
  description: string;
  amount?: number;
}

export interface Receipt {
  id: string;
  /** Detected store/vendor, populated by the simulated AI scan. */
  store?: string;
  total?: number;
  date?: string;
  phase?: PhaseId;
  uploadedById?: string;
  fileName?: string;
  fileUrl?: string;
  scanned: boolean;
  lineItems?: ReceiptLineItem[];
  aiSummary?: string;
}

// ---- Payment milestones -----------------------------------------------------

export interface PaymentMilestone {
  id: string;
  label: string;
  /** Percent of contract, e.g. 25. */
  pct: number;
  amount: number;
  description?: string;
  paid: boolean;
  paidAt?: string;
}

// ---- Contractor / Manager sub-objects ---------------------------------------

export interface Contractor {
  company: string;
  name?: string;
  email?: string;
  phone?: string;
  license?: string;
  insurance?: string;
  userId?: string;
}

export interface ProjectManager {
  name: string;
  email?: string;
  phone?: string;
  userId?: string;
}

// ---- Updates feed -----------------------------------------------------------

export interface ProjectUpdate {
  id: string;
  title: string;
  message: string;
  phaseTag?: PhaseId;
  authorId: string;
  authorName: string;
  authorRole: Role;
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
  size?: number;
  startDate: string;
  deadline: string;
  status: RenovationStatus;
  totalBudget: number;
  contractor?: Contractor;
  manager?: ProjectManager;
  loan?: LoanInfo;
  phases: Phase[];
  sowItems: SOWItem[];
  paymentMilestones?: PaymentMilestone[];
  financialEntries: FinancialEntry[];
  receipts?: Receipt[];
  updates?: ProjectUpdate[];
  summary: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Notifications ----------------------------------------------------------

export type NotificationKind =
  | 'item-proof-needed'
  | 'lien-waiver-needed'
  | 'budget-overrun'
  | 'schedule-overrun'
  | 'assigned'
  | 'general';

export type NotificationSeverity = 'info' | 'warning' | 'critical';

export interface AppNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  message: string;
  renovationId?: string;
  relatedItemId?: string;
  createdAt: string;
  lastFiredAt?: string;
  readAt?: string;
  dismissedAt?: string;
  resolved?: boolean;
}

// ---- Contacts (address book) ------------------------------------------------

export interface Contact {
  id: string;
  name: string;
  role: Role;
  company?: string;
  email?: string;
  phone?: string;
}

// ---- Settings & Theme -------------------------------------------------------

export interface UserSettings {
  morningSnapshotEnabled: boolean;
  /** Time-of-day (HH:mm) after which the morning snapshot may show. */
  morningSnapshotTime: string;
  /** ISO date (YYYY-MM-DD) the snapshot was last shown, to throttle to once/day. */
  lastSnapshotShownDate?: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
