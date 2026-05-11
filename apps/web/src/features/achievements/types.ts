export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * Mirrors the response of GET /me/achievements from the backend.
 * The user-facing strings are i18n keys; the frontend resolves them
 * via the `achievements` namespace.
 */
export interface AchievementWithUnlockState {
  id: string;
  tier: AchievementTier;
  titleKey: string;
  descriptionKey: string;
  triggerOrganId: string;
  triggerSubstanceId: string;
  triggerRecoveryThreshold: number;
  hidden: boolean;
  unlocked: boolean;
  unlockedAt: string | null;
  notifiedAt: string | null;
}