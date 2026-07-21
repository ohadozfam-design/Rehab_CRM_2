import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Minus,
  Trash2,
  User,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { formatCurrency } from '../../lib/format';
import {
  completionOf,
  completionPatch,
  itemTotal,
  itemVariance,
  nextCompletion,
} from '../../lib/sow';
import type { Renovation, SOWItem, Unit } from '../../types';

const UNITS: Unit[] = ['EA', 'SF', 'LF', 'UNIT', 'DAYS', 'LS'];

const editInput =
  'w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-[12px] text-text outline-none focus:border-accent';
const editLabel = 'mb-1 block text-[10px] font-semibold uppercase tracking-[0.05em] text-text-4';

export default function SowRow({
  renovation,
  item,
  cols,
  showMaterial,
  editable,
}: {
  renovation: Renovation;
  item: SOWItem;
  cols: string;
  showMaterial: boolean;
  editable: boolean;
}) {
  const [open, setOpen] = useState(false);
  const updateSowItem = useRenovationStore((s) => s.updateSowItem);
  const removeSowItem = useRenovationStore((s) => s.removeSowItem);
  const users = useAuthStore((s) => s.users);
  const currentUser = useAuthStore((s) => s.currentUser());
  const track = useTelemetryStore((s) => s.track);

  const pct = completionOf(item);
  const variance = itemVariance(item);
  const assignee = users.find((u) => u.id === item.assignedUserId);
  const assignable = users.filter((u) =>
    (u.assignedProjectIds ?? []).includes(renovation.id),
  );

  const patch = (p: Partial<SOWItem>) =>
    updateSowItem(renovation.id, item.id, p);

  const cycle = () => {
    if (!editable) return;
    patch(completionPatch(nextCompletion(pct)));
    if (currentUser) track(currentUser.id, 'sow-update');
  };

  // Capture the pre-edit value as baseline the first time a cost is edited.
  const editLabor = (value: number) =>
    patch({
      laborCost: value,
      ...(item.originalLaborCost == null
        ? { originalLaborCost: item.laborCost }
        : {}),
    });
  const editMaterial = (value: number) =>
    patch({
      materialCost: value,
      ...(item.originalMaterialCost == null
        ? { originalMaterialCost: item.materialCost }
        : {}),
    });

  const addComment = (text: string) => {
    if (!text.trim() || !currentUser) return;
    patch({
      comments: [
        ...(item.comments ?? []),
        {
          id: `cm-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          role: currentUser.role,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    });
  };

  const rowTint =
    pct === 100
      ? 'bg-emerald-soft/40'
      : pct === 50
        ? 'bg-amber-soft/40'
        : '';

  return (
    <>
      <div
        className={`grid items-start border-b border-border px-3 py-2 text-[13px] ${rowTint}`}
        style={{ gridTemplateColumns: cols }}
      >
        {/* Tri-state checkbox */}
        <div>
          <button
            onClick={cycle}
            disabled={!editable}
            title={
              pct === 0
                ? 'Mark 50%'
                : pct === 50
                  ? 'Mark complete'
                  : 'Reset to not started'
            }
            className={`mt-0.5 flex h-[18px] w-[18px] items-center justify-center rounded border-2 text-white ${
              pct === 100
                ? 'border-emerald bg-emerald'
                : pct === 50
                  ? 'border-amber bg-amber'
                  : 'border-border-strong'
            } ${editable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {pct === 100 ? (
              <Check size={12} strokeWidth={3} />
            ) : pct === 50 ? (
              <Minus size={12} strokeWidth={3} />
            ) : null}
          </button>
        </div>

        {/* Description */}
        <button
          className="pr-3 text-left"
          onClick={() => setOpen((o) => !o)}
          title="Details"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`font-medium ${pct === 100 ? 'text-text-4 line-through' : 'text-text'}`}
            >
              {item.description || '(untitled item)'}
            </span>
            {pct === 50 && (
              <span className="rounded bg-amber px-1.5 py-px text-[9px] font-bold tracking-[0.05em] text-white">
                50% DONE
              </span>
            )}
            {variance !== 0 && (
              <span
                className={`inline-flex items-center gap-0.5 rounded px-1.5 py-px text-[9px] font-bold ${
                  variance > 0
                    ? 'bg-red-soft text-red-text'
                    : 'bg-emerald-soft text-emerald-text'
                }`}
              >
                {variance > 0 ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
                {variance > 0 ? '+' : '−'}
                {formatCurrency(Math.abs(variance))}
              </span>
            )}
          </div>
          {item.shortNote && (
            <div className="mt-0.5 text-[11px] italic text-text-3">
              {item.shortNote}
            </div>
          )}
          <div className="mt-0.5 flex flex-wrap gap-1.5 text-[10px] text-text-4">
            {item.quantity != null && (
              <span>
                {item.quantity} {item.unit ?? ''}
              </span>
            )}
            {item.category && (
              <span className="rounded bg-surface-2 px-1.5 py-px text-text-3">
                {item.category}
              </span>
            )}
            {assignee && (
              <span className="inline-flex items-center gap-1 rounded bg-accent-soft px-1.5 py-px text-accent">
                <User size={9} /> {assignee.name}
              </span>
            )}
            {item.optional && (
              <span className="rounded bg-amber-soft px-1.5 py-px text-amber-text">
                Optional
              </span>
            )}
          </div>
        </button>

        {/* Labor */}
        <div className="pr-1 text-right font-medium text-amber-text">
          {formatCurrency(item.laborCost)}
        </div>

        {/* Material (conditionally rendered) */}
        {showMaterial && (
          <div className="pr-1 text-right font-medium text-accent">
            {item.materialCost > 0 ? (
              formatCurrency(item.materialCost)
            ) : (
              <span className="text-text-4">—</span>
            )}
          </div>
        )}

        {/* Total */}
        <div className="pr-1 text-right font-bold text-text">
          {formatCurrency(itemTotal(item))}
        </div>

        {/* Actions */}
        <div className="flex justify-end text-text-4">
          <button
            onClick={() => setOpen((o) => !o)}
            title="Details"
            className="hover:text-text"
          >
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expandable detail / editor panel */}
      {open && (
        <div className="border-b border-border bg-surface-2 px-4 py-3">
          {editable ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="col-span-2 md:col-span-4">
                <label className={editLabel}>Description</label>
                <input
                  className={editInput}
                  value={item.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </div>
              <div className="col-span-2 md:col-span-4">
                <label className={editLabel}>Short note</label>
                <input
                  className={editInput}
                  value={item.shortNote ?? ''}
                  onChange={(e) => patch({ shortNote: e.target.value })}
                />
              </div>
              <div>
                <label className={editLabel}>Category</label>
                <input
                  className={editInput}
                  list="np-category-list"
                  value={item.category ?? ''}
                  onChange={(e) => patch({ category: e.target.value })}
                />
              </div>
              <div>
                <label className={editLabel}>Quantity</label>
                <input
                  type="number"
                  className={editInput}
                  value={item.quantity ?? ''}
                  onChange={(e) =>
                    patch({
                      quantity: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div>
                <label className={editLabel}>Unit</label>
                <select
                  className={editInput}
                  value={item.unit ?? ''}
                  onChange={(e) =>
                    patch({ unit: (e.target.value || undefined) as Unit })
                  }
                >
                  <option value="">—</option>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={editLabel}>Vendor</label>
                <input
                  className={editInput}
                  value={item.vendor ?? ''}
                  onChange={(e) => patch({ vendor: e.target.value })}
                />
              </div>
              <div>
                <label className={editLabel}>Labor cost ($)</label>
                <input
                  type="number"
                  className={editInput}
                  value={item.laborCost || ''}
                  onChange={(e) => editLabor(Number(e.target.value))}
                />
              </div>
              <div>
                <label className={editLabel}>Material cost ($)</label>
                <input
                  type="number"
                  className={editInput}
                  value={item.materialCost || ''}
                  onChange={(e) => editMaterial(Number(e.target.value))}
                />
              </div>
              <div>
                <label className={editLabel}>Assigned to</label>
                <select
                  className={editInput}
                  value={item.assignedUserId ?? ''}
                  onChange={(e) =>
                    patch({ assignedUserId: e.target.value || undefined })
                  }
                >
                  <option value="">Unassigned</option>
                  {assignable.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-1.5 text-[12px] text-text-2">
                  <input
                    type="checkbox"
                    checked={item.optional ?? false}
                    onChange={(e) => patch({ optional: e.target.checked })}
                  />
                  Optional
                </label>
              </div>
              <div className="col-span-2 md:col-span-4">
                <label className={editLabel}>Notes</label>
                <textarea
                  className={`${editInput} min-h-[56px] resize-y`}
                  value={item.notes ?? ''}
                  onChange={(e) => patch({ notes: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="text-[12px] text-text-2">
              {item.notes || 'No additional notes.'}
            </div>
          )}

          {/* Comments */}
          <div className="mt-3 border-t border-border pt-3">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-text-4">
              Comments ({item.comments?.length ?? 0})
            </div>
            <div className="space-y-1.5">
              {(item.comments ?? []).map((c) => (
                <div key={c.id} className="text-[12px]">
                  <span className="font-semibold text-text-2">
                    {c.userName}
                  </span>{' '}
                  <span className="text-text-4">
                    · {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  <div className="text-text-2">{c.text}</div>
                </div>
              ))}
            </div>
            {editable && <CommentInput onAdd={addComment} />}
          </div>

          {editable && (
            <div className="mt-3 flex justify-end">
              <button
                className="inline-flex items-center gap-1 text-[12px] text-text-4 hover:text-red"
                onClick={() => removeSowItem(renovation.id, item.id)}
              >
                <Trash2 size={12} /> Remove item
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function CommentInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="mt-2 flex gap-2">
      <input
        className={`${editInput} flex-1`}
        placeholder="Add a comment…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAdd(text);
            setText('');
          }
        }}
      />
      <button
        className="rounded-md bg-accent px-3 py-1.5 text-[12px] font-semibold text-white"
        onClick={() => {
          onAdd(text);
          setText('');
        }}
      >
        Post
      </button>
    </div>
  );
}
