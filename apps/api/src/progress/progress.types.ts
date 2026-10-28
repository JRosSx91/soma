import type { ProgressTitleId } from "@soma/shared-types";

export interface AwardXpInput {
  source: string;
  sourceKey: string;
}

export interface AwardXpResult {
  created: boolean;
  totalXp: number;
}

export interface ProgressResponse {
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  xpForNextLevel: number;
  percentToNextLevel: number;
  unlockedTitleIds: ProgressTitleId[];
  equippedTitleId: ProgressTitleId;
}
