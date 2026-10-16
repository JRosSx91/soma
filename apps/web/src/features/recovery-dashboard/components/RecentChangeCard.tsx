import type { DemoChange } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { OrganGlyph } from "./OrganGlyph.js";

interface RecentChangeCardProps {
  change: DemoChange;
  featured?: boolean;
}

export function RecentChangeCard({ change, featured = false }: RecentChangeCardProps) {
  return (
    <button
      type="button"
      className={`${previewFocus} grid w-full overflow-hidden rounded-2xl border border-soma-line bg-soma-surface text-left transition-colors hover:border-soma-line-strong hover:bg-soma-raised/40 ${
        featured
          ? "grid-cols-[5.5rem_minmax(0,1fr)]"
          : "grid-cols-[5.25rem_minmax(0,1fr)]"
      }`}
    >
      <span className="flex items-center justify-center bg-gradient-to-b from-soma-physiology/25 to-soma-canvas text-soma-physiology">
        <OrganGlyph icon={change.icon} className={featured ? "h-10 w-10" : "h-9 w-9"} />
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
              <span className="sr-only">Estimación de demostración </span>
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
                <span className="sr-only">Estimación de demostración </span>
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
