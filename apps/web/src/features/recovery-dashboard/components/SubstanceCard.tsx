import { ChevronRight } from "lucide-react";
import type { DemoSubstance } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { SubstanceIllustration } from "./SubstanceIllustration.js";

interface SubstanceCardProps {
  substance: DemoSubstance;
  selected: boolean;
  onSelect: (id: string) => void;
}

/** Supporting copy for states without a day count. Dated cards omit model ceilings. */
function substanceCardSupport(substance: DemoSubstance): string | null {
  if (/\d/.test(substance.abstinence)) return null;
  const phase = substance.phase.trim();
  return phase.length > 0 ? phase : null;
}

export function SubstanceCard({
  substance,
  selected,
  onSelect,
}: SubstanceCardProps) {
  const support = substanceCardSupport(substance);
  const accessibleName = support
    ? `${substance.name}. ${substance.abstinence}. ${support}`
    : `${substance.name}. ${substance.abstinence}.`;

  return (
    <button
      type="button"
      onClick={() => onSelect(substance.id)}
      aria-pressed={selected}
      aria-label={accessibleName}
      className={`${previewFocus} flex h-full w-full min-w-0 flex-col rounded-2xl border bg-soma-surface/90 px-3 py-3 text-left transition-colors hover:border-soma-line-strong hover:bg-soma-raised/60 ${
        selected
          ? "border-soma-action/80"
          : "border-soma-line"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soma-canvas p-0.5 text-soma-action">
          <SubstanceIllustration name={substance.id} iconClassName="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 text-sm font-medium leading-snug text-soma-ink">
          {substance.name}
        </span>
      </span>
      <span className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-soma-ink sm:text-4xl">
        {substance.abstinence}
      </span>
      {support ? (
        <span className="mt-2 text-xs leading-snug text-soma-ink-muted">{support}</span>
      ) : null}
      <span className="mt-auto flex justify-end pt-2">
        <ChevronRight className="h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />
      </span>
    </button>
  );
}
