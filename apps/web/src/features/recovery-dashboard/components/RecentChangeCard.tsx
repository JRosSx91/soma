import { useTranslation } from "react-i18next";
import type { DemoChange } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { AnatomyIllustration } from "./AnatomyIllustration.js";

interface RecentChangeCardProps {
  change: DemoChange;
  featured?: boolean;
  onOpen?: () => void;
  /** When true, the percentage is a live catalog estimate, not demo copy. */
  live?: boolean;
}

export function RecentChangeCard({
  change,
  featured = false,
  onOpen,
  live = false,
}: RecentChangeCardProps) {
  const { t } = useTranslation("recovery");
  const estimateSr = live ? t("estimateSrLive") : t("estimateSrDemo");
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${previewFocus} grid w-full overflow-hidden rounded-2xl border border-soma-line bg-soma-surface text-left transition-colors hover:border-soma-line-strong hover:bg-soma-raised/40 ${
        featured
          ? "grid-cols-[5.5rem_minmax(0,1fr)]"
          : "grid-cols-[5.25rem_minmax(0,1fr)]"
      }`}
    >
      <span className="flex h-full items-center justify-center px-1 py-1.5">
        <AnatomyIllustration
          name={change.icon}
          alt=""
          loading={featured ? "lazy" : "eager"}
          className={featured ? "h-24 w-full" : "h-[4.5rem] w-full"}
        />
      </span>
      <span className={`flex min-w-0 flex-col ${featured ? "p-3 sm:p-4" : "p-2.5"}`}>
        {featured ? (
          <>
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-soma-ink-muted">
              {change.system}
            </span>
            <span className="mt-1 flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-soma-ink">{change.title}</span>
              <span className="text-soma-ink-muted" aria-hidden="true">
                ›
              </span>
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-xs text-soma-action">
              <span className="h-1.5 w-1.5 rounded-full bg-soma-action" aria-hidden="true" />
              {change.status}
            </span>
            <span className="mt-2 text-xs leading-relaxed text-soma-ink-secondary">
              {change.body}
            </span>
            <span className="mt-3 text-right text-sm font-medium tabular-nums text-soma-ink">
              <span className="sr-only">{estimateSr}</span>
              {change.endLabel}
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-soma-ink-muted">
                {change.system}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-soma-action">
                <span className="h-1.5 w-1.5 rounded-full bg-soma-action" aria-hidden="true" />
                {change.status}
              </span>
            </span>
            <span className="mt-1 flex items-start justify-between gap-2">
              <span className="text-sm font-semibold leading-snug text-soma-ink">{change.title}</span>
              <span className="shrink-0 text-sm font-medium tabular-nums text-soma-ink">
                <span className="sr-only">{estimateSr}</span>
                {change.endLabel}
              </span>
            </span>
            <span className="mt-1 text-xs leading-snug text-soma-ink-secondary">
              {change.body}
            </span>
          </>
        )}
      </span>
    </button>
  );
}
