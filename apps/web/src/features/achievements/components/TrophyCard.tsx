import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrophyIcon } from './TrophyIcon.js';
import type { AchievementWithUnlockState } from '../types.js';

interface TrophyCardProps {
  achievement: AchievementWithUnlockState;
  /**
   * Whether the substance this trophy belongs to is in active
   * consumption. When true (and the trophy is locked), the hint
   * tells the user this is unreachable until they stop consuming,
   * rather than showing the usual recovery threshold.
   */
  substanceActive?: boolean;
}

export function TrophyCard({
  achievement,
  substanceActive = false,
}: TrophyCardProps) {
  const { t, i18n } = useTranslation(['achievements', 'main', 'organs', 'substances']);
  const [expanded, setExpanded] = useState(false);

  // A trophy is "hidden from the user's perspective" only when it's
  // both flagged as hidden and not yet unlocked. Once unlocked, the
  // full text is revealed regardless.
  const isHidden = achievement.hidden && !achievement.unlocked;

  const title = isHidden
    ? t('achievements:hidden.title')
    : t(`achievements:${achievement.titleKey}`);

  const description = isHidden
    ? t('achievements:hidden.description')
    : t(`achievements:${achievement.descriptionKey}`);

  const organName = t(`organs:${achievement.triggerOrganId}`, {
    defaultValue: achievement.triggerOrganId,
  });

  const substanceName = t(`substances:${achievement.triggerSubstanceId}.name`, {
    defaultValue: achievement.triggerSubstanceId,
  });

  const unlockedDate = achievement.unlockedAt
    ? new Date(achievement.unlockedAt).toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const thresholdPercent = Math.round(
    achievement.triggerRecoveryThreshold * 100,
  );

  // Hint text logic:
  // - Unlocked → show date.
  // - Hidden → show "hidden" placeholder.
  // - Locked + substance in active consumption → "available when you
  //   stop using X" (priorities take precedence over the percent hint).
  // - Otherwise → standard "reach X% in <organ>" hint.
  const hint = achievement.unlocked && unlockedDate
    ? t('main:trophies.unlockedOn', { date: unlockedDate })
    : isHidden
      ? t('main:trophies.hiddenHint')
      : substanceActive
        ? t('main:trophies.activeSubstanceHint', { substance: substanceName })
        : t('main:trophies.lockedHint', {
            organ: organName,
            percent: thresholdPercent,
          });

  return (
    <div
      className={`border rounded transition-colors ${
        achievement.unlocked
          ? 'border-soma-border-subtle bg-soma-bg-surface'
          : 'border-soma-border-subtle/40 bg-soma-bg-surface/30'
      }`}
    >
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-4 p-3 text-left hover:bg-soma-bg-base/40 transition-colors rounded"
        aria-expanded={expanded}
      >
        <TrophyIcon
          tier={achievement.tier}
          unlocked={achievement.unlocked}
          size={48}
        />
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm ${
              achievement.unlocked
                ? 'text-soma-fg-primary'
                : 'text-soma-fg-muted'
            }`}
          >
            {title}
          </p>
          <p className="text-[11px] text-soma-fg-muted mt-0.5">{hint}</p>
        </div>
        <span className="text-soma-fg-muted text-xs" aria-hidden="true">
          {expanded ? '▴' : '▾'}
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-4 pt-1 text-xs text-soma-fg-secondary leading-relaxed border-t border-soma-border-subtle/40">
          {description}
        </div>
      )}
    </div>
  );
}