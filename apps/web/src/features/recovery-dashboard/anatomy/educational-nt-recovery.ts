import {
  educationalNtQualitativeProfiles,
  type EducationalNtConfidence,
  type EducationalNtDirection,
  type EducationalNtPhase,
  type EducationalNtQualitativeProfile,
  type EducationalNtSeverity,
} from "./educational-nt-qualitative-catalog.js";
import type { EducationalNeurotransmitter } from "./neurotransmitter-education.js";

/** Catalog phase shown as a labeled educational example. Not the user's current phase. */
export const ILLUSTRATIVE_NT_PHASE: EducationalNtPhase = "post_acute";

export interface EducationalNtRecoveryRow {
  substanceId: string;
  neurotransmitter: EducationalNeurotransmitter;
  mechanismKey: string;
  direction: EducationalNtDirection;
  severity: EducationalNtSeverity;
  illustrativePhase: EducationalNtPhase;
  confidence: EducationalNtConfidence;
}

export interface EducationalNtRecoveryView {
  substanceId: string;
  illustrativePhase: EducationalNtPhase;
  showAlcoholClinicalWarning: boolean;
  rows: readonly EducationalNtRecoveryRow[];
}

export function presentEducationalNtRecovery(
  substanceId: string,
  catalog: readonly EducationalNtQualitativeProfile[] = educationalNtQualitativeProfiles,
): EducationalNtRecoveryView {
  const phase = ILLUSTRATIVE_NT_PHASE;
  const rows: EducationalNtRecoveryRow[] = [];
  for (const profile of catalog) {
    if (profile.substanceId !== substanceId) continue;
    const qualitative = profile.cells.find((item) => item.phase === phase);
    if (!qualitative) continue;
    rows.push({
      substanceId,
      neurotransmitter: profile.neurotransmitter,
      mechanismKey: profile.mechanismKey,
      direction: qualitative.direction,
      severity: qualitative.severity,
      illustrativePhase: phase,
      confidence: profile.confidenceLevel,
    });
  }
  return {
    substanceId,
    illustrativePhase: phase,
    showAlcoholClinicalWarning: substanceId === "alcohol",
    rows,
  };
}
