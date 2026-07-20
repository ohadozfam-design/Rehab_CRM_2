import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { formatCurrency } from '../../lib/format';
import { summarize } from '../../lib/sow';
import type { PhaseId, Renovation } from '../../types';
import SowPhase from './SowPhase';

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
  'Downstairs Bath',
  'Landscaping',
  'Appliances',
  'Exterior',
];

export default function SowTab({ renovation }: { renovation: Renovation }) {
  const editable = useAuthStore((s) => s.hasResponsibility('sow'));
  const [grouped, setGrouped] = useState(true);

  const s = summarize(renovation);

  return (
    <div className="mx-auto max-w-[900px] px-6 py-5">
      {/* Category suggestions for the inline item editors on this tab. */}
      <datalist id="np-category-list">
        {CATEGORY_PRESETS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-text">Scope of Work</h3>
          <div className="text-[11px] text-text-3">
            {s.completed} of {s.total} items completed
            {s.half > 0 && `, ${s.half} at 50%`} · Est. total:{' '}
            {formatCurrency(s.estTotal)}
            {s.variance !== 0 && (
              <span
                className={`font-semibold ${s.variance > 0 ? 'text-red' : 'text-emerald-text'}`}
              >
                {' '}
                ({s.variance > 0 ? '+' : '−'}
                {formatCurrency(Math.abs(s.variance))} vs original{' '}
                {formatCurrency(s.originalTotal)})
              </span>
            )}
          </div>
        </div>
        <button
          className="shrink-0 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-[11px] font-medium text-text-2"
          onClick={() => setGrouped((g) => !g)}
        >
          {grouped ? '🗂 Grouped by Category' : '☰ Flat list'}
        </button>
      </div>

      {([1, 2, 3] as PhaseId[]).map((phase) => (
        <SowPhase
          key={phase}
          renovation={renovation}
          phase={phase}
          grouped={grouped}
          editable={editable}
        />
      ))}
    </div>
  );
}
