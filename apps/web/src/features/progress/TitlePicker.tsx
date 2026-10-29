import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Lock } from "lucide-react";
import { PROGRESS_TITLES, type ProgressTitleId } from "@soma/shared-types";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../recovery-dashboard/focus.js";
import { TitleEmblem } from "./TitleEmblem.js";
import type { ProgressView } from "./progress-model.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function focusableElements(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((node) => {
    if (node.closest("[hidden]")) return false;
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

export interface TitlePickerProps {
  progress: ProgressView;
  updatingTitle: boolean;
  equipError: string | null;
  onClose: () => void;
  onEquip: (titleId: ProgressTitleId) => Promise<void>;
}

/**
 * Catalog title selector. Catalog order, catalog ids, no extra rewards.
 * LIVE callers must wait for PATCH; this picker never optimistic-swaps the title.
 */
export function TitlePicker({
  progress,
  updatingTitle,
  equipError,
  onClose,
  onEquip,
}: TitlePickerProps) {
  const { t } = useTranslation(["progress", "common"]);
  const titleId = useId();
  const errorId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const openerRef = useRef<HTMLElement | null>(null);
  const inflightRef = useRef(false);
  const [pendingId, setPendingId] = useState<ProgressTitleId | null>(null);
  const [failedId, setFailedId] = useState<ProgressTitleId | null>(null);

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
      if (updatingTitle || inflightRef.current) return;
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

  async function selectTitle(nextId: ProgressTitleId) {
    if (nextId === progress.equippedTitleId) return;
    if (!progress.unlockedTitleIds.includes(nextId)) return;
    if (updatingTitle || inflightRef.current) return;
    inflightRef.current = true;
    setPendingId(nextId);
    setFailedId(null);
    try {
      await onEquip(nextId);
      onCloseRef.current();
    } catch {
      inflightRef.current = false;
      setPendingId(null);
      setFailedId(nextId);
    }
  }

  const busy = updatingTitle || pendingId !== null;
  const saveFailed = Boolean(equipError) && !busy;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center overflow-x-hidden bg-[#081018]/70 p-4 sm:items-center"
      onClick={() => {
        if (busy) return;
        onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
        aria-describedby={saveFailed ? errorId : undefined}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[min(90vh,52rem)] w-full max-w-[min(100%,48rem)] flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-surface p-5 shadow-[0_16px_40px_rgb(4_10_16/0.45)] outline-none"
      >
        <div className="flex shrink-0 items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-soma-ink">
            {t("progress:changeTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`${previewFocus} shrink-0 rounded-lg px-2 py-1 text-sm text-soma-ink-secondary hover:bg-soma-raised hover:text-soma-ink disabled:opacity-60`}
          >
            {t("common:close")}
          </button>
        </div>
        {saveFailed ? (
          <div
            id={errorId}
            role="alert"
            className="mt-3 flex flex-wrap items-center gap-2 text-sm text-soma-danger"
          >
            <p>{t("progress:saveError")}</p>
            {failedId ? (
              <button
                type="button"
                className={`${previewFocus} text-soma-action hover:text-soma-action-hover`}
                onClick={() => {
                  void selectTitle(failedId);
                }}
              >
                {t("progress:retry")}
              </button>
            ) : null}
          </div>
        ) : null}
        {busy ? <p className="sr-only">{t("progress:updatingTitle")}</p> : null}
        <ul className="mt-3 grid min-h-0 grid-cols-1 gap-3 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable] sm:grid-cols-2 lg:grid-cols-3">
          {PROGRESS_TITLES.map((row) => {
            const equipped = row.id === progress.equippedTitleId;
            const unlocked = progress.unlockedTitleIds.includes(row.id);
            const locked = !unlocked;
            const name = t(`progress:titles.${row.id}`);
            const status = equipped
              ? t("progress:equipped")
              : locked
                ? t("progress:titleLocked")
                : t("progress:titleUnlocked");
            return (
              <li key={row.id} className="min-w-0">
                <button
                  type="button"
                  data-title-id={row.id}
                  aria-pressed={equipped}
                  aria-disabled={locked || busy || undefined}
                  disabled={locked || busy}
                  onClick={() => {
                    void selectTitle(row.id);
                  }}
                  className={`${previewFocus} flex h-full w-full min-w-0 flex-col items-center rounded-xl border px-3 py-4 text-center disabled:cursor-not-allowed ${
                    equipped
                      ? "border-soma-action bg-soma-raised"
                      : locked
                        ? "border-soma-line bg-soma-surface"
                        : "border-soma-line bg-soma-surface hover:border-soma-action/50 hover:bg-soma-raised"
                  }`}
                >
                  <span className={locked ? "brightness-[0.72] saturate-[0.45]" : undefined}>
                    <span className="inline-flex sm:hidden">
                      <TitleEmblem titleId={row.id} size={80} />
                    </span>
                    <span className="hidden sm:inline-flex">
                      <TitleEmblem titleId={row.id} size={128} />
                    </span>
                  </span>
                  <span className="mt-2 text-sm font-semibold leading-snug text-soma-ink">{name}</span>
                  <span className="mt-1 text-[11px] leading-snug text-soma-ink-secondary">{status}</span>
                  {locked ? (
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-soma-ink-muted">
                      <Lock className="h-3 w-3" aria-hidden="true" />
                      {t("progress:levelRequired", { level: row.minLevel })}
                    </span>
                  ) : equipped ? null : (
                    <span className="mt-1 text-[11px] text-soma-action">{t("progress:equip")}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
