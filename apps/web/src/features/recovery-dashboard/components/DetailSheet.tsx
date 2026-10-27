import { useEffect, useId, useLayoutEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";

interface DetailSheetProps {
  title: string;
  /** Accessible name when the visible title must stay generic. */
  accessibleTitle?: string;
  panelClassName?: string;
  /** Wider, taller panel for long educational articles. */
  size?: "default" | "article";
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function focusableElements(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((node) => {
    if (node.closest("[hidden]")) return false;
    const details = node.closest("details");
    if (details && !details.open && node !== details.querySelector("summary")) {
      return false;
    }
    if (node.matches("input, select, textarea, button, a[href], summary")) return true;
    return node.getClientRects().length > 0;
  });
}

function readOpener(panel: HTMLElement | null): HTMLElement | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;
  if (active === document.body) return null;
  if (panel && (active === panel || panel.contains(active))) return null;
  return active;
}

function restoreOpener(opener: HTMLElement | null): void {
  if (opener?.isConnected) {
    opener.focus();
    return;
  }
  const main = document.querySelector("main");
  if (!(main instanceof HTMLElement)) return;
  if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
  main.focus();
}

/**
 * Shared catalog dialog. Header stays put; only the body scrolls.
 * Traps tab focus inside the panel and restores the opener on close.
 */
export function DetailSheet({
  title,
  accessibleTitle,
  panelClassName,
  size = "default",
  onClose,
  children,
}: DetailSheetProps) {
  const { t } = useTranslation("common");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => {
    openerRef.current = readOpener(panelRef.current);
    panelRef.current?.focus();

    function onFocusIn(event: FocusEvent) {
      const panel = panelRef.current;
      if (!panel) return;
      if (event.target instanceof Node && panel.contains(event.target)) return;
      const nodes = focusableElements(panel);
      (nodes[0] ?? panel).focus();
    }

    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      restoreOpener(openerRef.current);
    };
  }, []);

  function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCloseRef.current();
      return;
    }
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const nodes = focusableElements(panel);
    if (nodes.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || active === panel) {
        event.preventDefault();
        last?.focus();
      }
      return;
    }
    if (active === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#081018]/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className={`flex w-full flex-col rounded-2xl border border-soma-line bg-soma-surface p-5 shadow-[0_16px_40px_rgb(4_10_16/0.45)] outline-none ${
          size === "article"
            ? "max-h-[min(90vh,52rem)] max-w-lg sm:max-w-2xl"
            : "max-h-[min(85vh,46rem)] max-w-md"
        } ${panelClassName ?? ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-soma-ink">
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
            {t("close")}
          </button>
        </div>
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto text-sm leading-relaxed text-soma-ink-secondary">
          {children}
        </div>
      </div>
    </div>
  );
}
