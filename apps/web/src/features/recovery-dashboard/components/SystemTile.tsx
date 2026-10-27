import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import type { DemoOrganIcon, DemoSystem } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { AnatomyIllustration } from "./AnatomyIllustration.js";

/** Narrow plates (heart, gut) sit a little taller so their silhouettes match the wider ones. */
const illustrationClass: Record<DemoOrganIcon, string> = {
  brain: "h-10 w-auto max-w-full",
  lungs: "h-10 w-auto max-w-full",
  heart: "h-12 w-auto max-w-full",
  digestive: "h-12 w-auto max-w-full",
  endocrine: "h-11 w-auto max-w-full",
  immune: "h-9 w-auto max-w-full",
};

interface SystemTileProps {
  system: DemoSystem;
  selected?: boolean;
  onSelect?: (id: string) => void;
  /** When true, the percentage is a live catalog estimate, not demo copy. */
  live?: boolean;
}

export function SystemTile({
  system,
  selected = false,
  onSelect,
  live = false,
}: SystemTileProps) {
  const { t } = useTranslation("recovery");
  const interactive = Boolean(onSelect);
  const className = `flex h-full w-full min-w-0 flex-col items-start rounded-2xl border bg-soma-surface/90 p-3 text-left transition-colors hover:border-soma-line-strong hover:bg-soma-raised/50 sm:flex-row sm:items-center sm:gap-3 sm:p-4 ${
    selected ? "border-soma-action/80" : "border-soma-line-strong"
  }`;
  const body = (
    <>
      <span className="flex h-14 w-full items-center justify-center sm:h-16 sm:w-16 sm:shrink-0">
        <AnatomyIllustration
          name={system.icon}
          alt=""
          loading="lazy"
          className={illustrationClass[system.icon]}
        />
      </span>
      <span className="mt-3 min-w-0 flex-1 sm:mt-0">
        <span className="block text-sm font-medium leading-tight text-soma-ink">
          {system.name}
        </span>
        {system.endLabel ? (
          <>
            <span className="mt-1 text-lg font-semibold tabular-nums text-soma-ink">
              <span className="sr-only">
                {live
                  ? `${t("trajectoryProgressSr")}. ${t("trajectoryProgressShort")}: `
                  : t("estimateSrDemo")}
              </span>
              {system.endLabel}
            </span>
            {!live ? (
              <span className="mt-0.5 block max-w-full text-[10px] leading-snug text-soma-ink-muted">
                {t("day365")}
              </span>
            ) : null}
          </>
        ) : system.statusLabel ? (
          <span className="mt-1 text-xs font-medium leading-snug text-soma-ink sm:text-sm">
            {system.statusLabel}
          </span>
        ) : null}
        {system.hint ? (
          <span className="mt-1 block text-[10px] leading-snug text-soma-ink-muted sm:text-xs">
            {system.hint}
          </span>
        ) : live && system.endLabel ? (
          <span className="mt-1 block text-[10px] leading-snug text-soma-ink-muted sm:text-xs">
            {t("recoveryTrajectoryHint")}
          </span>
        ) : null}
      </span>
      <ChevronRight className="mt-2 hidden h-4 w-4 shrink-0 text-soma-ink-muted sm:mt-0 sm:block" aria-hidden="true" />
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(system.id)}
        aria-pressed={selected}
        className={`${previewFocus} ${className}`}
      >
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}
