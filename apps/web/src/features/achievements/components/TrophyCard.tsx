import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrophyIcon } from './TrophyIcon.js';
import type { AchievementWithUnlockState } from '../types.js';

interface TrophyCardProps {
  achievement: AchievementWithUnlockState;
}

export function TrophyCard({ achievement }: TrophyCardProps) {
  const { t, i18n } = useTranslation(['achievements', 'main', 'organs']);
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

  // Format the unlock date in the user's locale.
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
          <p className="text-[11px] text-soma-fg-muted mt-0.5">
            {achievement.unlocked && unlockedDate
              ? t('main:trophies.unlockedOn', { date: unlockedDate })
              : isHidden
                ? t('main:trophies.hiddenHint')
                : t('main:trophies.lockedHint', {
                    organ: organName,
                    percent: thresholdPercent,
                  })}
          </p>
        </div>
        <span
          className="text-soma-fg-muted text-xs"
          aria-hidden="true"
        >
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