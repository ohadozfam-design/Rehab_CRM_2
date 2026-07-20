import { useEffect, useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useContactsStore } from '../../stores/useContactsStore';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { formatCurrency } from '../../lib/format';
import { PHASE_META } from '../../lib/constants';
import type { PhaseId } from '../../types';
import {
  buildRenovation,
  computeMonthlyPayment,
  draftBudget,
  emptyDraft,
  isBasicsValid,
  parseAddress,
  parseSowText,
  type SowMode,
  type WizardDraft,
} from './wizardModel';

const STEPS = ['Basics', 'Team', 'Phases', 'Scope of Work', 'Review'];

const CATEGORY_PRESETS = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Structural',
  'Drywall',
  'Flooring',
  'Tile',
  'Cabinets',
  'Trim',
  'Painting',
  'Kitchen',
  'Master Bath',
  'Landscaping',
  'Appliances',
];

const label =
  'mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-text-3';
const input =
  'w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-accent';
const btnPrimary =
  'inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed';
const btnSecondary =
  'rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-medium text-text-2';
const btnGhost = 'rounded-md px-2.5 py-1.5 text-[12px] text-text-3 hover:text-text';

export default function NewProjectWizard() {
  const open = useUIStore((s) => s.newProjectOpen);
  const close = useUIStore((s) => s.closeNewProject);
  const user = useAuthStore((s) => s.currentUser());
  const contacts = useContactsStore((s) => s.contacts);
  const renovations = useRenovationStore((s) => s.renovations);
  const addRenovation = useRenovationStore((s) => s.addRenovation);

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>(emptyDraft);

  // Reset to a blank draft each time the modal opens.
  useEffect(() => {
    if (open) {
      setStep(0);
      setDraft(emptyDraft());
    }
  }, [open]);

  if (!open) return null;

  const update = (patch: Partial<WizardDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const managers = contacts.filter((c) => c.role === 'manager');
  const contractors = contacts.filter((c) => c.role === 'contractor');

  const onAddressChange = (value: string) => {
    const parsed = parseAddress(value);
    update({
      address: value,
      ...(parsed.city ? { city: parsed.city } : {}),
      ...(parsed.state ? { state: parsed.state } : {}),
    });
  };

  const create = () => {
    addRenovation(buildRenovation(draft, user));
    close();
  };

  const canContinue = step !== 0 || isBasicsValid(draft);
  const budget = draftBudget(draft);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: 'rgba(15, 23, 42, 0.5)' }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-bold text-text">
            New Renovation Project
          </h3>
          <button
            className="rounded-md p-1 text-text-3 hover:bg-surface-2 hover:text-text"
            onClick={close}
            title="Close"
          >
            ✕
          </button>
        </header>

        {/* Step nav */}
        <div className="flex items-center gap-1 border-b border-border px-5 py-3">
          {STEPS.map((s, i) => {
            const state =
              i < step ? 'done' : i === step ? 'current' : 'upcoming';
            return (
              <div key={s} className="flex flex-1 items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-bold ${
                      state === 'current'
                        ? 'bg-accent text-white'
                        : state === 'done'
                          ? 'bg-accent-soft text-accent'
                          : 'bg-surface-3 text-text-4'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      state === 'current'
                        ? 'font-bold text-text'
                        : 'text-text-4'
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1.5 h-px flex-1 ${
                      i < step ? 'bg-accent-soft' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 0 && (
            <div className="space-y-3.5">
              <div>
                <label className={label} htmlFor="np-name">
                  Project name
                </label>
                <input
                  id="np-name"
                  className={input}
                  value={draft.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="e.g. 1105 Pursell Ave Renovation"
                  autoFocus
                />
              </div>
              <div>
                <label className={label} htmlFor="np-address">
                  Address (paste "Street, City, State" to auto-fill)
                </label>
                <input
                  id="np-address"
                  className={input}
                  value={draft.address}
                  onChange={(e) => onAddressChange(e.target.value)}
                  list="np-address-list"
                  placeholder="1105 Pursell Ave, Dayton, OH"
                />
                <datalist id="np-address-list">
                  {renovations.map((r) => (
                    <option
                      key={r.id}
                      value={`${r.address}, ${r.city}, ${r.state}`}
                    />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label} htmlFor="np-city">
                    City
                  </label>
                  <input
                    id="np-city"
                    className={input}
                    value={draft.city}
                    onChange={(e) => update({ city: e.target.value })}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="np-state">
                    State
                  </label>
                  <input
                    id="np-state"
                    className={input}
                    value={draft.state}
                    onChange={(e) => update({ state: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="np-summary">
                  Summary (optional)
                </label>
                <textarea
                  id="np-summary"
                  className={`${input} min-h-[64px] resize-y`}
                  value={draft.summary}
                  onChange={(e) => update({ summary: e.target.value })}
                  placeholder="Short description of the project scope."
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-[13px] font-bold text-text">
                  👤 Project Manager
                </h4>
                {managers.length > 0 && (
                  <select
                    className={`${input} mb-2`}
                    value=""
                    onChange={(e) => {
                      const c = managers.find((m) => m.id === e.target.value);
                      if (c)
                        update({
                          managerName: c.name,
                          managerEmail: c.email ?? '',
                        });
                    }}
                  >
                    <option value="">
                      Pick from address book…
                    </option>
                    {managers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.company}
                      </option>
                    ))}
                  </select>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={input}
                    placeholder="Name"
                    value={draft.managerName}
                    onChange={(e) => update({ managerName: e.target.value })}
                  />
                  <input
                    className={input}
                    placeholder="Email"
                    value={draft.managerEmail}
                    onChange={(e) => update({ managerEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-[13px] font-bold text-text">
                  💼 Contractor
                </h4>
                {contractors.length > 0 && (
                  <select
                    className={`${input} mb-2`}
                    value=""
                    onChange={(e) => {
                      const c = contractors.find(
                        (m) => m.id === e.target.value,
                      );
                      if (c)
                        update({
                          contractorCompany: c.company ?? '',
                          contractorName: c.name,
                          contractorEmail: c.email ?? '',
                        });
                    }}
                  >
                    <option value="">Pick from address book…</option>
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.company}
                      </option>
                    ))}
                  </select>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={input}
                    placeholder="Company"
                    value={draft.contractorCompany}
                    onChange={(e) =>
                      update({ contractorCompany: e.target.value })
                    }
                  />
                  <input
                    className={input}
                    placeholder="Contact name"
                    value={draft.contractorName}
                    onChange={(e) =>
                      update({ contractorName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border p-3">
                <label className="flex items-center gap-2 text-[13px] font-bold text-text">
                  <input
                    type="checkbox"
                    checked={draft.loanEnabled}
                    onChange={(e) => update({ loanEnabled: e.target.checked })}
                  />
                  💵 Finance this project with a loan
                </label>
                {draft.loanEnabled && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className={label}>Loan type</label>
                      <select
                        className={input}
                        value={draft.loanType}
                        onChange={(e) =>
                          update({
                            loanType: e.target
                              .value as WizardDraft['loanType'],
                          })
                        }
                      >
                        <option value="interest-only">Interest-only</option>
                        <option value="amortized">Amortized P&amp;I</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>Principal ($)</label>
                      <input
                        type="number"
                        className={input}
                        value={draft.principal || ''}
                        onChange={(e) =>
                          update({ principal: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <label className={label}>Rate (APR %)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={input}
                        value={draft.interestRate || ''}
                        onChange={(e) =>
                          update({ interestRate: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <label className={label}>Term (months)</label>
                      <input
                        type="number"
                        className={input}
                        value={draft.termMonths || ''}
                        onChange={(e) =>
                          update({ termMonths: Number(e.target.value) })
                        }
                      />
                    </div>
                    {draft.loanType === 'manual' && (
                      <div>
                        <label className={label}>Monthly payment ($)</label>
                        <input
                          type="number"
                          className={input}
                          value={draft.manualMonthlyPayment || ''}
                          onChange={(e) =>
                            update({
                              manualMonthlyPayment: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    )}
                    <div className="col-span-2 text-[12px] text-text-3">
                      Est. monthly payment:{' '}
                      <span className="font-semibold text-emerald-text">
                        {formatCurrency(computeMonthlyPayment(draft))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5">
              <p className="text-[12px] text-text-3">
                Set a target deadline for each of the three fixed phases.
              </p>
              {([1, 2, 3] as PhaseId[]).map((p) => {
                const key = `phase${p}Deadline` as
                  | 'phase1Deadline'
                  | 'phase2Deadline'
                  | 'phase3Deadline';
                return (
                  <div key={p}>
                    <label className={label}>
                      Phase {p} — {PHASE_META[p].name}
                    </label>
                    <input
                      type="date"
                      className={input}
                      value={draft[key]}
                      onChange={(e) => update({ [key]: e.target.value })}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <StepSow draft={draft} update={update} budget={budget} />
          )}

          {step === 4 && <StepReview draft={draft} budget={budget} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-surface-2 px-5 py-3.5">
          <button
            className={btnGhost}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <button className={btnSecondary} onClick={close}>
              Cancel
            </button>
            {step < STEPS.length - 1 ? (
              <button
                className={btnPrimary}
                disabled={!canContinue}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue →
              </button>
            ) : (
              <button className={btnPrimary} onClick={create}>
                ✓ Create Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Step 4: Scope of Work --------------------------------------------------

function StepSow({
  draft,
  update,
  budget,
}: {
  draft: WizardDraft;
  update: (patch: Partial<WizardDraft>) => void;
  budget: number;
}) {
  const setMode = (mode: SowMode) => update({ sowMode: mode });

  const addItem = () =>
    update({
      items: [
        ...draft.items,
        {
          id: `di-${Date.now()}`,
          description: '',
          phase: 1,
          category: '',
          laborCost: 0,
          materialCost: 0,
        },
      ],
    });

  const updateItem = (id: string, patch: Partial<WizardDraft['items'][0]>) =>
    update({
      items: draft.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });

  const removeItem = (id: string) =>
    update({ items: draft.items.filter((it) => it.id !== id) });

  const onFile = (file: File) => {
    if (/\.(txt|csv)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () => {
        const parsed = parseSowText(String(reader.result ?? ''));
        update({
          items: parsed,
          uploadNote: `Parsed ${parsed.length} item(s) from ${file.name}.`,
        });
      };
      reader.readAsText(file);
    } else {
      update({
        uploadNote: `${file.name}: PDF/image extraction is simulated in a later step. Use "Paste text" or "Build manually" for now.`,
      });
    }
  };

  const modeCards: { mode: SowMode; icon: string; title: string; desc: string }[] =
    [
      {
        mode: 'manual',
        icon: '＋',
        title: 'Build manually',
        desc: 'Add items one by one.',
      },
      {
        mode: 'paste',
        icon: '📋',
        title: 'Paste text',
        desc: 'Copy/paste from email, Excel, or a quote.',
      },
      {
        mode: 'upload',
        icon: '📤',
        title: 'Upload SOW file',
        desc: 'TXT/CSV parsed now; PDF simulated later.',
      },
    ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        {modeCards.map((c) => (
          <button
            key={c.mode}
            onClick={() => setMode(c.mode)}
            className={`rounded-xl border-2 p-3.5 text-left ${
              draft.sowMode === c.mode
                ? 'border-accent bg-accent-soft'
                : 'border-border'
            }`}
          >
            <div className="text-xl">{c.icon}</div>
            <div className="mt-1.5 text-[13px] font-bold text-text">
              {c.title}
            </div>
            <div className="mt-0.5 text-[11px] text-text-3">{c.desc}</div>
          </button>
        ))}
      </div>

      {draft.sowMode === 'paste' && (
        <div>
          <textarea
            className={`${input} min-h-[120px] font-mono text-[12px]`}
            placeholder={
              'Phase 1\nInstall & plumb sink\t250\t300\nPhase 2\n20MIL LVP | 900 | 985'
            }
            value={draft.pasteText}
            onChange={(e) => update({ pasteText: e.target.value })}
          />
          <button
            className={`${btnSecondary} mt-2`}
            onClick={() =>
              update({ items: parseSowText(draft.pasteText), sowMode: 'paste' })
            }
          >
            ✨ Parse text
          </button>
        </div>
      )}

      {draft.sowMode === 'upload' && (
        <div className="rounded-lg border-2 border-dashed border-border-strong p-4 text-center">
          <input
            type="file"
            accept=".txt,.csv,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
            className="text-[12px] text-text-3"
          />
          {draft.uploadNote && (
            <p className="mt-2 text-[12px] text-text-2">{draft.uploadNote}</p>
          )}
        </div>
      )}

      {/* Item list (all modes share the editable result) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] font-bold text-text">
            Items ({draft.items.length})
          </span>
          <span className="text-[12px] text-text-3">
            Budget:{' '}
            <span className="font-semibold text-text">
              {formatCurrency(budget)}
            </span>
          </span>
        </div>

        <div className="space-y-2">
          {draft.items.map((it) => (
            <div
              key={it.id}
              className="grid grid-cols-[1fr_70px_80px_80px_28px] items-center gap-2"
            >
              <input
                className={`${input} py-1.5`}
                placeholder="Description"
                value={it.description}
                onChange={(e) =>
                  updateItem(it.id, { description: e.target.value })
                }
              />
              <select
                className={`${input} px-1.5 py-1.5`}
                value={it.phase}
                onChange={(e) =>
                  updateItem(it.id, {
                    phase: Number(e.target.value) as PhaseId,
                  })
                }
              >
                <option value={1}>P1</option>
                <option value={2}>P2</option>
                <option value={3}>P3</option>
              </select>
              <input
                type="number"
                className={`${input} py-1.5`}
                placeholder="Labor"
                value={it.laborCost || ''}
                onChange={(e) =>
                  updateItem(it.id, { laborCost: Number(e.target.value) })
                }
              />
              <input
                type="number"
                className={`${input} py-1.5`}
                placeholder="Material"
                value={it.materialCost || ''}
                onChange={(e) =>
                  updateItem(it.id, { materialCost: Number(e.target.value) })
                }
              />
              <button
                className="text-text-4 hover:text-red"
                onClick={() => removeItem(it.id)}
                title="Remove"
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <button className={`${btnSecondary} mt-2`} onClick={addItem}>
          + Add item
        </button>
        <datalist id="np-category-list">
          {CATEGORY_PRESETS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

// ---- Step 5: Review ---------------------------------------------------------

function StepReview({
  draft,
  budget,
}: {
  draft: WizardDraft;
  budget: number;
}) {
  const rows: [string, string][] = [
    ['Name', draft.name || '—'],
    [
      'Address',
      [draft.address, draft.city, draft.state].filter(Boolean).join(', ') || '—',
    ],
    ['Manager', draft.managerName || '—'],
    ['Contractor', draft.contractorCompany || '—'],
    [
      'Financing',
      draft.loanEnabled
        ? `${draft.loanType} · ${formatCurrency(draft.principal)} @ ${draft.interestRate}%`
        : 'None',
    ],
    [
      'Phase deadlines',
      [draft.phase1Deadline, draft.phase2Deadline, draft.phase3Deadline]
        .map((d) => d || '—')
        .join('  ·  '),
    ],
    ['SOW items', String(draft.items.length)],
    ['Computed budget', formatCurrency(budget)],
  ];

  return (
    <div>
      <h4 className="mb-3 text-[15px] font-bold text-text">
        Review &amp; save
      </h4>
      <div className="overflow-hidden rounded-lg border border-border">
        {rows.map(([k, v], i) => (
          <div
            key={k}
            className={`grid grid-cols-[160px_1fr] gap-2 px-4 py-2.5 text-[13px] ${
              i % 2 ? 'bg-surface' : 'bg-surface-2'
            }`}
          >
            <span className="font-semibold text-text-3">{k}</span>
            <span className="text-text-2">{v}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-text-3">
        Creating adds this project to your dashboard as <strong>Active</strong>.
      </p>
    </div>
  );
}
