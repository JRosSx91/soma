import type {
  ConfidenceLevel,
  RecoveryCurveShape,
  SubstanceCategory,
  SubstanceId,
  OrganId,
  BodySystem,
  AchievementTier,
} from '@soma/shared-types';

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