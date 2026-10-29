import {
  TEMPORAL_THRESHOLDS,
  temporalAchievementId,
  temporalTierForDays,
  temporalTitleKey,
  type TemporalMedalTier,
  type TemporalMilestoneState,
} from "@soma/shared-types";

export type TemporalRailMark = "complete" | "current" | "upcoming" | "unavailable";

export interface TemporalRailNode {
  thresholdDays: number;
  achievementId: string;
  titleKey: string;
  tier: TemporalMedalTier;
  mark: TemporalRailMark;
  clockReached: boolean;
  persistedUnlock: boolean;
}

/**
 * Ten GAME-01 nodes for one substance. Clock state comes from GAME-02;
 * persisted unlocks are optional LIVE rows and never invent medals.
 */
export function buildTemporalRail(
  state: TemporalMilestoneState | undefined,
  persistedIds: ReadonlySet<string> = new Set(),
): TemporalRailNode[] {
  const substanceId = state?.substanceId;
  const days = state?.daysAbstinent;
  const nextDays = state?.status === "upcoming" ? state.next?.thresholdDays : null;
  const clockReady =
    state != null &&
    (state.status === "upcoming" || state.status === "complete") &&
    days != null;

  return TEMPORAL_THRESHOLDS.map((thresholdDays) => {
    const achievementId = substanceId
      ? temporalAchievementId(substanceId, thresholdDays)
      : `pending-temporal-${thresholdDays}`;
    const persistedUnlock = Boolean(substanceId) && persistedIds.has(achievementId);
    const clockReached = clockReady && days != null && days >= thresholdDays;
    let mark: TemporalRailMark = "unavailable";
    if (clockReady) {
      if (nextDays === thresholdDays) mark = "current";
      else if (clockReached) mark = "complete";
      else mark = "upcoming";
    }
    return {
      thresholdDays,
      achievementId,
      titleKey: temporalTitleKey(
        substanceId ? achievementId : temporalAchievementId("cannabis", thresholdDays),
      ),
      tier: temporalTierForDays(thresholdDays),
      mark,
      clockReached,
      persistedUnlock,
    };
  });
}

export function temporalRailReachedCount(nodes: readonly TemporalRailNode[]): number {
  return nodes.filter((node) => node.mark === "complete").length;
}

/**
 * Fill along the ten GAME-01 nodes, as a 0–1 ratio of the line that runs
 * from the first medal centre to the last. Interpolates inside the current
 * interval; never uses a linear 0–365 scale.
 */
export function temporalRailProgressRatio(daysAbstinent: number | null | undefined): number {
  const last = TEMPORAL_THRESHOLDS.length - 1;
  if (last <= 0) return 0;
  if (daysAbstinent == null || !Number.isFinite(daysAbstinent) || daysAbstinent < TEMPORAL_THRESHOLDS[0]!) {
    return 0;
  }
  if (daysAbstinent >= TEMPORAL_THRESHOLDS[last]!) return 1;

  let reached = 0;
  for (let index = 0; index < TEMPORAL_THRESHOLDS.length; index += 1) {
    const threshold = TEMPORAL_THRESHOLDS[index]!;
    if (daysAbstinent >= threshold) reached = index;
    else break;
  }
  if (reached >= last) return 1;
  const previous = TEMPORAL_THRESHOLDS[reached]!;
  const upcoming = TEMPORAL_THRESHOLDS[reached + 1]!;
  const span = upcoming - previous;
  const fraction = span <= 0 ? 0 : (daysAbstinent - previous) / span;
  return (reached + Math.min(1, Math.max(0, fraction))) / last;
}
