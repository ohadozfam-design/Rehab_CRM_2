import type { ReactNode } from 'react';
import { X } from 'lucide-react';

/** Reusable centered modal with a scrim, header, scrollable body, and footer. */
export default function Modal({
  title,
  onClose,
  children,
  footer,
  maxWidth = 640,
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(15, 23, 42, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-[15px] font-bold text-text">{title}</h3>
          <button
            className="rounded-md p-1 text-text-3 transition-colors hover:bg-surface-2 hover:text-text"
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-2 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
