import {
  AlertTriangle,
  Check,
  DollarSign,
  FileText,
  Package,
  Wrench,
} from 'lucide-react';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { formatCurrency } from '../../lib/format';
import { waiverState } from '../../lib/finance';
import type { FinancialCategory, Renovation } from '../../types';

const CAT_ICON: Record<
  FinancialCategory,
  { Icon: typeof Wrench; cls: string }
> = {
  labor: { Icon: Wrench, cls: 'bg-amber-soft text-amber-text' },
  material: { Icon: Package, cls: 'bg-accent-soft text-accent' },
  loan: { Icon: DollarSign, cls: 'bg-emerald-soft text-emerald-text' },
  other: { Icon: FileText, cls: 'bg-surface-3 text-text-3' },
};

export default function TransactionHistory({
  renovation,
  editable,
}: {
  renovation: Renovation;
  editable: boolean;
}) {
  const updateFinancialEntry = useRenovationStore((s) => s.updateFinancialEntry);

  const entries = [...renovation.financialEntries].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );

  const attachWaiver = (entryId: string) =>
    updateFinancialEntry(renovation.id, entryId, {
      lienWaiverUrl: `https://example.com/waivers/${entryId}.pdf`,
      lienWaiverReceivedAt: new Date().toISOString(),
    });

  return (
    <div className="mb-4 rounded border border-border bg-surface p-4">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
        Transaction History ({entries.length})
      </div>

      {entries.length === 0 ? (
        <p className="text-[13px] text-text-3">No transactions recorded yet.</p>
      ) : (
        <div>
          {entries.map((e) => {
            const cat = CAT_ICON[e.category];
            const wState = waiverState(e);
            return (
              <div
                key={e.id}
                className="flex items-center gap-3 border-b border-border py-2.5 last:border-0"
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${cat.cls}`}
                >
                  <cat.Icon size={12} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] text-text">
                      {e.description}
                    </span>
                    {wState === 'needed' && (
                      <span className="inline-flex items-center gap-1 rounded bg-red-soft px-1.5 py-px text-[9px] font-bold text-red-text">
                        <AlertTriangle size={9} /> WAIVER NEEDED
                      </span>
                    )}
                    {wState === 'on-file' && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-soft px-1.5 py-px text-[9px] font-bold text-emerald-text">
                        <Check size={9} /> WAIVER ON FILE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-text-4">
                    {e.date}
                    {e.vendor ? ` · ${e.vendor}` : ''}
                    {e.phase ? ` · Phase ${e.phase}` : ''}
                  </div>
                  {wState === 'needed' && editable && (
                    <button
                      className="mt-0.5 text-[10px] font-semibold text-accent"
                      onClick={() => attachWaiver(e.id)}
                    >
                      + Attach signed waiver
                    </button>
                  )}
                </div>
                <div className="text-[13px] font-bold tabular-nums text-text">
                  {formatCurrency(e.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
