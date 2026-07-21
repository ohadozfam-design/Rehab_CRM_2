import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Image,
  LayoutGrid,
  ListChecks,
  MapPin,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useRenovationStore } from '../stores/useRenovationStore';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { TAB_RESPONSIBILITY } from '../lib/constants';
import type { Responsibility } from '../types';
import AccessDenied from '../components/AccessDenied';
import SowTab from '../components/sow/SowTab';
import FinancialsTab from '../components/finance/FinancialsTab';
import PhotosTab from '../components/media/PhotosTab';
import UpdatesTab from '../components/updates/UpdatesTab';
import OverviewTab from '../components/overview/OverviewTab';

type TabKey = 'overview' | 'sow' | 'financials' | 'photos' | 'updates';

const TABS: { key: TabKey; label: string; Icon: typeof LayoutGrid }[] = [
  { key: 'overview', label: 'Overview', Icon: LayoutGrid },
  { key: 'sow', label: 'Scope of Work', Icon: ListChecks },
  { key: 'financials', label: 'Financials', Icon: DollarSign },
  { key: 'photos', label: 'Photos', Icon: Image },
  { key: 'updates', label: 'Updates', Icon: MessageSquare },
];

export default function RenovationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const renovation = useRenovationStore((s) => (id ? s.getById(id) : undefined));
  const removeRenovation = useRenovationStore((s) => s.removeRenovation);
  const hasResponsibility = useAuthStore((s) => s.hasResponsibility);
  const isAdmin = useAuthStore((s) => s.hasRole('admin'));
  const userId = useAuthStore((s) => s.currentUserId);
  const track = useTelemetryStore((s) => s.track);

  const visibleTabs = TABS.filter((t) =>
    hasResponsibility(TAB_RESPONSIBILITY[t.key] as Responsibility),
  );
  const [active, setActive] = useState<TabKey>(
    visibleTabs[0]?.key ?? 'overview',
  );

  useEffect(() => {
    if (userId) track(userId, `tab:${active}`);
  }, [active, userId, track]);

  if (!renovation) {
    return (
      <div className="mx-auto max-w-[900px] px-8 py-16 text-center">
        <p className="mb-3 text-sm text-text-3">Project not found.</p>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-[13px] font-medium text-text-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={15} /> Back to dashboard
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
      <div className="border-b border-border bg-surface px-8 pt-3">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 pb-3">
          <button
            className="rounded-md p-1.5 text-text-3 hover:bg-surface-2 hover:text-text"
            onClick={() => navigate('/')}
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-bold text-text">{renovation.name}</h1>
            <div className="flex items-center gap-1 text-[11px] text-text-3">
              <MapPin size={11} /> {renovation.address}, {renovation.city},{' '}
              {renovation.state}
            </div>
          </div>
          {isAdmin && (
            <button
              className="rounded-md p-1.5 text-text-3 hover:bg-red-soft hover:text-red-text"
              onClick={onDelete}
              title="Delete project"
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>

        <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto">
          {visibleTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-[13px] ${
                active === t.key
                  ? 'border-accent font-semibold text-accent'
                  : 'border-transparent font-medium text-text-3 hover:text-text'
              }`}
            >
              <t.Icon size={15} /> {t.label}
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
        <OverviewTab renovation={renovation} />
      )}
    </div>
  );
}
