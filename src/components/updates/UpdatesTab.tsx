import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRenovationStore } from '../../stores/useRenovationStore';
import { ROLE_LABELS } from '../../lib/constants';
import type { PhaseId, Renovation } from '../../types';

const input =
  'w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-[13px] text-text outline-none focus:border-accent';

function PostForm({ renovation }: { renovation: Renovation }) {
  const addUpdate = useRenovationStore((s) => s.addUpdate);
  const user = useAuthStore((s) => s.currentUser());
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [phaseTag, setPhaseTag] = useState<PhaseId | ''>('');

  if (!open) {
    return (
      <button
        className="text-[12px] font-semibold text-accent"
        onClick={() => setOpen(true)}
      >
        + Post update
      </button>
    );
  }

  const post = () => {
    if (!title.trim() || !message.trim() || !user) return;
    addUpdate(renovation.id, {
      id: `up-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      phaseTag: phaseTag === '' ? undefined : phaseTag,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      createdAt: new Date().toISOString(),
    });
    setTitle('');
    setMessage('');
    setPhaseTag('');
    setOpen(false);
  };

  return (
    <div className="mb-4 space-y-2 rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex gap-2">
        <input
          className={input}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <select
          className={input}
          style={{ maxWidth: 130 }}
          value={phaseTag}
          onChange={(e) =>
            setPhaseTag(e.target.value ? (Number(e.target.value) as PhaseId) : '')
          }
        >
          <option value="">No phase</option>
          <option value={1}>Phase 1</option>
          <option value={2}>Phase 2</option>
          <option value={3}>Phase 3</option>
        </select>
      </div>
      <textarea
        className={`${input} min-h-[64px] resize-y`}
        placeholder="Write an update…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button
          className="rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-[12px] font-medium text-text-2"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
        <button
          className="rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          disabled={!title.trim() || !message.trim()}
          onClick={post}
        >
          Post
        </button>
      </div>
    </div>
  );
}

export default function UpdatesTab({ renovation }: { renovation: Renovation }) {
  const user = useAuthStore((s) => s.currentUser());
  const canPost = !!user && user.role !== 'viewer';

  const updates = [...(renovation.updates ?? [])].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  return (
    <div className="mx-auto max-w-[900px] px-6 py-5">
      <div className="rounded border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">
            💬 Project Updates{' '}
            <span className="font-medium normal-case text-text-4">
              ({updates.length})
            </span>
          </span>
          {canPost && <PostForm renovation={renovation} />}
        </div>

        {updates.length === 0 ? (
          <p className="text-[13px] text-text-3">No updates posted yet.</p>
        ) : (
          <div>
            {updates.map((u) => (
              <div
                key={u.id}
                className="mb-2.5 border-l-2 border-accent-soft py-1 pl-4"
              >
                <div className="flex items-center gap-2 text-[13px] font-bold text-text">
                  {u.title}
                  {u.phaseTag && (
                    <span className="rounded border border-purple bg-surface px-1.5 py-px text-[10px] uppercase text-purple">
                      Phase {u.phaseTag}
                    </span>
                  )}
                </div>
                <div className="my-0.5 text-[11px] text-text-3">
                  <strong>{u.authorName}</strong> · {ROLE_LABELS[u.authorRole]} ·
                  📅{' '}
                  {new Date(u.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-[12px] text-text-2">{u.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
