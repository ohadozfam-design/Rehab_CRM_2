import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { ROLE_DEFAULT_RESPONSIBILITIES, ROLE_LABELS } from '../../lib/constants';
import type { Renovation, Responsibility, Role, User } from '../../types';
import Modal from '../ui/Modal';

const RESPONSIBILITIES: Responsibility[] = [
  'finances',
  'sow',
  'progress',
  'photos',
  'documents',
];
const ROLES: Role[] = ['admin', 'manager', 'contractor', 'viewer'];

const label =
  'mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-text-3';
const input =
  'w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-accent';

interface Draft {
  name: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  role: Role;
  contractorCompany: string;
  responsibilities: Responsibility[];
  assignedProjectIds: string[];
}

function toDraft(user: User | null): Draft {
  if (!user) {
    return {
      name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      role: 'contractor',
      contractorCompany: '',
      responsibilities: ROLE_DEFAULT_RESPONSIBILITIES.contractor,
      assignedProjectIds: [],
    };
  }
  return {
    name: user.name,
    username: user.username,
    password: user.password,
    email: user.email ?? '',
    phone: user.phone ?? '',
    role: user.role,
    contractorCompany: user.contractorCompany ?? '',
    responsibilities: user.responsibilities ?? [],
    assignedProjectIds: user.assignedProjectIds ?? [],
  };
}

export default function UserEditor({
  user,
  renovations,
  onClose,
}: {
  user: User | null;
  renovations: Renovation[];
  onClose: () => void;
}) {
  const addUser = useAuthStore((s) => s.addUser);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [draft, setDraft] = useState<Draft>(() => toDraft(user));

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  const valid = draft.name.trim() && draft.username.trim() && draft.password.trim();

  const save = () => {
    if (!valid) return;
    const payload = {
      name: draft.name.trim(),
      username: draft.username.trim(),
      password: draft.password,
      email: draft.email.trim() || undefined,
      phone: draft.phone.trim() || undefined,
      role: draft.role,
      contractorCompany: draft.contractorCompany.trim() || undefined,
      responsibilities: draft.responsibilities,
      assignedProjectIds: draft.assignedProjectIds,
    };
    if (user) {
      updateUser(user.id, payload);
    } else {
      addUser({ id: `user-${Date.now()}`, ...payload });
    }
    onClose();
  };

  return (
    <Modal
      title={user ? `Edit ${user.name}` : 'New User'}
      onClose={onClose}
      maxWidth={560}
      footer={
        <>
          <button
            className="rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-medium text-text-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            disabled={!valid}
            onClick={save}
          >
            {user ? 'Save changes' : 'Create user'}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Full name</label>
            <input
              className={input}
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className={label}>Role</label>
            <select
              className={input}
              value={draft.role}
              onChange={(e) => {
                const role = e.target.value as Role;
                set({
                  role,
                  responsibilities: ROLE_DEFAULT_RESPONSIBILITIES[role],
                });
              }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Username</label>
            <input
              className={input}
              value={draft.username}
              onChange={(e) => set({ username: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Password</label>
            <input
              className={input}
              value={draft.password}
              onChange={(e) => set({ password: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Email</label>
            <input
              className={input}
              value={draft.email}
              onChange={(e) => set({ email: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input
              className={input}
              value={draft.phone}
              onChange={(e) => set({ phone: e.target.value })}
            />
          </div>
          {draft.role === 'contractor' && (
            <div className="col-span-2">
              <label className={label}>Contractor company</label>
              <input
                className={input}
                value={draft.contractorCompany}
                onChange={(e) => set({ contractorCompany: e.target.value })}
              />
            </div>
          )}
        </div>

        <div>
          <label className={label}>Responsibilities</label>
          <div className="flex flex-wrap gap-2">
            {RESPONSIBILITIES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() =>
                  set({ responsibilities: toggle(draft.responsibilities, r) })
                }
                className={`rounded-lg border px-2.5 py-1 text-[12px] capitalize ${
                  draft.responsibilities.includes(r)
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border text-text-3'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Assigned projects</label>
          {renovations.length === 0 ? (
            <p className="text-[12px] text-text-4">No projects yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {renovations.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-[12px] text-text"
                >
                  <input
                    type="checkbox"
                    checked={draft.assignedProjectIds.includes(r.id)}
                    onChange={() =>
                      set({
                        assignedProjectIds: toggle(
                          draft.assignedProjectIds,
                          r.id,
                        ),
                      })
                    }
                  />
                  {r.name}
                </label>
              ))}
            </div>
          )}
          <p className="mt-1 text-[11px] text-text-4">
            Admins and viewers see all projects regardless of assignment.
          </p>
        </div>
      </div>
    </Modal>
  );
}
