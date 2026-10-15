import { ChevronRight, Cigarette, Leaf, Mountain } from "lucide-react";
import type { DemoSubstance } from "../demo-data.js";
import { previewFocus } from "../focus.js";

interface SubstanceCardProps {
  substance: DemoSubstance;
  selected: boolean;
  onSelect: (id: string) => void;
}

const icons = {
  cannabis: Leaf,
  nicotine: Cigarette,
  cocaine: Mountain,
} as const;

export function SubstanceCard({
  substance,
  selected,
  onSelect,
}: SubstanceCardProps) {
  const Icon = icons[substance.id as keyof typeof icons] ?? Leaf;

  return (
    <button
      type="button"
      onClick={() => onSelect(substance.id)}
      aria-pressed={selected}
      className={`${previewFocus} flex h-full flex-col rounded-2xl border bg-soma-surface/90 px-3 py-2.5 text-left transition-colors hover:border-soma-line-strong hover:bg-soma-raised/60 ${
        selected
          ? "border-soma-action/80"
          : "border-soma-line"
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soma-canvas text-soma-action">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs text-soma-ink-secondary">{substance.name}</span>
        </span>
        <span className="shrink-0 text-xl font-semibold tracking-tight text-soma-ink">
          {substance.abstinence}
        </span>
      </span>
      <span
        className="mt-2 h-1 overflow-hidden rounded-full bg-soma-line"
        aria-hidden="true"
      >
        <span
          className="block h-full rounded-full bg-soma-action"
          style={{ width: `${Math.round(substance.bar * 100)}%` }}
        />
      </span>
      <span className="mt-1.5 flex items-end justify-between gap-2">
        <span className="text-xs leading-snug text-soma-ink-muted">
          {substance.phase}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />
      </span>
    </button>
  );
}
