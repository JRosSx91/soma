import type { AchievementTier } from '../types.js';

interface TrophyIconProps {
  tier: AchievementTier;
  unlocked: boolean;
  size?: number;
}

/**
 * SVG-only trophy icon. Color and inner detail depend on tier.
 * When `unlocked = false`, the trophy is rendered desaturated
 * via opacity reduction.
 *
 * This is the v1 visual. PR 18 will replace these with proper
 * trophy artwork.
 */
const TIER_COLORS: Record<AchievementTier, { primary: string; secondary: string }> = {
  bronze: { primary: '#CD7F32', secondary: '#8B5A2B' },
  silver: { primary: '#C0C0C0', secondary: '#7F7F7F' },
  gold:   { primary: '#FFD700', secondary: '#B8860B' },
  platinum: { primary: '#E5E4E2', secondary: '#A8A8A8' },
};

export function TrophyIcon({ tier, unlocked, size = 64 }: TrophyIconProps) {
  const { primary, secondary } = TIER_COLORS[tier];
  const opacity = unlocked ? 1 : 0.25;
  const filter = unlocked ? 'none' : 'grayscale(0.7)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, filter }}
      aria-hidden="true"
    >
      {/* Cup body */}
      <path
        d="M 18 14 L 18 30 Q 18 42 32 42 Q 46 42 46 30 L 46 14 Z"
        fill={primary}
        stroke={secondary}
        strokeWidth="1.5"
      />

      {/* Side handles */}
      <path
        d="M 18 18 Q 10 18 10 24 Q 10 30 18 30"
        fill="none"
        stroke={secondary}
        strokeWidth="2"
      />
      <path
        d="M 46 18 Q 54 18 54 24 Q 54 30 46 30"
        fill="none"
        stroke={secondary}
        strokeWidth="2"
      />

      {/* Stem */}
      <rect x="29" y="42" width="6" height="6" fill={secondary} />

      {/* Base */}
      <rect x="22" y="48" width="20" height="3" fill={secondary} />
      <rect x="20" y="51" width="24" height="4" fill={primary} stroke={secondary} strokeWidth="1" />

      {/* Highlight */}
      <ellipse cx="26" cy="22" rx="3" ry="6" fill="white" opacity="0.3" />
    </svg>
  );
}