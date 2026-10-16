import type { DemoSubstance } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { SubstanceIllustration } from "./SubstanceIllustration.js";

interface SubstanceChipProps {
  substance: DemoSubstance;
  selected: boolean;
  onSelect: (id: string) => void;
}

/** Compact substance control used in the mobile composition. */
export function SubstanceChip({
  substance,
  selected,
  onSelect,
}: SubstanceChipProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(substance.id)}
      aria-pressed={selected}
      className={`${previewFocus} flex min-w-[4.5rem] flex-col items-center gap-1.5 rounded-2xl px-2 py-1 text-soma-ink`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full border ${
          selected
            ? "border-soma-action bg-soma-action/15 text-soma-action"
            : "border-soma-line bg-soma-surface text-soma-ink-secondary"
        }`}
      >
        <SubstanceIllustration
          name={substance.id}
          className="h-10 w-10"
          iconClassName="h-5 w-5"
        />
      </span>
      <span className="text-xs text-soma-ink-secondary">{substance.abstinence}</span>
    </button>
  );
}
