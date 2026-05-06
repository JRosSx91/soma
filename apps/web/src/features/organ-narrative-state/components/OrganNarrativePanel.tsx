import { useTranslation } from 'react-i18next';
import type { OrganNarrativeStateEntry } from '../types.js';

interface OrganNarrativePanelProps {
  entries: OrganNarrativeStateEntry[];
}

/**
 * Renders narrative descriptions of cellular and tissue-level
 * recovery processes for non-neural organs.
 *
 * Multiple substances can affect the same organ; each appears as
 * its own card with its own narrative text — the processes are
 * mechanistically distinct and shown separately.
 */
export function OrganNarrativePanel({ entries }: OrganNarrativePanelProps) {
  const { t } = useTranslation([
    'organ-narrative',
    'phases',
    'substances',
    'main',
  ]);

  if (entries.length === 0) {
    return (
      <p className="text-xs text-soma-fg-muted italic">
        {t('main:panel.noNarrativeData')}
      </p>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {entries.map((entry) => {
        const phaseLabel = t(`phases:${entry.phase}`);
        const sourceName = t(
          `substances:${entry.sourceSubstanceId}.name`,
          { defaultValue: entry.sourceSubstanceId },
        );
        const narrativeText = t(`organ-narrative:${entry.narrativeKey}`);

        return (
          <div
            key={`${entry.organId}:${entry.sourceSubstanceId}`}
            className="border border-soma-border-subtle rounded p-3 bg-soma-bg-base/40"
          >
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-soma-fg-primary text-sm capitalize">
                {sourceName}
              </p>
              <span className="text-[10px] uppercase tracking-wider text-soma-fg-muted">
                {phaseLabel}
              </span>
            </div>

            <p className="text-xs text-soma-fg-secondary leading-relaxed">
              {narrativeText}
            </p>
          </div>
        );
      })}
    </div>
  );
}