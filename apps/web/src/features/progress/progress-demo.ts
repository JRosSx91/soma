import { totalXpToReach, type ProgressTitleId } from "@soma/shared-types";
import { progressViewFromTotalXp, type ProgressView } from "./progress-model.js";

/**
 * Local DEMO snapshot only. Never sent over HTTP.
 * Level 12 with cartographer equipped; XP sits inside the level-12 band.
 */
export const DEMO_PROGRESS_LEVEL = 12;
export const DEMO_PROGRESS_EQUIPPED_TITLE_ID = "cartographer" as const;

const levelStart = totalXpToReach(DEMO_PROGRESS_LEVEL);
const band = totalXpToReach(DEMO_PROGRESS_LEVEL + 1) - levelStart;

export const DEMO_PROGRESS_TOTAL_XP = levelStart + Math.floor(band / 2);

export function buildDemoProgress(
  equippedTitleId: ProgressTitleId = DEMO_PROGRESS_EQUIPPED_TITLE_ID,
): ProgressView {
  return progressViewFromTotalXp(DEMO_PROGRESS_TOTAL_XP, equippedTitleId);
}

export const DEMO_PROGRESS: ProgressView = buildDemoProgress();
