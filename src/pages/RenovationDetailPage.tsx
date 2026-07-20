import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useRenovationStore } from '../stores/useRenovationStore';
import { TAB_RESPONSIBILITY } from '../lib/constants';
import type { Responsibility } from '../types';
import AccessDenied from '../components/AccessDenied';
import SowTab from '../components/sow/SowTab';
import FinancialsTab from '../components/finance/FinancialsTab';
import PhotosTab from '../components/media/PhotosTab';
import UpdatesTab from '../components/updates/UpdatesTab';

type TabKey = 'overview' | 'sow' | 'financials' | 'photos' | 'updates';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '▦ Overview' },
  { key: 'sow', label: '☰ Scope of Work' },
  { key: 'financials', label: '$ Financials' },
  { key: 'photos', label: '📷 Photos' },
  { key: 'updates', label: '💬 Updates' },
];

/** Lightweight placeholder for tabs delivered in later steps. */
function ComingSoon({ step, name }: { step: string; name: string }) {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-12 text-center text-sm text-text-3">
      The <strong>{name}</strong> tab comes online in {step}.
    </div>
  );
}

export default function RenovationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const renovation = useRenovationStore((s) => (id ? s.getById(id) : undefined));
  const removeRenovation = useRenovationStore((s) => s.removeRenovation);
  const hasResponsibility = useAuthStore((s) => s.hasResponsibility);
  const isAdmin = useAuthStore((s) => s.hasRole('admin'));

  const visibleTabs = TABS.filter((t) =>
    hasResponsibility(TAB_RESPONSIBILITY[t.key] as Responsibility),
  );
  const [active, setActive] = useState<TabKey>(
    visibleTabs[0]?.key ?? 'overview',
  );

  if (!renovation) {
    return (
      <div className="mx-auto max-w-[900px] px-6 py-16 text-center">
        <p className="mb-3 text-sm text-text-3">Project not found.</p>
        <button
          className="rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-medium text-text-2"
          onClick={() => navigate('/')}
        >
          ← Back to dashboard
        </button>
      </div>
    );
  }

  const canView = visibleTabs.some((t) => t.key === active);

  const onDelete = () => {
    if (
      window.confirm(
        `Delete "${renovation.name}"? This permanently removes the project.`,
      )
    ) {
      removeRenovation(renovation.id);
      navigate('/', { replace: true });
    }
  };

  return (
    <div>
      {/* Reno header */}
      <div className="border-b border-border bg-surface px-5 pt-3">
        <div className="flex items-center gap-3 pb-3">
          <button
            className="rounded-md p-1.5 text-text-3 hover:bg-surface-2 hover:text-text"
            onClick={() => navigate('/')}
            title="Back"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-text">{renovation.name}</h1>
            <div className="text-[11px] text-text-3">
              📍 {renovation.address}, {renovation.city}, {renovation.state}
            </div>
          </div>
          {isAdmin && (
            <button
              className="rounded-md p-1.5 text-text-3 hover:bg-red-soft hover:text-red-text"
              onClick={onDelete}
              title="Delete project"
            >
              🗑
            </button>
          )}
        </div>

        <div className="flex gap-0.5 overflow-x-auto">
          {visibleTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] ${
                active === t.key
                  ? 'border-accent font-semibold text-accent'
                  : 'border-transparent font-medium text-text-3 hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {!canView ? (
        <AccessDenied />
      ) : active === 'sow' ? (
        <SowTab renovation={renovation} />
      ) : active === 'financials' ? (
        <FinancialsTab renovation={renovation} />
      ) : active === 'photos' ? (
        <PhotosTab renovation={renovation} />
      ) : active === 'updates' ? (
        <UpdatesTab renovation={renovation} />
      ) : (
        <ComingSoon step="a later step" name="Overview" />
      )}
    </div>
  );
}
