import type { OrganId } from "./organs";
import type { SubstanceId } from './substances.js';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementTrigger {
  organId: OrganId;
  substanceId: SubstanceId;
  recoveryThreshold: number;
}

export interface Achievement {
  id: string;
  tier: AchievementTier;
  title: string;
  physiologicalDescription: string;
  trigger: AchievementTrigger;
}