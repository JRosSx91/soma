import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { previewFocus } from "../focus.js";

interface DetailSheetProps {
  title: string;
  /** Accessible name when the visible title must stay generic. */
  accessibleTitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function DetailSheet({ title, accessibleTitle, onClose, children }: DetailSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#081018]/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-detail-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-soma-line bg-soma-surface p-5 shadow-[0_16px_40px_rgb(4_10_16/0.45)] outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="preview-detail-title" className="text-lg font-semibold text-soma-ink">
            {accessibleTitle ? (
              <>
                <span className="sr-only">{accessibleTitle}</span>
                <span aria-hidden="true">{title}</span>
              </>
            ) : (
              title
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`${previewFocus} shrink-0 rounded-lg px-2 py-1 text-sm text-soma-ink-secondary hover:bg-soma-raised hover:text-soma-ink`}
          >
            Cerrar
          </button>
        </div>
        <div className="mt-3 text-sm leading-relaxed text-soma-ink-secondary">{children}</div>
      </div>
    </div>
  );
}
