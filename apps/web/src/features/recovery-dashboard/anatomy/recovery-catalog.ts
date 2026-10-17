import type { OrganId, RecoveryCurveShape, SubstanceId } from "@soma/shared-types";
import { recoveryCurves } from "./recovery-curves.generated.ts";

/**
 * Typed educational adapter over the Soma 1.0 recovery-curve seed.
 *
 * Curve values come from `recovery-curves.generated.ts`, produced from
 * `apps/api/prisma/seed/recovery-curves.ts` at build/dev time.
 * This module does not compute personal recovery or alter curve parameters.
 */

export type RecoveryConfidence = "high" | "medium" | "low";

interface RecoveryCurveProfile {
  organId: OrganId;
  substanceId: SubstanceId;
  shape: RecoveryCurveShape;
  daysTo95Recovery: number;
  recoveryCeiling: number;
  confidenceLevel: RecoveryConfidence;
  referenceSource: string;
}

const confidenceLabel: Record<RecoveryConfidence, string> = {
  high: "alta",
  medium: "media",
  low: "baja",
};

const shapeLabel: Record<RecoveryCurveShape, string> = {
  logarithmic: "logarítmica",
  sigmoidal: "sigmoidal",
  linear: "lineal",
  stepwise: "por hitos",
};

/** Seed pairs. Order is the deterministic fallback when the current substance is absent. */
const recoveryProfiles: readonly RecoveryCurveProfile[] = recoveryCurves.map((curve) => ({
  organId: curve.organId as OrganId,
  substanceId: curve.substanceId as SubstanceId,
  shape: curve.shape,
  daysTo95Recovery: curve.daysTo95Recovery,
  recoveryCeiling: curve.recoveryCeiling,
  confidenceLevel: curve.confidenceLevel,
  referenceSource: curve.referenceSource,
}));

export interface EducationalRecoveryCurve {
  organId: OrganId;
  substanceId: SubstanceId;
  shape: RecoveryCurveShape;
  shapeLabel: string;
  daysTo95Recovery: number;
  /** Catalog ceiling as a percentage string, e.g. "95%". */
  ceilingPercentLabel: string;
  confidenceLevel: RecoveryConfidence;
  confidenceLabel: string;
  referenceSource: string;
  personalized: false;
}

export function recoverySubstances(organId: string): SubstanceId[] {
  return recoveryProfiles
    .filter((profile) => profile.organId === organId)
    .map((profile) => profile.substanceId);
}

export function selectRecoverySubstance(
  current: string | null,
  organId: string,
): SubstanceId | null {
  const available = recoverySubstances(organId);
  if (available.length === 0) return null;
  if (current && available.includes(current as SubstanceId)) {
    return current as SubstanceId;
  }
  return available[0] ?? null;
}

export function resolveEducationalRecovery(
  organId: string,
  substanceId: string,
): EducationalRecoveryCurve | null {
  const profile = recoveryProfiles.find(
    (item) => item.organId === organId && item.substanceId === substanceId,
  );
  if (!profile) return null;

  return {
    organId: profile.organId,
    substanceId: profile.substanceId,
    shape: profile.shape,
    shapeLabel: shapeLabel[profile.shape],
    daysTo95Recovery: profile.daysTo95Recovery,
    ceilingPercentLabel: `${Math.round(profile.recoveryCeiling * 100)}%`,
    confidenceLevel: profile.confidenceLevel,
    confidenceLabel: confidenceLabel[profile.confidenceLevel],
    referenceSource: profile.referenceSource,
    personalized: false,
  };
}

export function recoveryCatalogPairs(): ReadonlyArray<{
  organId: OrganId;
  substanceId: SubstanceId;
  daysTo95Recovery: number;
  recoveryCeiling: number;
  shape: RecoveryCurveShape;
  confidenceLevel: RecoveryConfidence;
  referenceSource: string;
}> {
  return recoveryProfiles.map((profile) => ({
    organId: profile.organId,
    substanceId: profile.substanceId,
    daysTo95Recovery: profile.daysTo95Recovery,
    recoveryCeiling: profile.recoveryCeiling,
    shape: profile.shape,
    confidenceLevel: profile.confidenceLevel,
    referenceSource: profile.referenceSource,
  }));
}
