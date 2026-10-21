import { useTranslation } from "react-i18next";
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
  return (
    <button
      type="button"
      onClick={onSelect ? () => onSelect(system.id) : undefined}
      aria-pressed={onSelect ? selected : undefined}
      className={`${previewFocus} flex w-28 shrink-0 flex-col items-start rounded-2xl border bg-soma-surface/90 p-3 text-left transition-colors hover:border-soma-line-strong hover:bg-soma-raised/50 sm:w-36 sm:p-4 lg:w-full lg:p-2.5 xl:p-2 ${
        selected ? "border-soma-action/80" : "border-soma-line"
      }`}
    >
      <span className="flex h-12 w-full items-center justify-center">
        <AnatomyIllustration
          name={system.icon}
          alt=""
          loading="lazy"
          className={illustrationClass[system.icon]}
        />
      </span>
      <span className="mt-3 text-xs leading-tight text-soma-ink-secondary sm:text-sm lg:mt-2 xl:mt-1.5">
        {system.name}
      </span>
      <span className="mt-1 text-sm font-semibold tabular-nums text-soma-ink">
        <span className="sr-only">
          {live
            ? `${t("trajectoryProgressSr")}. ${t("trajectoryProgressShort")}: `
            : t("estimateSrDemo")}
        </span>
        {system.endLabel}
      </span>
    </button>
  );
}
