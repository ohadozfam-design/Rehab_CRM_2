// Shared, spec-derived constants used across modules.

import type { PhaseId, Responsibility, Role } from '../types';

export const PHASE_META: Record<
  PhaseId,
  { name: string; description: string; tone: 'purple' | 'blue' | 'emerald' }
> = {
  1: {
    name: 'Within Walls',
    description: 'Plumbing, Electrical, HVAC, Structural, rough-ins',
    tone: 'purple',
  },
  2: {
    name: 'Surface Work',
    description: 'Drywall, Subfloor, Tile, Cabinets, Flooring, Trim',
    tone: 'blue',
  },
  3: {
    name: 'Finishes',
    description: 'Paint, Fixtures, Appliances, Hardware, Landscaping',
    tone: 'emerald',
  },
};

/** Default responsibilities granted to each role (see spec role matrix). */
export const ROLE_DEFAULT_RESPONSIBILITIES: Record<Role, Responsibility[]> = {
  admin: ['finances', 'sow', 'progress', 'photos', 'documents'],
  manager: ['finances', 'sow', 'progress'],
  contractor: ['sow', 'progress', 'photos', 'documents'],
  viewer: ['finances', 'progress'],
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  contractor: 'Contractor',
  viewer: 'Viewer',
};

/** Which responsibility a given project-detail tab requires to be visible. */
export const TAB_RESPONSIBILITY: Record<string, Responsibility> = {
  overview: 'progress',
  sow: 'sow',
  financials: 'finances',
  photos: 'photos',
  updates: 'progress',
};
