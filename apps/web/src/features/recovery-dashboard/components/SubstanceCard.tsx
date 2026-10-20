import { ChevronRight } from "lucide-react";
import type { DemoSubstance } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { SubstanceIllustration } from "./SubstanceIllustration.js";

interface SubstanceCardProps {
  substance: DemoSubstance;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function SubstanceCard({
  substance,
  selected,
  onSelect,
}: SubstanceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(substance.id)}
      aria-pressed={selected}
      className={`${previewFocus} flex h-full w-full min-w-0 flex-col rounded-2xl border bg-soma-surface/90 px-3 py-2.5 text-left transition-colors hover:border-soma-line-strong hover:bg-soma-raised/60 ${
        selected
          ? "border-soma-action/80"
          : "border-soma-line"
      }`}
    >
      <span className="flex shrink-0 items-start justify-between gap-3">
        <span className="flex min-w-0 items-start gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soma-canvas p-0.5 text-soma-action">
            <SubstanceIllustration name={substance.id} iconClassName="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 pt-1 text-xs leading-snug text-soma-ink-secondary">
            {substance.name}
          </span>
        </span>
        <span className="shrink-0 text-xl font-semibold tabular-nums tracking-tight text-soma-ink">
          {substance.abstinence}
        </span>
      </span>
      <span
        className="mt-2 h-1 shrink-0 overflow-hidden rounded-full bg-soma-line"
        aria-hidden="true"
      >
        <span
          className="block h-full rounded-full bg-soma-action"
          style={{ width: `${Math.round(substance.bar * 100)}%` }}
        />
      </span>
      <span className="mt-auto flex items-end justify-between gap-2 pt-1.5">
        <span className="min-w-0 text-xs leading-snug text-soma-ink-muted">
          {substance.phase}
        </span>
        <ChevronRight className="mb-px h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />
      </span>
    </button>
  );
}
