import { useTranslation } from 'react-i18next';
import { TrophyIcon } from './TrophyIcon.js';
import type { AchievementTier, AchievementWithUnlockState } from '../types.js';

interface TrophyToastProps {
  achievement: AchievementWithUnlockState;
  onDismiss: () => void;
}

const TIER_ACCENT: Record<AchievementTier, { rail: string; glow: string }> = {
  bronze:   { rail: '#CD7F32', glow: 'rgba(205, 127, 50, 0.18)' },
  silver:   { rail: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.18)' },
  gold:     { rail: '#FFD700', glow: 'rgba(255, 215, 0, 0.22)' },
  platinum: { rail: '#E5E4E2', glow: 'rgba(229, 228, 226, 0.28)' },
};

export function TrophyToast({ achievement, onDismiss }: TrophyToastProps) {
  const { t } = useTranslation(['achievements', 'main']);

  const title = t(`achievements:${achievement.titleKey}`);
  const description = t(`achievements:${achievement.descriptionKey}`);

  const { rail, glow } = TIER_ACCENT[achievement.tier];

  return (
    <div
      className="
        flex items-start gap-3 p-3 pl-4
        bg-soma-bg-elevated border border-soma-border-subtle
        rounded
        animate-trophy-toast-in
        w-full max-w-sm
        relative
      "
      style={{
        boxShadow: `0 4px 16px ${glow}, 0 0 0 1px rgba(255,255,255,0.02)`,
      }}
      role="status"
      aria-live="polite"
    >
      {/* Tier rail — absolute, edge to edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: rail }}
        aria-hidden="true"
      />

      <TrophyIcon
        tier={achievement.tier}
        unlocked={true}
        size={44}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-soma-fg-muted leading-tight">
          {t('main:trophies.toastEyebrow')}
        </p>
        <p className="text-sm text-soma-fg-primary leading-snug mt-0.5 line-clamp-1">
          {title}
        </p>
        <p
          className="text-[11px] text-soma-fg-secondary leading-snug mt-1 line-clamp-2"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {description}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="
          text-soma-fg-muted hover:text-soma-fg-primary
          text-lg leading-none px-1
          transition-colors flex-shrink-0
        "
        aria-label={t('main:trophies.toastDismiss')}
      >
        ×
      </button>
    </div>
  );
}