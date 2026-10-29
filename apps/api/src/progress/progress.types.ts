import type { ProgressTitleId } from "@soma/shared-types";

export interface AwardXpInput {
  source: string;
  sourceKey: string;
}

export type AwardXpStatus = "awarded" | "duplicate" | "capped";

export interface AwardXpResult {
  status: AwardXpStatus;
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
