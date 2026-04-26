import type {
  ConfidenceLevel,
  RecoveryCurveShape,
  SubstanceCategory,
  SubstanceId,
  OrganId,
  BodySystem,
  AchievementTier,
} from '@soma/shared-types';

/**
 * Shape of the response returned by GET /substances on the API.
 *
 * Matches the Prisma `findMany` query with nested includes for damage
 * profiles, recovery curves, and achievements (each with their related
 * organ hydrated).
 *
 * If the backend response shape changes, update these types to match.
 */

export interface ApiOrgan {
  id: OrganId;
  name: string;
  system: BodySystem;
  shortDescription: string;
}

export interface ApiDamageProfile {
  id: string;
  organId: OrganId;
  substanceId: SubstanceId;
  maxSeverity: number;
  confidenceLevel: ConfidenceLevel;
  referenceSource: string;
  organ: ApiOrgan;
}

export interface ApiRecoveryCurve {
  id: string;
  organId: OrganId;
  substanceId: SubstanceId;
  shape: RecoveryCurveShape;
  daysTo95Recovery: number;
  recoveryCeiling: number;
  confidenceLevel: ConfidenceLevel;
  referenceSource: string;
  organ: ApiOrgan;
}

export interface ApiAchievement {
  id: string;
  tier: AchievementTier;
  title: string;
  physiologicalDescription: string;
  triggerOrganId: OrganId;
  triggerSubstanceId: SubstanceId;
  triggerRecoveryThreshold: number;
  triggerOrgan: ApiOrgan;
}

export interface ApiSubstance {
  id: SubstanceId;
  name: string;
  category: SubstanceCategory;
  shortDescription: string;
  damageProfiles: ApiDamageProfile[];
  recoveryCurves: ApiRecoveryCurve[];
  achievements: ApiAchievement[];
}