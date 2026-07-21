import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Camera,
  CheckCircle2,
  Circle,
  LogOut,
  Monitor,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { useUIStore } from '../../stores/useUIStore';
import { PHASE_META } from '../../lib/constants';
import { completionOf } from '../../lib/sow';
import type { Renovation, SOWItem } from '../../types';

interface AssignedItem {
  renovation: Renovation;
  item: SOWItem;
}

function FieldItemCard({
  entry,
  userId,
}: {
  entry: AssignedItem;
  userId: string;
}) {
  const { renovation, item } = entry;
  const updateSowItem = useRenovationStore((s) => s.updateSowItem);
  const addItemMedia = useRenovationStore((s) => s.addItemMedia);
  const track = useTelemetryStore((s) => s.track);
  const fileRef = useRef<HTMLInputElement>(null);

  const pct = completionOf(item);
  const done = pct === 100;
  const proofCount = item.media?.length ?? 0;

  const markDone = () =>
    updateSowItem(renovation.id, item.id, {
      completionPct: done ? 0 : 100,
      completed: !done,
      approvedAt: done ? undefined : new Date().toISOString(),
    });

  const onCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addItemMedia(renovation.id, item.id, {
        id: `md-${Date.now()}`,
        type: 'image',
        url: String(reader.result ?? ''),
        uploadedById: userId,
        uploadedAt: new Date().toISOString(),
      });
      track(userId, 'upload-media');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const needsProof = done && proofCount === 0;

  return (
    <div
      className={`rounded-xl border bg-surface p-4 ${needsProof ? 'border-amber' : 'border-border'}`}
    >
      <div className="mb-1 text-[11px] font-medium text-text-3">
        {renovation.name} · {PHASE_META[item.phase].name}
      </div>
      <div className="mb-3 text-[15px] font-semibold text-text">
        {item.description || '(untitled item)'}
      </div>

      {proofCount > 0 && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto">
          {item.media!.map((m) => (
            <img
              key={m.id}
              src={m.url}
              alt=""
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {needsProof && (
        <div className="mb-3 rounded-lg bg-amber-soft px-3 py-2 text-[12px] font-medium text-amber-text">
          Marked done — add a proof photo to confirm.
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={markDone}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-semibold ${
            done
              ? 'bg-emerald-soft text-emerald-text'
              : 'border border-border-strong text-text-2'
          }`}
        >
          {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          {done ? 'Done' : 'Mark done'}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent py-3 text-[14px] font-semibold text-white"
        >
          <Camera size={18} />
          Add photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onCapture}
        />
      </div>
    </div>
  );
}

/**
 * Simplified, mobile-first interface for contractors: shows only their assigned
 * SOW items with 1-tap done + proof-photo capture. Replaces the full desktop app.
 */
export default function ContractorFieldView() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser());
  const logout = useAuthStore((s) => s.logout);
  const projects = useRenovationStore((s) => s.visibleFor(user));
  const setFieldView = useUIStore((s) => s.setFieldView);

  if (!user) return null;

  const assigned: AssignedItem[] = [];
  for (const r of projects) {
    for (const item of r.sowItems) {
      if (item.assignedUserId === user.id) assigned.push({ renovation: r, item });
    }
  }
  const openCount = assigned.filter(
    (a) => completionOf(a.item) !== 100 || (a.item.media?.length ?? 0) === 0,
  ).length;

  return (
    <div className="min-h-full bg-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-text text-bg">
            <Building2 size={16} strokeWidth={2.25} />
          </div>
          <div>
            <div className="text-[14px] font-bold leading-tight text-text">
              REMO Field
            </div>
            <div className="text-[10px] text-text-3">{user.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="rounded-md p-2 text-text-3 hover:bg-surface-2 hover:text-text"
            title="Switch to full app"
            onClick={() => setFieldView(false)}
          >
            <Monitor size={18} />
          </button>
          <button
            className="rounded-md p-2 text-text-3 hover:bg-surface-2 hover:text-text"
            title="Sign out"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[560px] px-4 py-4">
        <div className="mb-3 text-[13px] text-text-3">
          {assigned.length} assigned {assigned.length === 1 ? 'item' : 'items'} ·{' '}
          <span className="font-semibold text-text">{openCount} need action</span>
        </div>

        {assigned.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center text-[13px] text-text-3">
            You have no assigned scope-of-work items right now.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {assigned.map((entry) => (
              <FieldItemCard
                key={entry.item.id}
                entry={entry}
                userId={user.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
