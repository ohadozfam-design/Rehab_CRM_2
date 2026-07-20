import { useState } from 'react';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { formatCurrency } from '../../lib/format';
import {
  accruedInterest,
  balloonDue,
  monthlyPayment,
  totalInterest,
} from '../../lib/finance';
import type { LoanInfo, LoanType, Renovation } from '../../types';

const input =
  'w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-[12px] text-text outline-none focus:border-accent';
const microLabel =
  'mb-1 block text-[10px] font-semibold uppercase tracking-[0.05em] text-text-4';

const LOAN_TYPE_LABEL: Record<LoanType, string> = {
  'interest-only': 'Interest-only',
  amortized: 'Amortized P&I',
  manual: 'Manual',
};

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-[11px] text-text-3">{label}</div>
      <div className={`text-[14px] font-bold tabular-nums ${tone ?? 'text-text'}`}>
        {value}
      </div>
    </div>
  );
}

export default function LoanCard({
  renovation,
  editable,
}: {
  renovation: Renovation;
  editable: boolean;
}) {
  const updateRenovation = useRenovationStore((s) => s.updateRenovation);
  const [editing, setEditing] = useState(false);
  const loan = renovation.loan;

  const enableLoan = () => {
    const fresh: LoanInfo = {
      enabled: true,
      loanType: 'interest-only',
      principal: 0,
      interestRate: 0,
      termMonths: 12,
      monthlyPayment: 0,
      startDate: new Date().toISOString().slice(0, 10),
    };
    updateRenovation(renovation.id, { loan: fresh });
    setEditing(true);
  };

  if (!loan || !loan.enabled) {
    return (
      <div className="mb-4 rounded border border-border bg-surface p-4">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
          💵 Loan Financing
        </div>
        <p className="text-[13px] text-text-3">
          This project is not loan-financed.
        </p>
        {editable && (
          <button
            className="mt-2 text-[12px] font-semibold text-accent"
            onClick={enableLoan}
          >
            + Enable financing
          </button>
        )}
      </div>
    );
  }

  const patchLoan = (p: Partial<LoanInfo>) => {
    const next = { ...loan, ...p };
    // Keep the stored monthly payment consistent for non-manual models.
    if (next.loanType !== 'manual') next.monthlyPayment = monthlyPayment(next);
    updateRenovation(renovation.id, { loan: next });
  };

  const monthly = monthlyPayment(loan);
  const accrued = accruedInterest(loan);
  const balloon = balloonDue(loan);

  return (
    <div className="mb-4 rounded border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
          💵 Loan Financing
          <span className="inline-flex items-center rounded-full bg-emerald-soft px-2 py-0.5 text-[11px] font-semibold normal-case text-emerald-text">
            {LOAN_TYPE_LABEL[loan.loanType ?? 'interest-only']}
          </span>
        </div>
        {editable && (
          <button
            className="text-[12px] font-semibold text-accent"
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? 'Done' : '✎ Edit'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div>
            <label className={microLabel}>Type</label>
            <select
              className={input}
              value={loan.loanType}
              onChange={(e) => patchLoan({ loanType: e.target.value as LoanType })}
            >
              <option value="interest-only">Interest-only</option>
              <option value="amortized">Amortized P&amp;I</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div>
            <label className={microLabel}>Principal ($)</label>
            <input
              type="number"
              className={input}
              value={loan.principal || ''}
              onChange={(e) => patchLoan({ principal: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={microLabel}>Rate (APR %)</label>
            <input
              type="number"
              step="0.1"
              className={input}
              value={loan.interestRate || ''}
              onChange={(e) =>
                patchLoan({ interestRate: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className={microLabel}>Term (months)</label>
            <input
              type="number"
              className={input}
              value={loan.termMonths || ''}
              onChange={(e) => patchLoan({ termMonths: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={microLabel}>Start date</label>
            <input
              type="date"
              className={input}
              value={loan.startDate ?? ''}
              onChange={(e) => patchLoan({ startDate: e.target.value })}
            />
          </div>
          {loan.loanType === 'manual' && (
            <div>
              <label className={microLabel}>Monthly payment ($)</label>
              <input
                type="number"
                className={input}
                value={loan.monthlyPayment || ''}
                onChange={(e) =>
                  updateRenovation(renovation.id, {
                    loan: { ...loan, monthlyPayment: Number(e.target.value) },
                  })
                }
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Principal" value={formatCurrency(loan.principal)} />
            <Stat
              label="Rate / Term"
              value={`${loan.interestRate}% · ${loan.termMonths}mo`}
            />
            <Stat
              label="Monthly Payment"
              value={formatCurrency(monthly)}
              tone="text-emerald-text"
            />
            <Stat
              label="Total Interest"
              value={formatCurrency(totalInterest(loan))}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 md:grid-cols-4">
            <Stat
              label="Accrued Interest (to date)"
              value={formatCurrency(accrued)}
              tone="text-amber-text"
            />
          </div>
          {balloon > 0 && (
            <div className="mt-2 text-[10px] italic text-text-4">
              Balloon: {formatCurrency(balloon)} principal is due at end of term
              ({loan.termMonths} months).
            </div>
          )}
        </>
      )}
    </div>
  );
}
