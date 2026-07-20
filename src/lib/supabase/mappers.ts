// Maps between the app's camelCase domain types and Supabase's snake_case rows.
// Nested collections travel as JSONB, so they map straight through.

import type {
  AppNotification,
  Contact,
  Renovation,
  User,
  UserSettings,
} from '../../types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

// ---- Users ------------------------------------------------------------------

export function rowFromUser(u: User): Row {
  return {
    id: u.id,
    username: u.username,
    password: u.password,
    name: u.name,
    email: u.email ?? null,
    phone: u.phone ?? null,
    role: u.role,
    responsibilities: u.responsibilities ?? [],
    assigned_project_ids: u.assignedProjectIds ?? [],
    contractor_company: u.contractorCompany ?? null,
  };
}

export function userFromRow(r: Row): User {
  return {
    id: r.id,
    username: r.username,
    password: r.password,
    name: r.name,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    role: r.role,
    responsibilities: r.responsibilities ?? [],
    assignedProjectIds: r.assigned_project_ids ?? [],
    contractorCompany: r.contractor_company ?? undefined,
  };
}

// ---- Contacts ---------------------------------------------------------------

export function rowFromContact(c: Contact): Row {
  return {
    id: c.id,
    name: c.name,
    role: c.role,
    company: c.company ?? null,
    email: c.email ?? null,
    phone: c.phone ?? null,
  };
}

export function contactFromRow(r: Row): Contact {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    company: r.company ?? undefined,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
  };
}

// ---- Renovations ------------------------------------------------------------

export function rowFromRenovation(r: Renovation): Row {
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    city: r.city,
    state: r.state,
    size: r.size ?? null,
    start_date: r.startDate,
    deadline: r.deadline,
    status: r.status,
    total_budget: r.totalBudget,
    summary: r.summary ?? '',
    contractor: r.contractor ?? null,
    manager: r.manager ?? null,
    loan: r.loan ?? null,
    phases: r.phases ?? [],
    sow_items: r.sowItems ?? [],
    payment_milestones: r.paymentMilestones ?? [],
    financial_entries: r.financialEntries ?? [],
    receipts: r.receipts ?? [],
    updates: r.updates ?? [],
    drive_folders: r.driveFolders ?? {},
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export function renovationFromRow(r: Row): Renovation {
  return {
    id: r.id,
    name: r.name,
    address: r.address ?? '',
    city: r.city ?? '',
    state: r.state ?? '',
    size: r.size ?? undefined,
    startDate: r.start_date,
    deadline: r.deadline,
    status: r.status,
    totalBudget: Number(r.total_budget ?? 0),
    summary: r.summary ?? '',
    contractor: r.contractor ?? undefined,
    manager: r.manager ?? undefined,
    loan: r.loan ?? undefined,
    phases: r.phases ?? [],
    sowItems: r.sow_items ?? [],
    paymentMilestones: r.payment_milestones ?? undefined,
    financialEntries: r.financial_entries ?? [],
    receipts: r.receipts ?? undefined,
    updates: r.updates ?? undefined,
    driveFolders: r.drive_folders ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ---- Notifications ----------------------------------------------------------

export function rowFromNotification(n: AppNotification): Row {
  return {
    id: n.id,
    user_id: n.userId,
    kind: n.kind,
    severity: n.severity,
    title: n.title,
    message: n.message,
    renovation_id: n.renovationId ?? null,
    related_item_id: n.relatedItemId ?? null,
    created_at: n.createdAt,
    last_fired_at: n.lastFiredAt ?? null,
    read_at: n.readAt ?? null,
    dismissed_at: n.dismissedAt ?? null,
    resolved: n.resolved ?? false,
  };
}

export function notificationFromRow(r: Row): AppNotification {
  return {
    id: r.id,
    userId: r.user_id,
    kind: r.kind,
    severity: r.severity,
    title: r.title,
    message: r.message,
    renovationId: r.renovation_id ?? undefined,
    relatedItemId: r.related_item_id ?? undefined,
    createdAt: r.created_at,
    lastFiredAt: r.last_fired_at ?? undefined,
    readAt: r.read_at ?? undefined,
    dismissedAt: r.dismissed_at ?? undefined,
    resolved: r.resolved ?? undefined,
  };
}

// ---- Settings (byUserId map <-> rows) ---------------------------------------

export function rowFromSettings(userId: string, s: UserSettings): Row {
  return {
    user_id: userId,
    morning_snapshot_enabled: s.morningSnapshotEnabled,
    morning_snapshot_time: s.morningSnapshotTime,
    last_snapshot_shown_date: s.lastSnapshotShownDate ?? null,
  };
}

export function settingsFromRow(r: Row): { userId: string; settings: UserSettings } {
  return {
    userId: r.user_id,
    settings: {
      morningSnapshotEnabled: r.morning_snapshot_enabled ?? true,
      morningSnapshotTime: r.morning_snapshot_time ?? '08:00',
      lastSnapshotShownDate: r.last_snapshot_shown_date ?? undefined,
    },
  };
}
