import { useTranslation } from "react-i18next";
import type {
  ComposedNTState,
  NeurotransmitterDirection,
  NeurotransmitterSeverity,
} from "../types.js";

interface NeurotransmitterPanelProps {
  entries: ComposedNTState[];
}

const SEVERITY_FILL: Record<NeurotransmitterSeverity, number> = {
  severe: 0.9,
  moderate: 0.6,
  mild: 0.3,
  normalizing: 0.15,
};

const DIRECTION_COLOR: Record<NeurotransmitterDirection, string> = {
  depleted: "bg-soma-danger",
  elevated: "bg-soma-warning",
  oscillating: "bg-soma-physiology",
  normalizing: "bg-soma-action",
};

const DIRECTION_TRACK: Record<NeurotransmitterDirection, string> = {
  depleted: "bg-soma-danger/20",
  elevated: "bg-soma-warning/20",
  oscillating: "bg-soma-physiology/20",
  normalizing: "bg-soma-action/20",
};

export function NeurotransmitterPanel({ entries }: NeurotransmitterPanelProps) {
  const { t } = useTranslation([
    "neurotransmitters",
    "neurotransmitter-phases",
    "phases",
    "substances",
    "main",
    "mechanisms",
  ]);

  if (entries.length === 0) {
    return (
      <p className="text-xs text-soma-ink-muted italic">
        {t("main:panel.noNeurotransmitterData")}
      </p>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {entries.map((entry) => {
        const fill = SEVERITY_FILL[entry.resultingSeverity];
        const fillClass = DIRECTION_COLOR[entry.resultingDirection];
        const trackClass = DIRECTION_TRACK[entry.resultingDirection];
        const ntName = t(`neurotransmitters:${entry.neurotransmitter}.name`);
        const symptomText = t(
          `neurotransmitter-phases:${entry.resultingSymptomKey}`,
        );
        const directionLabel = t(
          `main:panel.direction.${entry.resultingDirection}`,
        );
        const severityLabel = t(
          `main:panel.severity.${entry.resultingSeverity}`,
        );

        const sourceNames = entry.sources
          .map((s) =>
            t(`substances:${s.substanceId}.name`, {
              defaultValue: s.substanceId,
            }),
          )
          .join(", ");

        const multiSource = entry.sources.length > 1;

        return (
          <div
            key={`${entry.organId}:${entry.neurotransmitter}`}
            className="border border-soma-line rounded p-3 bg-soma-canvas/40"
          >
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-soma-ink text-sm">{ntName}</p>
              {multiSource && (
                <span className="text-[10px] uppercase tracking-wider text-soma-physiology">
                  {t("main:panel.multiSource")}
                </span>
              )}
            </div>
            <div
              className={`relative h-1.5 rounded-full overflow-hidden ${trackClass}`}
            >
              <div
                className={`h-full ${fillClass} transition-all duration-500`}
                style={{ width: `${fill * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-soma-ink-secondary mt-2">
              <span className="capitalize">{directionLabel}</span>
              {", "}
              <span>{severityLabel}</span>
            </p>
            <p className="text-[11px] text-soma-ink-muted mt-1">
              {t("main:panel.causedBy")}:{" "}
              <span className="text-soma-ink-secondary">{sourceNames}</span>
            </p>
            {multiSource && (
              <div className="mt-2 space-y-1">
                {entry.sources.map((s) => (
                  <p
                    key={s.substanceId}
                    className="text-[10px] text-soma-ink-muted"
                  >
                    <span className="text-soma-ink-secondary">
                      {t(`substances:${s.substanceId}.name`, {
                        defaultValue: s.substanceId,
                      })}
                    </span>
                    {s.mechanismKey && (
                      <span className="ml-1 opacity-60">
                        (
                        {t(`mechanisms:${s.mechanismKey}`, {
                          defaultValue: s.mechanismKey,
                        })}
                        )
                      </span>
                    )}
                    {" — "}
                    {t(`main:panel.direction.${s.direction}`)},{" "}
                    {t(`main:panel.severity.${s.severity}`)}
                  </p>
                ))}
              </div>
            )}
            <p className="text-xs text-soma-ink-secondary mt-2 leading-relaxed">
              {symptomText}
            </p>
          </div>
        );
      })}
    </div>
  );
}
