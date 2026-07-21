import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { lienRequired } from '../../lib/finance';
import type {
  FinancialCategory,
  FinancialEntry,
  PhaseId,
  Renovation,
} from '../../types';

const label =
  'mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-text-3';
const input =
  'w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-accent';

const CATEGORIES: FinancialCategory[] = [
  'labor',
  'material',
  'loan',
  'other',
];

export default function AddEntryForm({
  renovation,
  onClose,
}: {
  renovation: Renovation;
  onClose: () => void;
}) {
  const addFinancialEntry = useRenovationStore((s) => s.addFinancialEntry);
  const users = useAuthStore((s) => s.users);
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const track = useTelemetryStore((s) => s.track);
  const assignable = users.filter((u) =>
    (u.assignedProjectIds ?? []).includes(renovation.id),
  );

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<FinancialCategory>('labor');
  const [phase, setPhase] = useState<PhaseId | ''>('');
  const [vendor, setVendor] = useState('');
  const [contractorUserId, setContractorUserId] = useState('');

  // Live preview of the enforcement rule.
  const willRequireWaiver = lienRequired({
    id: '',
    date,
    amount,
    description,
    category,
  } as FinancialEntry);

  const save = () => {
    if (!description.trim() || amount <= 0) return;
    const entry: FinancialEntry = {
      id: `fin-${Date.now()}`,
      date,
      amount,
      description: description.trim(),
      category,
      phase: phase === '' ? undefined : phase,
      vendor: vendor.trim() || undefined,
      contractorUserId: contractorUserId || undefined,
      lienWaiverRequired: willRequireWaiver,
    };
    addFinancialEntry(renovation.id, entry);
    if (currentUserId) track(currentUserId, 'add-expense');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: 'rgba(15, 23, 42, 0.5)' }}
    >
      <div className="w-full max-w-[480px] overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-bold text-text">Add transaction</h3>
          <button
            className="rounded-md p-1 text-text-3 hover:bg-surface-2 hover:text-text"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="space-y-3 p-5">
          <div>
            <label className={label}>Description</label>
            <input
              className={input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Deposit (50%) to contractor"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Amount ($)</label>
              <input
                type="number"
                className={input}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={label}>Date</label>
              <input
                type="date"
                className={input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Category</label>
              <select
                className={input}
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as FinancialCategory)
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Phase</label>
              <select
                className={input}
                value={phase}
                onChange={(e) =>
                  setPhase(e.target.value ? (Number(e.target.value) as PhaseId) : '')
                }
              >
                <option value="">—</option>
                <option value={1}>Phase 1</option>
                <option value={2}>Phase 2</option>
                <option value={3}>Phase 3</option>
              </select>
            </div>
            <div>
              <label className={label}>Vendor</label>
              <input
                className={input}
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Contractor</label>
              <select
                className={input}
                value={contractorUserId}
                onChange={(e) => setContractorUserId(e.target.value)}
              >
                <option value="">—</option>
                {assignable.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {willRequireWaiver && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-soft px-3 py-2 text-[12px] text-red-text">
              <AlertTriangle size={14} /> Over $600 in {category} — a signed lien
              waiver will be required.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-2 px-5 py-3.5">
          <button
            className="rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-medium text-text-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            disabled={!description.trim() || amount <= 0}
            onClick={save}
          >
            Add entry
          </button>
        </div>
      </div>
    </div>
  );
}
