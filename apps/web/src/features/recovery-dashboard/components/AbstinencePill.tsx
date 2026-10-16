import { Calendar, ChevronDown } from "lucide-react";
import { previewFocus } from "../focus.js";

interface AbstinencePillProps {
  label: string;
  className?: string;
}

/** Header control from the mockup. It does not open a history yet. */
export function AbstinencePill({ label, className }: AbstinencePillProps) {
  return (
    <button
      type="button"
      className={`${previewFocus} inline-flex items-center gap-2 rounded-xl border border-soma-line bg-soma-surface px-3 py-2 text-left text-sm text-soma-ink transition-colors hover:border-soma-line-strong hover:bg-soma-raised ${className ?? ""}`}
      title="El selector de sustancia se conectará más adelante"
    >
      <Calendar className="h-4 w-4 shrink-0 text-soma-action" aria-hidden="true" />
      <span className="min-w-0 leading-tight">{label}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />
    </button>
  );
}
