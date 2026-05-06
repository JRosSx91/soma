import { useTranslation } from 'react-i18next';
import type {
  NeurotransmitterStateEntry,
  NeurotransmitterDirection,
  NeurotransmitterSeverity,
} from '../types.js';

interface NeurotransmitterPanelProps {
  entries: NeurotransmitterStateEntry[];
}

/**
 * Maps severity to a fill percentage for the meter bar.
 * Visual heuristic only — these numbers don't represent measured
 * neurotransmitter levels. Severe = a lot of imbalance, mild = a
 * little. Normalizing renders as a low fill, intentionally muted.
 */
const SEVERITY_FILL: Record<NeurotransmitterSeverity, number> = {
  severe: 0.9,
  moderate: 0.6,
  mild: 0.3,
  normalizing: 0.15,
};

/**
 * Maps direction to a color class. Tailwind classes are used directly
 * because we want explicit visual semantics:
 *   depleted    → muted red (something is missing)
 *   elevated    → amber (something is excessive)
 *   oscillating → violet (irregular rhythm)
 *   normalizing → muted green (returning to baseline)
 */
const DIRECTION_COLOR: Record<NeurotransmitterDirection, string> = {
  depleted: 'bg-red-700/70',
  elevated: 'bg-amber-600/70',
  oscillating: 'bg-violet-600/70',
  normalizing: 'bg-emerald-700/60',
};

const DIRECTION_TRACK: Record<NeurotransmitterDirection, string> = {
  depleted: 'bg-red-950/40',
  elevated: 'bg-amber-950/40',
  oscillating: 'bg-violet-950/40',
  normalizing: 'bg-emerald-950/40',
};

export function NeurotransmitterPanel({ entries }: NeurotransmitterPanelProps) {
  const { t } = useTranslation([
    'neurotransmitters',
    'neurotransmitter-phases',
    'phases',
    'substances',
    'main',
  ]);

  if (entries.length === 0) {
    return (
      <p className="text-xs text-soma-fg-muted italic">
        {t('main:panel.noNeurotransmitterData')}
      </p>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {entries.map((entry) => {
        const fill = SEVERITY_FILL[entry.severity];
        const fillClass = DIRECTION_COLOR[entry.direction];
        const trackClass = DIRECTION_TRACK[entry.direction];
        const ntName = t(`neurotransmitters:${entry.neurotransmitter}.name`);
        const phaseLabel = t(`phases:${entry.phase}`);
        const symptomText = t(`neurotransmitter-phases:${entry.symptomKey}`);
        const sourceName = t(
          `substances:${entry.sourceSubstanceId}.name`,
          { defaultValue: entry.sourceSubstanceId },
        );
        const directionLabel = t(`main:panel.direction.${entry.direction}`);
        const severityLabel = t(`main:panel.severity.${entry.severity}`);

        return (
          <div
            key={`${entry.organId}:${entry.neurotransmitter}`}
            className="border border-soma-border-subtle rounded p-3 bg-soma-bg-base/40"
          >
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-soma-fg-primary text-sm">{ntName}</p>
              <span className="text-[10px] uppercase tracking-wider text-soma-fg-muted">
                {phaseLabel}
              </span>
            </div>

            <div className={`relative h-1.5 rounded-full overflow-hidden ${trackClass}`}>
              <div
                className={`h-full ${fillClass} transition-all duration-500`}
                style={{ width: `${fill * 100}%` }}
              />
            </div>

            <p className="text-[11px] text-soma-fg-secondary mt-2">
              <span className="capitalize">{directionLabel}</span>
              {', '}
              <span>{severityLabel}</span>
            </p>

            <p className="text-[11px] text-soma-fg-muted mt-1">
              {t('main:panel.causedBy')}:{' '}
              <span className="text-soma-fg-secondary">{sourceName}</span>
            </p>

            <p className="text-xs text-soma-fg-secondary mt-2 leading-relaxed">
              {symptomText}
            </p>
          </div>
        );
      })}
    </div>
  );
}