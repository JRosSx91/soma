import { useTranslation } from 'react-i18next';
import { TrophyCard } from './TrophyCard.js';
import type { AchievementWithUnlockState, AchievementTier } from '../types.js';

interface SubstanceTrophyGroupProps {
  substanceId: string;
  achievements: AchievementWithUnlockState[];
}

const TIER_ORDER: Record<AchievementTier, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
};

/**
 * Renders all achievements for a single substance. Sorts by tier
 * ascending (bronze first), and within tier by threshold ascending
 * so progression reads naturally top-to-bottom.
 */
export function SubstanceTrophyGroup({
  substanceId,
  achievements,
}: SubstanceTrophyGroupProps) {
  const { t } = useTranslation(['main', 'substances']);

  const sorted = [...achievements].sort((a, b) => {
    const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    if (tierDiff !== 0) return tierDiff;
    return a.triggerRecoveryThreshold - b.triggerRecoveryThreshold;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const total = achievements.length;
  const substanceName = t(`substances:${substanceId}.name`, {
    defaultValue: substanceId,
  });

  return (
    <section className="mb-10">
      <header className="flex items-baseline justify-between mb-4 pb-2 border-b border-soma-border-subtle">
        <h2 className="text-lg font-light tracking-wide capitalize">
          {substanceName}
        </h2>
        <span className="text-xs text-soma-fg-muted tabular-nums">
          {t('main:trophies.unlockedRatio', {
            unlocked: unlockedCount,
            total,
          })}
        </span>
      </header>

      <div className="space-y-2">
        {sorted.map((achievement) => (
          <TrophyCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </section>
  );
}