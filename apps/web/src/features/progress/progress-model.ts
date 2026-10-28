import {
  isProgressTitleId,
  isProgressTitleUnlocked,
  isProgressXp,
  progressFromTotalXp,
  type ProgressTitleId,
} from "@soma/shared-types";

/** UI snapshot. Level and unlocks always come from shared-types + totalXp. */
export interface ProgressView {
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  xpForNextLevel: number;
  percentToNextLevel: number;
  unlockedTitleIds: ProgressTitleId[];
  equippedTitleId: ProgressTitleId;
}

export function progressViewFromTotalXp(
  totalXp: number,
  equippedTitleId: ProgressTitleId,
): ProgressView {
  const breakdown = progressFromTotalXp(totalXp);
  const equipped =
    isProgressTitleUnlocked(equippedTitleId, breakdown.level)
      ? equippedTitleId
      : breakdown.unlockedTitleIds[0] ?? "walker";
  return { ...breakdown, equippedTitleId: equipped };
}

export function parseProgressPayload(raw: unknown): ProgressView {
  if (raw == null || typeof raw !== "object") {
    throw new Error("Invalid progress payload");
  }
  const body = raw as Record<string, unknown>;
  if (!isProgressXp(body.totalXp)) {
    throw new Error("Invalid progress XP");
  }
  if (typeof body.equippedTitleId !== "string" || !isProgressTitleId(body.equippedTitleId)) {
    throw new Error("Invalid equippedTitleId");
  }
  return progressViewFromTotalXp(body.totalXp, body.equippedTitleId);
}

export function equipProgressView(
  current: ProgressView,
  titleId: string,
): ProgressView {
  if (!isProgressTitleId(titleId)) {
    throw new Error("Invalid equippedTitleId");
  }
  if (!isProgressTitleUnlocked(titleId, current.level)) {
    throw new Error("Title is not unlocked");
  }
  return progressViewFromTotalXp(current.totalXp, titleId);
}
