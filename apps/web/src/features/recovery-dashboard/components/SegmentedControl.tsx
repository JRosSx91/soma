import { previewFocus } from "../focus.js";

interface SegmentedOption<T extends string> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={`${previewFocus} shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
              selected
                ? "bg-soma-action text-[#081018]"
                : "bg-soma-surface text-soma-ink-secondary hover:bg-soma-raised hover:text-soma-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
