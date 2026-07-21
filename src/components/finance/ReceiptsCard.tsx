import { Check, Receipt as ReceiptIcon, Sparkles, Upload } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { formatCurrency } from '../../lib/format';
import type { Receipt, Renovation } from '../../types';

const SIM_STORES = ['The Home Depot', "Lowe's", 'Ferguson', 'Sherwin-Williams'];
const SIM_ITEMS = [
  '2x4 lumber (10)',
  'Drywall sheets',
  'Joint compound',
  'Paint (5gal)',
  'Fasteners & anchors',
  'PEX fittings',
];

/** Simulated AI receipt processor: fabricates plausible extracted metadata. */
function simulateScan(): Partial<Receipt> {
  const store = SIM_STORES[Math.floor(Math.random() * SIM_STORES.length)];
  const items = SIM_ITEMS.slice(0, 2 + Math.floor(Math.random() * 3));
  const total = Math.round((60 + Math.random() * 340) * 100) / 100;
  return {
    scanned: true,
    store,
    total,
    lineItems: items.map((description) => ({ description })),
    aiSummary: `Detected ${store} receipt. Auto-extracted total: ${formatCurrency(
      total,
    )}. Line items: ${items.join(', ')}.`,
  };
}

export default function ReceiptsCard({
  renovation,
  editable,
}: {
  renovation: Renovation;
  editable: boolean;
}) {
  const addReceipt = useRenovationStore((s) => s.addReceipt);
  const updateReceipt = useRenovationStore((s) => s.updateReceipt);
  const removeReceipt = useRenovationStore((s) => s.removeReceipt);
  const users = useAuthStore((s) => s.users);
  const currentUser = useAuthStore((s) => s.currentUser());

  const receipts = renovation.receipts ?? [];
  const scannedCount = receipts.filter((r) => r.scanned).length;
  const total = receipts.reduce((acc, r) => acc + (r.total ?? 0), 0);

  const uploaderName = (id?: string) =>
    users.find((u) => u.id === id)?.name ?? 'Unknown';

  const upload = () =>
    addReceipt(renovation.id, {
      id: `rec-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      uploadedById: currentUser?.id,
      scanned: false,
    });

  return (
    <div className="mb-4 rounded border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
          <ReceiptIcon size={13} /> Store Receipts{' '}
          <span className="font-medium normal-case text-text-4">
            ({receipts.length} · {scannedCount} scanned ·{' '}
            {formatCurrency(total)} total)
          </span>
        </div>
        {editable && (
          <button
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent"
            onClick={upload}
          >
            <Upload size={13} /> Upload Receipt
          </button>
        )}
      </div>

      {receipts.length === 0 ? (
        <p className="text-[13px] text-text-3">No receipts uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {receipts.map((rc) => (
            <div
              key={rc.id}
              className="flex items-start gap-3 rounded-lg bg-surface-2 p-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent">
                <ReceiptIcon size={16} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-accent">
                  {rc.store ?? 'Receipt'}
                </div>
                <div className="text-[11px] text-text-3">
                  {rc.date ?? ''}
                  {rc.phase ? ` · Phase ${rc.phase}` : ''} · uploaded by{' '}
                  {uploaderName(rc.uploadedById)}
                </div>
                {rc.aiSummary && (
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-purple-soft px-2 py-1 text-[10px] text-purple-text">
                    <Sparkles size={11} /> {rc.aiSummary}
                  </div>
                )}
              </div>
              <div className="text-right">
                {rc.scanned ? (
                  <>
                    <div className="text-[14px] font-bold text-text">
                      {rc.total != null ? formatCurrency(rc.total) : '—'}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-soft px-1.5 py-0.5 text-[9px] text-emerald-text">
                      <Check size={10} /> Scanned
                    </div>
                  </>
                ) : editable ? (
                  <button
                    className="inline-flex items-center gap-1 rounded bg-purple px-2 py-1 text-[10px] font-semibold text-white"
                    onClick={() => updateReceipt(renovation.id, rc.id, simulateScan())}
                  >
                    <Sparkles size={11} /> AI Scan
                  </button>
                ) : (
                  <span className="text-[11px] text-text-4">Unscanned</span>
                )}
                {editable && (
                  <button
                    className="mt-1 block text-[10px] text-text-4 hover:text-red"
                    onClick={() => removeReceipt(renovation.id, rc.id)}
                  >
                    remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
