export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

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
  /**
   * Share of the catalog threshold already covered, in [0, 1].
   * Null when the model cannot calculate it. Heuristic, not clinical.
   * Absent on responses from an older API.
   */
  achievementProgress?: number | null;
  progressAvailability?:
    | "ready"
    | "not_tracked"
    | "active_use"
    | "missing_date"
    | "pending_review"
    | "concealed";
}
