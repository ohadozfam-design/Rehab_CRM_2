import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { PHASE_META } from '../../lib/constants';
import { phaseItems } from '../../lib/sow';
import type { MediaItem, PhaseId, Renovation, SOWItem } from '../../types';

interface PhaseMedia {
  media: MediaItem;
  itemId: string;
  itemDesc: string;
}

function collectPhaseMedia(items: SOWItem[]): PhaseMedia[] {
  const out: PhaseMedia[] = [];
  for (const it of items) {
    for (const m of it.media ?? []) {
      out.push({ media: m, itemId: it.id, itemDesc: it.description });
    }
  }
  return out;
}

/** Inline "attach media to a SOW item" control for a phase. */
function AttachMedia({
  renovation,
  items,
}: {
  renovation: Renovation;
  items: SOWItem[];
}) {
  const addItemMedia = useRenovationStore((s) => s.addItemMedia);
  const currentUser = useAuthStore((s) => s.currentUser());
  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState(items[0]?.id ?? '');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');

  const input =
    'rounded-md border border-border-strong bg-surface px-2 py-1.5 text-[12px] text-text outline-none focus:border-accent';

  if (items.length === 0) {
    return (
      <p className="text-[11px] text-text-4">
        Add SOW items to this phase before attaching media.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        className="text-[12px] font-semibold text-accent"
        onClick={() => setOpen(true)}
      >
        + Attach photo / video
      </button>
    );
  }

  const save = () => {
    if (!url.trim() || !itemId) return;
    addItemMedia(renovation.id, itemId, {
      id: `md-${Date.now()}`,
      type,
      url: url.trim(),
      uploadedById: currentUser?.id,
      uploadedAt: new Date().toISOString(),
    });
    setUrl('');
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={input}
        value={itemId}
        onChange={(e) => setItemId(e.target.value)}
      >
        {items.map((it) => (
          <option key={it.id} value={it.id}>
            {it.description || '(untitled)'}
          </option>
        ))}
      </select>
      <select
        className={input}
        value={type}
        onChange={(e) => setType(e.target.value as 'image' | 'video')}
      >
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>
      <input
        className={`${input} min-w-[180px] flex-1`}
        placeholder="Media URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        className="rounded-md bg-accent px-2.5 py-1.5 text-[12px] font-semibold text-white"
        onClick={save}
      >
        Add
      </button>
      <button
        className="text-[12px] text-text-4"
        onClick={() => setOpen(false)}
      >
        Cancel
      </button>
    </div>
  );
}

function DriveFolder({
  renovation,
  phase,
  editable,
}: {
  renovation: Renovation;
  phase: PhaseId;
  editable: boolean;
}) {
  const updateRenovation = useRenovationStore((s) => s.updateRenovation);
  const url = renovation.driveFolders?.[phase] ?? '';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(url);

  const setFolder = (value: string) =>
    updateRenovation(renovation.id, {
      driveFolders: { ...renovation.driveFolders, [phase]: value },
    });

  if (editing && editable) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          className="rounded-md border border-border-strong bg-surface px-2 py-1 text-[11px] text-text outline-none focus:border-accent"
          placeholder="Google Drive folder URL"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          className="text-[11px] font-semibold text-accent"
          onClick={() => {
            setFolder(draft.trim());
            setEditing(false);
          }}
        >
          Save
        </button>
      </div>
    );
  }

  if (url) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] text-accent"
        >
          🔗 Drive Folder
        </a>
        {editable && (
          <button
            className="text-[11px] text-text-4 hover:text-text"
            onClick={() => {
              setDraft(url);
              setEditing(true);
            }}
          >
            edit
          </button>
        )}
      </div>
    );
  }

  return editable ? (
    <button
      className="text-[12px] text-text-3 hover:text-text"
      onClick={() => setEditing(true)}
    >
      🔗 Link Drive Folder
    </button>
  ) : null;
}

export default function PhotosTab({ renovation }: { renovation: Renovation }) {
  const user = useAuthStore((s) => s.currentUser());
  const hasPhotos = useAuthStore((s) => s.hasResponsibility('photos'));
  const editable = !!user && user.role !== 'viewer' && hasPhotos;
  const removeItemMedia = useRenovationStore((s) => s.removeItemMedia);

  return (
    <div className="mx-auto max-w-[900px] px-6 py-5">
      {([1, 2, 3] as PhaseId[]).map((phase) => {
        const items = phaseItems(renovation, phase);
        const media = collectPhaseMedia(items);
        return (
          <div
            key={phase}
            className="mb-4 rounded border border-border bg-surface p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
                Phase {phase} — {PHASE_META[phase].name} · {media.length} photos
              </span>
              <DriveFolder
                renovation={renovation}
                phase={phase}
                editable={editable}
              />
            </div>

            {media.length === 0 ? (
              <p className="mb-3 text-[12px] text-text-4">
                No media attached to this phase yet.
              </p>
            ) : (
              <div className="mb-3 grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-1.5">
                {media.map(({ media: m, itemId, itemDesc }) => (
                  <div
                    key={m.id}
                    className="group relative aspect-square overflow-hidden rounded-md bg-surface-2"
                    title={itemDesc}
                  >
                    {m.type === 'image' ? (
                      <img
                        src={m.url}
                        alt={itemDesc}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-white"
                        style={{ background: '#1e293b' }}
                      >
                        ▶
                      </div>
                    )}
                    {editable && (
                      <button
                        className="absolute right-1 top-1 hidden rounded bg-black/60 px-1 text-[10px] text-white group-hover:block"
                        onClick={() =>
                          removeItemMedia(renovation.id, itemId, m.id)
                        }
                        title="Delete"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {editable && (
              <AttachMedia renovation={renovation} items={items} />
            )}
          </div>
        );
      })}
    </div>
  );
}
