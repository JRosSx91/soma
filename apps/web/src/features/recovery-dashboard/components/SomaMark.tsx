interface SomaMarkProps {
  className?: string;
  /** Hide the wordmark when the desktop sidebar is icon-only. */
  compact?: boolean;
  /** App-shell lockup: Soma + EXPEDITIONS. Landing/auth keep the short mark. */
  expeditions?: boolean;
}

/** Wordmark used in the preview chrome. The waveform is original artwork. */
export function SomaMark({
  className,
  compact = false,
  expeditions = false,
}: SomaMarkProps) {
  const label = expeditions ? "Soma Expeditions" : "soma";

  return (
    <span
      className={`inline-flex items-center gap-2 ${className ?? ""}`}
      aria-label={label}
    >
      <svg
        viewBox="0 0 28 16"
        aria-hidden="true"
        className="h-4 w-7"
        style={{ color: "rgb(var(--soma-shell-accent))" }}
        fill="none"
      >
        <path
          d="M1 9.5 C4 9.5 4.5 9.5 6 9.5 C8 9.5 8.2 3 10.2 3 C12.2 3 12.4 13 14.6 13 C16.6 13 16.8 7 18.4 7 C20 7 20.4 9.5 22 9.5 H27"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`min-w-0 leading-none ${compact ? "lg:hidden" : ""}`}
      >
        {expeditions ? (
          <>
            <span
              className="block text-lg font-semibold tracking-tight"
              style={{ color: "rgb(var(--soma-shell-accent))" }}
            >
              Soma
            </span>
            <span
              className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.28em]"
              style={{ color: "rgb(var(--soma-shell-accent))" }}
            >
              Expeditions
            </span>
          </>
        ) : (
          <span className="text-lg font-semibold tracking-tight text-soma-ink">
            soma
          </span>
        )}
      </span>
    </span>
  );
}
